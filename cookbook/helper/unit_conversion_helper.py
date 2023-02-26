def base_conversions():
    METRIC_MASS_CONVERSIONS = {
        'g':  {'base_amount': 1000, 'base_unit': 'mg', 'converted_amount': 1, 'converted_unit': 'g'},
        'mg':  {'base_amount': 1000, 'base_unit': 'g', 'converted_amount': 1, 'converted_unit': 'kg'},
    }



    METRIC_LIQUID_CONVERSIONS = [
        {'base_amount': 1000, 'base_unit': 'ml', 'converted_amount': 1, 'converted_unit': 'l'},
    ]


def get_conversions(amount, unit, food):
    conversions = []
    if unit:
        for c in unit.unit_conversion_base_relation.all():
            r = _uc_convert(c, amount, unit, food)
            if r not in conversions:
                conversions.append(r)
        for c in unit.unit_conversion_converted_relation.all():
            r = _uc_convert(c, amount, unit, food)
            if r not in conversions:
                conversions.append(r)

    return conversions


def _uc_convert(uc, amount, unit, food):
    if uc.food is None or uc.food == food:
        if unit == uc.base_unit:
            return {
                'amount': amount * (uc.converted_amount / uc.base_amount),
                'unit': {
                    'id': uc.converted_unit.id,
                    'name': uc.converted_unit.name,
                    'plural_name': uc.converted_unit.plural_name
                },
            }
        else:
            return {
                'amount': amount * (uc.base_amount / uc.converted_amount),
                'unit': {
                    'id': uc.base_unit.id,
                    'name': uc.base_unit.name,
                    'plural_name': uc.base_unit.plural_name
                },
            }
