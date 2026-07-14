from decimal import Decimal

from django.contrib import auth
from django.core.cache import caches
from django_scopes import scopes_disabled

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.property_helper import FoodPropertyHelper
from cookbook.models import Food, Property, PropertyType, Recipe, Step, Unit, UnitConversion


def test_food_property(space_1, space_2, u1_s1):
    with scopes_disabled():
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)
        unit_kg = Unit.objects.create(name='kg', base_unit='kg', space=space_1)
        unit_pcs = Unit.objects.create(name='pcs', base_unit='', space=space_1)
        unit_floz1 = Unit.objects.create(name='fl. oz 1', base_unit='imperial_fluid_ounce', space=space_1)  # US and UK use different volume systems (US vs imperial)
        unit_floz2 = Unit.objects.create(name='fl. oz 2', base_unit='fluid_ounce', space=space_1)
        unit_fantasy = Unit.objects.create(name='Fantasy Unit', base_unit='', space=space_1)

        food_1 = Food.objects.create(name='food_1', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        food_2 = Food.objects.create(name='food_2', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)

        property_fat = PropertyType.objects.create(name='property_fat', space=space_1)
        property_calories = PropertyType.objects.create(name='property_calories', space=space_1)
        property_nuts = PropertyType.objects.create(name='property_nuts', space=space_1)
        property_price = PropertyType.objects.create(name='property_price', space=space_1)

        food_1_property_fat = Property.objects.create(property_amount=50, property_type=property_fat, space=space_1)
        food_1_property_nuts = Property.objects.create(property_amount=1, property_type=property_nuts, space=space_1)
        food_1_property_price = Property.objects.create(property_amount=7.50, property_type=property_price, space=space_1)
        food_1.properties.add(food_1_property_fat, food_1_property_nuts, food_1_property_price)

        food_2_property_fat = Property.objects.create(property_amount=25, property_type=property_fat, space=space_1)
        food_2_property_nuts = Property.objects.create(property_amount=0, property_type=property_nuts, space=space_1)
        food_2_property_price = Property.objects.create(property_amount=2.50, property_type=property_price, space=space_1)
        food_2.properties.add(food_2_property_fat, food_2_property_nuts, food_2_property_price)

        print('\n----------- TEST PROPERTY - PROPERTY CALCULATION MULTI STEP IDENTICAL UNIT ---------------')
        recipe_1 = Recipe.objects.create(name='recipe_1', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1))

        step_1 = Step.objects.create(instruction='instruction_step_1', space=space_1)
        step_1.ingredients.create(amount=500, unit=unit_gram, food=food_1, space=space_1)
        step_1.ingredients.create(amount=1000, unit=unit_gram, food=food_2, space=space_1)
        recipe_1.steps.add(step_1)

        step_2 = Step.objects.create(instruction='instruction_step_1', space=space_1)
        step_2.ingredients.create(amount=50, unit=unit_gram, food=food_1, space=space_1)
        recipe_1.steps.add(step_2)

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_1)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert abs(property_values[property_fat.id]['total_value'] - Decimal(525)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_1.id]['value'] - Decimal(275)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_2.id]['value'] - Decimal(250)) < 0.0001

        print('\n----------- TEST PROPERTY - PROPERTY CALCULATION NO POSSIBLE CONVERSION ---------------')
        recipe_2 = Recipe.objects.create(name='recipe_2', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1))

        step_1 = Step.objects.create(instruction='instruction_step_1', space=space_1)
        step_1.ingredients.create(amount=5, unit=unit_pcs, food=food_1, space=space_1)
        step_1.ingredients.create(amount=10, unit=unit_pcs, food=food_2, space=space_1)
        recipe_2.steps.add(step_1)

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_2)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert abs(property_values[property_fat.id]['total_value']) < 0.0001
        assert property_values[property_fat.id]['food_values'][food_1.id]['value'] is None

        print('\n----------- TEST PROPERTY - PROPERTY CALCULATION UNIT CONVERSION ---------------')
        uc1 = UnitConversion.objects.create(
            base_amount=100,
            base_unit=unit_gram,
            converted_amount=1,
            converted_unit=unit_pcs,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_2)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert abs(property_values[property_fat.id]['total_value'] - Decimal(500)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_1.id]['value'] - Decimal(250)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_2.id]['value'] - Decimal(250)) < 0.0001

        print('\n----------- TEST PROPERTY - PROPERTY CALCULATION UNIT CONVERSION MULTIPLE ---------------')

        uc1.delete()
        uc1 = UnitConversion.objects.create(
            base_amount=0.1,
            base_unit=unit_kg,
            converted_amount=1,
            converted_unit=unit_pcs,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_2)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert abs(property_values[property_fat.id]['total_value'] - Decimal(500)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_1.id]['value'] - Decimal(250)) < 0.0001
        assert abs(property_values[property_fat.id]['food_values'][food_2.id]['value'] - Decimal(250)) < 0.0001

        print('\n----------- TEST PROPERTY - MISSING FOOD REFERENCE AMOUNT ---------------')
        food_1.properties_food_unit = None
        food_1.save()
        food_2.properties_food_amount = 0
        food_2.save()

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_1)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert property_values[property_fat.id]['total_value'] == 0

        print('\n----------- TEST PROPERTY - SPACE SEPARATION ---------------')

        property_fat.space = space_2
        property_fat.save()

        caches['default'].delete(CacheHelper(space_1).PROPERTY_TYPE_CACHE_KEY)  # clear cache as objects won't change space in reality

        property_values = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe_2)

        assert property_fat.id not in property_values


