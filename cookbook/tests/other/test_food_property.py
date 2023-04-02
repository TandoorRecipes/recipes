from django.contrib import auth
from django_scopes import scopes_disabled

from cookbook.helper.food_property_helper import calculate_recipe_properties
from cookbook.helper.unit_conversion_helper import get_conversions
from cookbook.models import Unit, Food, Ingredient, UnitConversion, FoodPropertyType, FoodProperty, Recipe, Step


def test_food_property(space_1, u1_s1):
    with scopes_disabled():
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)
        unit_pcs = Unit.objects.create(name='pcs', base_unit='', space=space_1)
        unit_floz1 = Unit.objects.create(name='fl. oz 1', base_unit='imperial_fluid_ounce', space=space_1)  # US and UK use different volume systems (US vs imperial)
        unit_floz2 = Unit.objects.create(name='fl. oz 2', base_unit='fluid_ounce', space=space_1)
        unit_fantasy = Unit.objects.create(name='Fantasy Unit', base_unit='', space=space_1)

        food_1 = Food.objects.create(name='food_1', space=space_1)
        food_2 = Food.objects.create(name='food_2', space=space_1)

        property_fat = FoodPropertyType.objects.create(name='property_fat', space=space_1)
        property_calories = FoodPropertyType.objects.create(name='property_calories', space=space_1)
        property_nuts = FoodPropertyType.objects.create(name='property_nuts', space=space_1)
        property_price = FoodPropertyType.objects.create(name='property_price', space=space_1)

        food_1_property_fat = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=50, property_type=property_fat, space=space_1)
        food_1_property_nuts = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=1, property_type=property_nuts, space=space_1)
        food_1_property_price = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=7.50, property_type=property_price, space=space_1)

        food_2_property_fat = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=25, property_type=property_fat, space=space_1)
        food_2_property_nuts = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=0, property_type=property_nuts, space=space_1)
        food_2_property_price = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=2.50, property_type=property_price, space=space_1)

        recipe_1 = Recipe.objects.create(name='recipe_1', waiting_time=0, working_time=0, space=space_1, created_by=auth.get_user(u1_s1))

        step_1 = Step.objects.create(instruction='instruction_step_1', space=space_1)
        step_1.ingredients.create(amount=500, unit=unit_gram, food=food_1, space=space_1)
        step_1.ingredients.create(amount=1000, unit=unit_gram, food=food_2, space=space_1)
        recipe_1.steps.add(step_1)

        step_2 = Step.objects.create(instruction='instruction_step_1', space=space_1)
        step_2.ingredients.create(amount=50, unit=unit_gram, food=food_1, space=space_1)
        recipe_1.steps.add(step_2)

        property_values = calculate_recipe_properties(recipe_1)

        assert property_values[property_fat.id]['name'] == property_fat.name
        assert property_values[property_fat.id]['total_value'] == 525  # TODO manually validate those numbers
        assert property_values[property_fat.id]['food_values'][food_1.id] == 275  # TODO manually validate those numbers
        assert property_values[property_fat.id]['food_values'][food_2.id] == 250  # TODO manually validate those numbers
        print(property_values)
        # TODO more property tests
