from _decimal import Decimal

from django.contrib import auth
from django_scopes import scopes_disabled

from cookbook.helper.unit_conversion_helper import UnitConversionHelper, ConversionException
from cookbook.models import Unit, Food, Ingredient, UnitConversion


def test_base_converter(space_1):
    uch = UnitConversionHelper(space_1)
    assert abs(uch.convert_from_to('g', 'kg', 1234) - Decimal(1.234)) < 0.0001
    assert abs(uch.convert_from_to('kg', 'pound', 2) - Decimal(4.40924)) < 0.00001
    assert abs(uch.convert_from_to('kg', 'g', 1) - Decimal(1000)) < 0.00001
    assert abs(uch.convert_from_to('imperial_gallon', 'gallon', 1000) - Decimal(1200.95104)) < 0.00001
    assert abs(uch.convert_from_to('tbsp', 'ml', 20) - Decimal(295.73549)) < 0.00001

    try:
        assert uch.convert_from_to('kg', 'tbsp', 2) == 1234
        assert False
    except ConversionException:
        assert True

    try:
        assert uch.convert_from_to('kg', 'g2', 2) == 1234
        assert False
    except ConversionException:
        assert True


def test_unit_conversions(space_1, space_2, u1_s1):
    with scopes_disabled():
        uch = UnitConversionHelper(space_1)
        uch_space_2 = UnitConversionHelper(space_2)

        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=space_1)
        unit_kg = Unit.objects.create(name='kg', base_unit='kg', space=space_1)
        unit_pcs = Unit.objects.create(name='pcs', base_unit='', space=space_1)
        unit_floz1 = Unit.objects.create(name='fl. oz 1', base_unit='imperial_fluid_ounce', space=space_1)  # US and UK use different volume systems (US vs imperial)
        unit_floz2 = Unit.objects.create(name='fl. oz 2', base_unit='fluid_ounce', space=space_1)
        unit_fantasy = Unit.objects.create(name='Fantasy Unit', base_unit='', space=space_1)

        food_1 = Food.objects.create(name='Test Food 1', space=space_1)
        food_2 = Food.objects.create(name='Test Food 2', space=space_1)

        print('\n----------- TEST BASE CONVERSIONS - GRAM ---------------')
        ingredient_food_1_gram = Ingredient.objects.create(
            food=food_1,
            unit=unit_gram,
            amount=100,
            space=space_1,
        )

        conversions = uch.get_conversions(ingredient_food_1_gram)
        print(conversions)
        assert len(conversions) == 2
        assert next(x for x in conversions if x.unit == unit_kg) is not None
        assert abs(next(x for x in conversions if x.unit == unit_kg).amount - Decimal(0.1)) < 0.0001

        print('\n----------- TEST BASE CONVERSIONS - VOLUMES ---------------')

        ingredient_food_1_floz1 = Ingredient.objects.create(
            food=food_1,
            unit=unit_floz1,
            amount=100,
            space=space_1,
        )

        conversions = uch.get_conversions(ingredient_food_1_floz1)
        assert len(conversions) == 2
        assert next(x for x in conversions if x.unit == unit_floz2) is not None
        assert abs(next(x for x in conversions if x.unit == unit_floz2).amount - Decimal(96.07599404038842)) < 0.001  # TODO validate value

        print(conversions)

        unit_pint = Unit.objects.create(name='pint', base_unit='pint', space=space_1)
        conversions = uch.get_conversions(ingredient_food_1_floz1)
        assert len(conversions) == 3
        assert next(x for x in conversions if x.unit == unit_pint) is not None
        assert abs(next(x for x in conversions if x.unit == unit_pint).amount - Decimal(6.004749627524276)) < 0.001  # TODO validate value

        print(conversions)

        print('\n----------- TEST BASE CUSTOM CONVERSION - TO CUSTOM CONVERSION ---------------')
        UnitConversion.objects.create(
            base_amount=1000,
            base_unit=unit_gram,
            converted_amount=1337,
            converted_unit=unit_fantasy,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )
        conversions = uch.get_conversions(ingredient_food_1_gram)

        assert len(conversions) == 3
        assert next(x for x in conversions if x.unit == unit_fantasy) is not None
        assert abs(next(x for x in conversions if x.unit == unit_fantasy).amount - Decimal('133.700')) < 0.001  # TODO validate value

        print(conversions)

        print('\n----------- TEST CUSTOM CONVERSION - NO PCS ---------------')
        ingredient_food_1_pcs = Ingredient.objects.create(
            food=food_1,
            unit=unit_pcs,
            amount=5,
            space=space_1,
        )

        ingredient_food_2_pcs = Ingredient.objects.create(
            food=food_2,
            unit=unit_pcs,
            amount=5,
            space=space_1,
        )

        assert len(uch.get_conversions(ingredient_food_1_pcs)) == 1
        assert len(uch.get_conversions(ingredient_food_2_pcs)) == 1
        print(uch.get_conversions(ingredient_food_1_pcs))
        print(uch.get_conversions(ingredient_food_2_pcs))

        print('\n----------- TEST CUSTOM CONVERSION - PCS TO MULTIPLE BASE ---------------')
        uc1 = UnitConversion.objects.create(
            base_amount=1,
            base_unit=unit_pcs,
            converted_amount=200,
            converted_unit=unit_gram,
            food=food_1,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        conversions = uch.get_conversions(ingredient_food_1_pcs)
        assert len(conversions) == 3
        assert abs(next(x for x in conversions if x.unit == unit_gram).amount - Decimal(1000)) < 0.0001
        assert abs(next(x for x in conversions if x.unit == unit_kg).amount - Decimal(1)) < 0.0001
        print(conversions)

        assert len(uch.get_conversions(ingredient_food_2_pcs)) == 1
        print(uch.get_conversions(ingredient_food_2_pcs))

        print('\n----------- TEST CUSTOM CONVERSION - CONVERT MULTI STEP ---------------')

        # TODO add test for multi step conversion ... do I even do or want to support this ?

        print('\n----------- TEST CUSTOM CONVERSION - REVERSE CONVERSION ---------------')
        uc2 = UnitConversion.objects.create(
            base_amount=200,
            base_unit=unit_gram,
            converted_amount=1,
            converted_unit=unit_pcs,
            food=food_2,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )

        conversions = uch.get_conversions(ingredient_food_1_pcs)
        assert len(conversions) == 3
        assert abs(next(x for x in conversions if x.unit == unit_gram).amount - Decimal(1000)) < 0.0001
        assert abs(next(x for x in conversions if x.unit == unit_kg).amount - Decimal(1)) < 0.0001
        print(conversions)

        conversions = uch.get_conversions(ingredient_food_2_pcs)
        assert len(conversions) == 3
        assert abs(next(x for x in conversions if x.unit == unit_gram).amount - Decimal(1000)) < 0.0001
        assert abs(next(x for x in conversions if x.unit == unit_kg).amount - Decimal(1)) < 0.0001
        print(conversions)

        print('\n----------- TEST SPACE SEPARATION ---------------')
        uc2.space = space_2
        uc2.save()

        conversions = uch.get_conversions(ingredient_food_2_pcs)
        assert len(conversions) == 1
        print(conversions)

        conversions = uch_space_2.get_conversions(ingredient_food_1_gram)
        assert len(conversions) == 1
        assert not any(x for x in conversions if x.unit == unit_kg)
        print(conversions)

        unit_kg_space_2 = Unit.objects.create(name='kg', base_unit='kg', space=space_2)
        conversions = uch_space_2.get_conversions(ingredient_food_1_gram)
        assert len(conversions) == 2
        assert not any(x for x in conversions if x.unit == unit_kg)
        assert next(x for x in conversions if x.unit == unit_kg_space_2) is not None
        assert abs(next(x for x in conversions if x.unit == unit_kg_space_2).amount - Decimal(0.1)) < 0.0001
        print(conversions)