def test_recipe_weight(space_1, space_2, u1_s1):
    with scopes_disabled():
        unit_gram = Unit.objects.create(name='gram_w', base_unit='g', space=space_1)
        unit_kg = Unit.objects.create(name='kg_w', base_unit='kg', space=space_1)
        unit_pcs = Unit.objects.create(name='pcs_w', base_unit='', space=space_1)

        food_flour = Food.objects.create(name='flour_w', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        food_sugar = Food.objects.create(name='sugar_w', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        food_egg = Food.objects.create(name='egg_w', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)

        pt_calories = PropertyType.objects.create(name='calories_w', space=space_1, unit='kcal')

        prop_flour_cal = Property.objects.create(property_amount=364, property_type=pt_calories, space=space_1)
        prop_sugar_cal = Property.objects.create(property_amount=400, property_type=pt_calories, space=space_1)
        prop_egg_cal = Property.objects.create(property_amount=155, property_type=pt_calories, space=space_1)
        food_flour.properties.add(prop_flour_cal)
        food_sugar.properties.add(prop_sugar_cal)
        food_egg.properties.add(prop_egg_cal)

        caches['default'].delete(CacheHelper(space_1).PROPERTY_TYPE_CACHE_KEY)

        print('\n----------- TEST RECIPE WEIGHT - GRAM UNITS ---------------')
        recipe = Recipe.objects.create(name='recipe_weight_1', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1), servings=1)
        step = Step.objects.create(instruction='step', space=space_1)
        step.ingredients.create(amount=500, unit=unit_gram, food=food_flour, space=space_1)
        step.ingredients.create(amount=500, unit=unit_gram, food=food_sugar, space=space_1)
        recipe.steps.add(step)

        fph = FoodPropertyHelper(space_1)
        result = fph.calculate_recipe_properties(recipe)

        assert abs(fph.total_weight_grams - Decimal(1000)) < 0.0001
        assert abs(result[pt_calories.id]['total_value'] - Decimal(3820)) < 0.0001

        print('\n----------- TEST RECIPE WEIGHT - KG CONVERSION ---------------')
        recipe2 = Recipe.objects.create(name='recipe_weight_2', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1), servings=1)
        step2 = Step.objects.create(instruction='step', space=space_1)
        step2.ingredients.create(amount=1, unit=unit_kg, food=food_flour, space=space_1)
        step2.ingredients.create(amount=200, unit=unit_gram, food=food_sugar, space=space_1)
        recipe2.steps.add(step2)

        fph2 = FoodPropertyHelper(space_1)
        fph2.calculate_recipe_properties(recipe2)

        assert abs(fph2.total_weight_grams - Decimal(1200)) < 0.0001

        print('\n----------- TEST RECIPE WEIGHT - NO PCS CONVERSION ---------------')
        recipe3 = Recipe.objects.create(name='recipe_weight_3', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1), servings=1)
        step3 = Step.objects.create(instruction='step', space=space_1)
        step3.ingredients.create(amount=500, unit=unit_gram, food=food_flour, space=space_1)
        step3.ingredients.create(amount=2, unit=unit_pcs, food=food_egg, space=space_1)
        recipe3.steps.add(step3)

        fph3 = FoodPropertyHelper(space_1)
        fph3.calculate_recipe_properties(recipe3)

        assert abs(fph3.total_weight_grams - Decimal(500)) < 0.0001

        print('\n----------- TEST RECIPE WEIGHT - PCS CONVERSION ---------------')
        UnitConversion.objects.create(
            base_amount=100,
            base_unit=unit_gram,
            converted_amount=2,
            converted_unit=unit_pcs,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        fph4 = FoodPropertyHelper(space_1)
        fph4.calculate_recipe_properties(recipe3)

        assert abs(fph4.total_weight_grams - Decimal(600)) < 0.0001
