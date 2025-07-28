from django.core.cache import caches

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.unit_conversion_helper import UnitConversionHelper
from cookbook.models import PropertyType


class FoodPropertyHelper:
    space = None

    def __init__(self, space):
        """
        Helper to perform food property calculations
        :param space: space to limit scope to
        """
        self.space = space

    def calculate_recipe_properties(self, recipe):
        """
        Calculate all food properties for a given recipe.
        :param recipe: recipe to calculate properties for
        :return: dict of with property keys and total/food values for each property available
        """
        ingredients = []
        computed_properties = {}

        for s in recipe.steps.all():
            ingredients += s.ingredients.all()

        property_types = caches['default'].get(CacheHelper(self.space).PROPERTY_TYPE_CACHE_KEY, None)

        if not property_types:
            property_types = PropertyType.objects.filter(space=self.space).all()
            # cache is cleared on property type save signal so long duration is fine
            caches['default'].set(CacheHelper(self.space).PROPERTY_TYPE_CACHE_KEY, property_types, 60 * 60)

        for fpt in property_types:
            computed_properties[fpt.id] = {'id': fpt.id, 'name': fpt.name, 'description': fpt.description,
                                           'unit': fpt.unit, 'order': fpt.order, 'food_values': {}, 'total_value': 0, 'missing_value': False}

        uch = UnitConversionHelper(self.space)

        for i in ingredients:
            if i.food is not None:
                conversions = uch.get_conversions(i)
                for pt in property_types:
                    # if a property could be calculated with an actual value
                    found_property = False
                    # if food has a value for the given property type (no matter if conversion is possible)
                    has_property_value = False
                    if i.food.properties_food_amount == 0 or i.food.properties_food_unit is None and not (i.amount == 0 or i.no_amount):  # if food is configured incorrectly
                        computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': None}
                        computed_properties[pt.id]['missing_value'] = True
                    else:
                        for p in i.food.properties.all():
                            if p.property_type == pt and p.property_amount is not None:
                                has_property_value = True
                                for c in conversions:
                                    if c.unit == i.food.properties_food_unit:
                                        found_property = True
                                        computed_properties[pt.id]['total_value'] += (c.amount / i.food.properties_food_amount) * p.property_amount
                                        computed_properties[pt.id]['food_values'] = self.add_or_create(
                                            computed_properties[p.property_type.id]['food_values'], c.food.id, (c.amount / i.food.properties_food_amount) * p.property_amount, c.food)
                    if not found_property:
                        # if no amount and food does not exist yet add it but don't count as missing
                        if i.amount == 0 or i.no_amount and i.food.id not in computed_properties[pt.id]['food_values']:
                            computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': 0}
                        # if amount is present but unit is missing indicate it in the result
                        elif i.unit is None:
                            if i.food.id not in computed_properties[pt.id]['food_values']:
                                computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': 0}
                            computed_properties[pt.id]['food_values'][i.food.id]['missing_unit'] = True
                        else:
                            computed_properties[pt.id]['missing_value'] = True
                            computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': None}
                            if has_property_value and i.unit is not None:
                                computed_properties[pt.id]['food_values'][i.food.id]['missing_conversion'] = {'base_unit': {'id': i.unit.id, 'name': i.unit.name}, 'converted_unit': {'id': i.food.properties_food_unit.id, 'name': i.food.properties_food_unit.name}}

        return computed_properties

    # small dict helper to add to existing key or create new, probably a better way of doing this
    # TODO move to central helper ? --> use defaultdict
    @staticmethod
    def add_or_create(d, key, value, food):
        if key in d and d[key]['value']:
            d[key]['value'] += value
        else:
            d[key] = {'id': food.id, 'food': {'id': food.id, 'name': food.name}, 'value': value}
        return d
