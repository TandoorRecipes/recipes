from django.core.cache import caches
from pint import UnitRegistry, UndefinedUnitError, PintError

from cookbook.helper.cache_helper import CacheHelper
from cookbook.models import Ingredient, Unit

# basic units that should be considered for "to" conversions
# TODO possible remove this hardcoded units and just add a flag to the unit
CONVERT_TO_UNITS = {
    'metric': ['g', 'kg', 'ml', 'l'],
    'us': ['ounce', 'pound', 'fluid_ounce', 'pint', 'quart', 'gallon'],
    'uk': ['ounce', 'pound', 'imperial_fluid_ounce', 'imperial_pint', 'imperial_quart', 'imperial_gallon'],
}


class UnitConversionHelper:
    space = None

    def __init__(self, space):
        """
        Initializes unit conversion helper
        :param space: space to perform conversions on
        """
        self.space = space

    def base_conversions(self, ingredient_list):
        """
        Calculates all possible base unit conversions for each ingredient give.
        Converts to all common base units IF they exist in the unit database of the space.
        For useful results all ingredients passed should be of the same food, otherwise filtering afterwards might be required.
        :param ingredient_list: list of ingredients to convert
        :return: ingredient list with appended conversions
        """
        ureg = UnitRegistry()
        pint_converted_list = ingredient_list.copy()
        for i in ingredient_list:
            try:
                conversion_unit = i.unit.name
                if i.unit.base_unit:
                    conversion_unit = i.unit.base_unit
                quantitiy = ureg.Quantity(f'{i.amount} {conversion_unit}')

                # TODO allow setting which units to convert to? possibly only once conversions become visible
                units = caches['default'].get(CacheHelper(self.space).BASE_UNITS_CACHE_KEY, None)
                if not units:
                    units = Unit.objects.filter(space=self.space, base_unit__in=(CONVERT_TO_UNITS['metric'] + CONVERT_TO_UNITS['us'] + CONVERT_TO_UNITS['uk'])).all()
                    caches['default'].set(CacheHelper(self.space).BASE_UNITS_CACHE_KEY, units, 60 * 60)  # cache is cleared on unit save signal so long duration is fine

                for u in units:
                    try:
                        converted = quantitiy.to(u.base_unit)
                        ingredient = Ingredient(amount=converted.m, unit=u, food=ingredient_list[0].food, )
                        if not any((x.unit.name == ingredient.unit.name or x.unit.base_unit == ingredient.unit.name) for x in pint_converted_list):
                            pint_converted_list.append(ingredient)
                    except PintError:
                        pass
            except PintError:
                pass

        return pint_converted_list

    def get_conversions(self, ingredient):
        """
        Converts an ingredient to all possible conversions based on the custom unit conversion database.
        After that passes conversion to UnitConversionHelper.base_conversions() to get all base conversions possible.
        :param ingredient: Ingredient object
        :return: list of ingredients with all possible custom and base conversions
        """
        conversions = [ingredient]
        if ingredient.unit:
            for c in ingredient.unit.unit_conversion_base_relation.filter(space=self.space).all():
                r = self._uc_convert(c, ingredient.amount, ingredient.unit, ingredient.food)
                if r and r not in conversions:
                    conversions.append(r)
            for c in ingredient.unit.unit_conversion_converted_relation.filter(space=self.space).all():
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
                # return {
                #     'amount': amount * (uc.converted_amount / uc.base_amount),
                #     'unit': {
                #         'id': uc.converted_unit.id,
                #         'name': uc.converted_unit.name,
                #         'plural_name': uc.converted_unit.plural_name
                #     },
                # }
            else:
                return Ingredient(amount=amount * (uc.base_amount / uc.converted_amount), unit=uc.base_unit, food=food, space=self.space)
                # return {
                #     'amount': amount * (uc.base_amount / uc.converted_amount),
                #     'unit': {
                #         'id': uc.base_unit.id,
                #         'name': uc.base_unit.name,
                #         'plural_name': uc.base_unit.plural_name
                #     },
                # }
