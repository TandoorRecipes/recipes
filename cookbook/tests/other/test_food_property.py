from decimal import Decimal

from django.contrib import auth
from django.core.cache import caches
from django_scopes import scopes_disabled

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.property_helper import FoodPropertyHelper
from cookbook.models import Food, Ingredient, Property, PropertyType, Recipe, Step, Unit, UnitConversion


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


def test_no_unit_uses_default_unit_with_conversion(space_1, u1_s1):
    """Ingredient without unit uses space's default_unit, conversion exists - calculates correctly."""
    with scopes_disabled():
        # Given: space has default_unit=pcs, food has properties per 100g, conversion 1pcs=60g exists
        unit_pcs = Unit.objects.create(name='pcs', space=space_1)
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)

        space_1.default_unit = unit_pcs
        space_1.save()

        food = Food.objects.create(name='lemon', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        property_type = PropertyType.objects.create(name='vitamin_c', space=space_1)
        prop = Property.objects.create(property_amount=50, property_type=property_type, space=space_1)
        food.properties.add(prop)

        UnitConversion.objects.create(
            base_amount=60,
            base_unit=unit_gram,
            converted_amount=1,
            converted_unit=unit_pcs,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        recipe = Recipe.objects.create(name='test', space=space_1, created_by=auth.get_user(u1_s1))
        step = Step.objects.create(instruction='test', space=space_1)
        step.ingredients.create(amount=2, unit=None, food=food, space=space_1)  # 2 lemons, no unit
        recipe.steps.add(step)

        # When: calculating recipe properties
        result = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe)

        # Then: property is calculated using default unit (2 pcs * 60g/pcs = 120g, 120g/100g * 50 = 60)
        assert abs(result[property_type.id]['total_value'] - Decimal(60)) < 0.0001
        assert 'missing_unit' not in result[property_type.id]['food_values'][food.id]


def test_no_unit_and_no_default_unit_marks_missing_unit(space_1, u1_s1):
    """Ingredient without unit and no space default_unit - marks missing_unit."""
    with scopes_disabled():
        # Given: space has no default_unit, ingredient has no unit
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)

        space_1.default_unit = None
        space_1.save()

        food = Food.objects.create(name='lemon', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        property_type = PropertyType.objects.create(name='vitamin_c', space=space_1)
        prop = Property.objects.create(property_amount=50, property_type=property_type, space=space_1)
        food.properties.add(prop)

        recipe = Recipe.objects.create(name='test', space=space_1, created_by=auth.get_user(u1_s1))
        step = Step.objects.create(instruction='test', space=space_1)
        step.ingredients.create(amount=2, unit=None, food=food, space=space_1)
        recipe.steps.add(step)

        # When: calculating recipe properties
        result = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe)

        # Then: result is marked as missing_unit, total is 0
        assert result[property_type.id]['total_value'] == 0
        assert result[property_type.id]['food_values'][food.id]['missing_unit'] is True


def test_no_unit_default_unit_missing_conversion_shows_details(space_1, u1_s1):
    """Ingredient without unit, default_unit set but conversion missing - shows missing_conversion details."""
    with scopes_disabled():
        # Given: space has default_unit=pcs, food has properties per gram, but NO conversion pcs->gram
        unit_pcs = Unit.objects.create(name='pcs', space=space_1)
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)

        space_1.default_unit = unit_pcs
        space_1.save()

        food = Food.objects.create(name='lemon', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        property_type = PropertyType.objects.create(name='vitamin_c', space=space_1)
        prop = Property.objects.create(property_amount=50, property_type=property_type, space=space_1)
        food.properties.add(prop)

        recipe = Recipe.objects.create(name='test', space=space_1, created_by=auth.get_user(u1_s1))
        step = Step.objects.create(instruction='test', space=space_1)
        step.ingredients.create(amount=2, unit=None, food=food, space=space_1)
        recipe.steps.add(step)

        # When: calculating recipe properties
        result = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe)

        # Then: missing_conversion shows which units need a conversion (pcs -> gram)
        assert result[property_type.id]['missing_value'] is True
        assert result[property_type.id]['food_values'][food.id]['value'] is None
        assert 'missing_unit' not in result[property_type.id]['food_values'][food.id]
        assert 'missing_conversion' in result[property_type.id]['food_values'][food.id]
        assert result[property_type.id]['food_values'][food.id]['missing_conversion']['base_unit']['id'] == unit_pcs.id
        assert result[property_type.id]['food_values'][food.id]['missing_conversion']['converted_unit']['id'] == unit_gram.id


def test_no_unit_default_unit_matches_property_unit_no_conversion_needed(space_1, u1_s1):
    """Ingredient without unit, default_unit same as food's property unit - calculates without conversion."""
    with scopes_disabled():
        # Given: space has default_unit=gram, food has properties per gram (same unit, no conversion needed)
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)

        space_1.default_unit = unit_gram
        space_1.save()

        food = Food.objects.create(name='flour', space=space_1, properties_food_unit=unit_gram, properties_food_amount=100)
        property_type = PropertyType.objects.create(name='calories', space=space_1)
        prop = Property.objects.create(property_amount=364, property_type=property_type, space=space_1)
        food.properties.add(prop)

        recipe = Recipe.objects.create(name='test', space=space_1, created_by=auth.get_user(u1_s1))
        step = Step.objects.create(instruction='test', space=space_1)
        step.ingredients.create(amount=200, unit=None, food=food, space=space_1)
        recipe.steps.add(step)

        # When: calculating recipe properties
        result = FoodPropertyHelper(space_1).calculate_recipe_properties(recipe)

        # Then: property is calculated directly (200g / 100g * 364 = 728 calories)
        assert abs(result[property_type.id]['total_value'] - Decimal(728)) < 0.0001
        assert 'missing_unit' not in result[property_type.id]['food_values'][food.id]
        assert 'missing_conversion' not in result[property_type.id]['food_values'][food.id]
