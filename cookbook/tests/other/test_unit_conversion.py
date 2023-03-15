from django_scopes import scopes_disabled

from cookbook.helper.unit_conversion_helper import get_conversions
from cookbook.models import Unit, Food, Ingredient


def test_unit_conversions(space_1):
    with scopes_disabled():
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)
        unit_pcs = Unit.objects.create(name='pcs', base_unit='', space=space_1)
        unit_floz1 = Unit.objects.create(name='fl. oz 1', base_unit='imperial_fluid_ounce', space=space_1) # US and UK use different volume systems (US vs imperial)
        unit_floz2 = Unit.objects.create(name='fl. oz 2', base_unit='fluid_ounce', space=space_1)

        food_1 = Food.objects.create(name='Test Food 1', space=space_1)

        ingredient_food_1_gram = Ingredient.objects.create(
            food=food_1,
            unit=unit_gram,
            amount=100,
            space=space_1,
        )

        print('\n----------- TEST ---------------')
        print(get_conversions(ingredient_food_1_gram))

