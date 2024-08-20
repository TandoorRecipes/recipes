from django.core.cache import caches
from decimal import Decimal

from cookbook.helper.cache_helper import CacheHelper
from cookbook.models import Ingredient, Unit

CONVERSION_TABLE = {
    'weight': {
        'g': 1000,
        'kg': 1,
        'ounce': 35.274,
        'pound': 2.20462
    },
    'volume': {
        'ml': 1000,
        'l': 1,
        'fluid_ounce': 33.814,
        'pint': 2.11338,
        'quart': 1.05669,
        'gallon': 0.264172,
        'tbsp': 67.628,
        'tsp': 202.884,
        'us_cup': 4.22675,
        'imperial_fluid_ounce': 35.1951,
        'imperial_pint': 1.75975,
        'imperial_quart': 0.879877,
        'imperial_gallon': 0.219969,
        'imperial_tbsp': 56.3121,
        'imperial_tsp': 168.936,
    },
}

BASE_UNITS_WEIGHT = list(CONVERSION_TABLE['weight'].keys())
BASE_UNITS_VOLUME = list(CONVERSION_TABLE['volume'].keys())


class ConversionException(Exception):
    pass


class UnitConversionHelper:
    space = None

    def __init__(self, space):
        """
        Initializes unit conversion helper
        :param space: space to perform conversions on
        """
        self.space = space

    @staticmethod
    def convert_from_to(from_unit, to_unit, amount):
        """
        Convert from one base unit to another. Throws ConversionException if trying to convert between different systems (weight/volume) or if units are not supported.
        :param from_unit: str unit to convert from
        :param to_unit: str unit to convert to
        :param amount: amount to convert
        :return: Decimal converted amount
        """
        system = None
        if from_unit in BASE_UNITS_WEIGHT and to_unit in BASE_UNITS_WEIGHT:
            system = 'weight'
        if from_unit in BASE_UNITS_VOLUME and to_unit in BASE_UNITS_VOLUME:
            system = 'volume'

        if not system:
            raise ConversionException('Trying to convert units not existing or not in one unit system (weight/volume)')

        return Decimal(amount / Decimal(CONVERSION_TABLE[system][from_unit] / CONVERSION_TABLE[system][to_unit]))

    def base_conversions(self, ingredient_list):
        """
        Calculates all possible base unit conversions for each ingredient give.
        Converts to all common base units IF they exist in the unit database of the space.
        For useful results all ingredients passed should be of the same food, otherwise filtering afterwards might be required.
        :param ingredient_list: list of ingredients to convert
        :return: ingredient list with appended conversions
        """
        base_conversion_ingredient_list = ingredient_list.copy()
        for i in ingredient_list:
            try:
                conversion_unit = i.unit.name
                if i.unit.base_unit:
                    conversion_unit = i.unit.base_unit

                # TODO allow setting which units to convert to? possibly only once conversions become visible
                units = caches['default'].get(CacheHelper(self.space).BASE_UNITS_CACHE_KEY, None)
                if not units:
                    units = Unit.objects.filter(space=self.space, base_unit__in=(BASE_UNITS_VOLUME + BASE_UNITS_WEIGHT)).all()
                    caches['default'].set(CacheHelper(self.space).BASE_UNITS_CACHE_KEY, units, 60 * 60)  # cache is cleared on unit save signal so long duration is fine

                for u in units:
                    try:
                        ingredient = Ingredient(amount=self.convert_from_to(conversion_unit, u.base_unit, i.amount), unit=u, food=ingredient_list[0].food, )
                        if not any((x.unit.name == ingredient.unit.name or x.unit.base_unit == ingredient.unit.name) for x in base_conversion_ingredient_list):
                            base_conversion_ingredient_list.append(ingredient)
                    except ConversionException:
                        pass
            except Exception:
                pass

        return base_conversion_ingredient_list

    def get_conversions(self, ingredient):
        """
        Converts an ingredient to all possible conversions based on the custom unit conversion database.
        After that passes conversion to UnitConversionHelper.base_conversions() to get all base conversions possible.
        :param ingredient: Ingredient object
        :return: list of ingredients with all possible custom and base conversions
        """
        conversions = [ingredient]
        if ingredient.unit:
            for c in ingredient.unit.unit_conversion_base_relation.all():
                if c.space == self.space:
                    r = self._uc_convert(c, ingredient.amount, ingredient.unit, ingredient.food)
                    if r and r not in conversions:
                        conversions.append(r)
            for c in ingredient.unit.unit_conversion_converted_relation.all():
                if c.space == self.space:
                    r = self._uc_convert(c, ingredient.amount, ingredient.unit, ingredient.food)
                    if r and r not in conversions:
                        conversions.append(r)

        conversions = self.base_conversions(conversions)

        return conversions

    def _uc_convert(self, uc, amount, unit, food):
        """
        Helper to calculate values for custom unit conversions.
        Converts given base values using the passed UnitConversion object into a converted Ingredient
        :param uc: UnitConversion object
        :param amount: base amount
        :param unit: base unit
        :param food: base food
        :return: converted ingredient object from base amount/unit/food
        """
        if uc.food is None or uc.food == food:
            if unit == uc.base_unit:
                return Ingredient(amount=amount * (uc.converted_amount / uc.base_amount), unit=uc.converted_unit, food=food, space=self.space)
            else:
                return Ingredient(amount=amount * (uc.base_amount / uc.converted_amount), unit=uc.base_unit, food=food, space=self.space)
