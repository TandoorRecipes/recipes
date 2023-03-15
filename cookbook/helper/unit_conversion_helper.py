from pint import UnitRegistry, UndefinedUnitError, PintError

from cookbook.models import Ingredient, Unit

CONVERT_TO_UNITS = {
    'metric': ['g', 'kg', 'ml', 'l'],
    'us': ['ounce', 'pound', 'fluid_ounce', 'pint', 'quart', 'gallon'],
    'uk': ['ounce', 'pound', 'imperial_fluid_ounce', 'imperial_pint', 'imperial_quart', 'imperial_gallon'],
}


def base_conversions(ingredient_list):
    ureg = UnitRegistry()
    pint_converted_list = ingredient_list.copy()
    for i in ingredient_list:
        try:
            conversion_unit = i.unit.name
            if i.unit.base_unit:
                conversion_unit = i.unit.base_unit
            quantitiy = ureg.Quantity(f'{i.amount} {conversion_unit}')
            for u in CONVERT_TO_UNITS['metric'] + CONVERT_TO_UNITS['us'] + CONVERT_TO_UNITS['uk']:
                converted = quantitiy.to(u)
                ingredient = Ingredient(amount=converted.m, unit=Unit(name=str(converted.units)), food=ingredient_list[0].food, )
                if not any(x.unit.name == ingredient.unit.name for x in pint_converted_list):
                    pint_converted_list.append(ingredient)
        except PintError:
            pass

    return pint_converted_list


def get_conversions(ingredient):
    conversions = [ingredient]
    if ingredient.unit:
        for c in ingredient.unit.unit_conversion_base_relation.all():
            r = _uc_convert(c, ingredient.amount, ingredient.unit, ingredient.food)
            if r not in conversions:
                conversions.append(r)
        for c in ingredient.unit.unit_conversion_converted_relation.all():
            r = _uc_convert(c, ingredient.amount, ingredient.unit, ingredient.food)
            if r not in conversions:
                conversions.append(r)

    conversions += base_conversions(conversions)

    return conversions


def _uc_convert(uc, amount, unit, food):
    if uc.food is None or uc.food == food:
        if unit == uc.base_unit:
            return Ingredient(amount=amount * (uc.converted_amount / uc.base_amount), unit=uc.converted_unit, food=food)
            # return {
            #     'amount': amount * (uc.converted_amount / uc.base_amount),
            #     'unit': {
            #         'id': uc.converted_unit.id,
            #         'name': uc.converted_unit.name,
            #         'plural_name': uc.converted_unit.plural_name
            #     },
            # }
        else:
            return Ingredient(amount=amount * (uc.base_amount / uc.converted_amount), unit=uc.base_unit, food=food)
            # return {
            #     'amount': amount * (uc.base_amount / uc.converted_amount),
            #     'unit': {
            #         'id': uc.base_unit.id,
            #         'name': uc.base_unit.name,
            #         'plural_name': uc.base_unit.plural_name
            #     },
            # }
