from django.core.cache import caches

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.unit_conversion_helper import UnitConversionHelper
from cookbook.models import Ingredient, PropertyType


class FoodPropertyHelper:
    def __init__(self, space):
        """
        Helper to perform food property calculations
        :param space: space to limit scope to
        """
        self.space = space

    def _try_calculate_property(self, ingredient, conversions, property_type, computed_properties):
        """
        Try to calculate property value for an ingredient using given conversions.
        :param ingredient: ingredient to calculate property for
        :param conversions: list of unit conversions to try
        :param property_type: the property type to calculate
        :param computed_properties: dict to update with calculated values
        :return: tuple (property_found, has_property_value)
            - property_found: True if calculation succeeded
            - has_property_value: True if food has a value for this property type
        """
        found = False
        has_value = False

        for p in ingredient.food.properties.all():
            if p.property_type == property_type and p.property_amount is not None:
                has_value = True
                for c in conversions:
                    if c.unit == ingredient.food.properties_food_unit and ingredient.food.properties_food_amount != 0:
                        found = True
                        prop_value = (c.amount / ingredient.food.properties_food_amount) * p.property_amount
                        computed_properties[property_type.id]['total_value'] += prop_value
                        computed_properties[property_type.id]['food_values'] = self.add_or_create(
                            computed_properties[property_type.id]['food_values'],
                            c.food.id, prop_value, c.food)

        return found, has_value

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
                    # if food is configured incorrectly (no reference amount/unit)
                    if (i.food.properties_food_amount == 0 or i.food.properties_food_unit is None) and not (i.amount == 0 or i.no_amount):
                        computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': None}
                        computed_properties[pt.id]['missing_value'] = True
                        continue

                    # try to calculate property with ingredient's unit
                    found_property, has_property_value = self._try_calculate_property(i, conversions, pt, computed_properties)

                    if found_property:
                        continue

                    # property not found - handle various error cases
                    if i.amount == 0 or i.no_amount:
                        # no amount - add food but don't count as missing
                        if i.food.id not in computed_properties[pt.id]['food_values']:
                            computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': 0}

                    elif i.unit is None:
                        # no unit - try space default unit
                        if self.space.default_unit is not None:
                            temp_ingredient = Ingredient(amount=i.amount, unit=self.space.default_unit, food=i.food, space=self.space)
                            temp_conversions = uch.get_conversions(temp_ingredient)
                            default_found, default_has_value = self._try_calculate_property(i, temp_conversions, pt, computed_properties)

                            if not default_found:
                                # default unit conversion failed
                                computed_properties[pt.id]['missing_value'] = True
                                if i.food.id not in computed_properties[pt.id]['food_values']:
                                    computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': None}
                                if default_has_value and i.food.properties_food_unit is not None:
                                    computed_properties[pt.id]['food_values'][i.food.id]['missing_conversion'] = {
                                        'base_unit': {'id': self.space.default_unit.id, 'name': self.space.default_unit.name},
                                        'converted_unit': {'id': i.food.properties_food_unit.id, 'name': i.food.properties_food_unit.name}
                                    }
                        else:
                            # no default unit set - mark as missing_unit
                            if i.food.id not in computed_properties[pt.id]['food_values']:
                                computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': 0}
                            computed_properties[pt.id]['food_values'][i.food.id]['missing_unit'] = True

                    else:
                        # explicit unit but conversion failed
                        computed_properties[pt.id]['missing_value'] = True
                        if i.food.id not in computed_properties[pt.id]['food_values']:
                            computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': {'id': i.food.id, 'name': i.food.name}, 'value': None}
                        if has_property_value and i.food.properties_food_unit is not None:
                            computed_properties[pt.id]['food_values'][i.food.id]['missing_conversion'] = {
                                'base_unit': {'id': i.unit.id, 'name': i.unit.name},
                                'converted_unit': {'id': i.food.properties_food_unit.id, 'name': i.food.properties_food_unit.name}
                            }

        return computed_properties

    # small dict helper to add to existing key or create new, probably a better way of doing this
    # TODO move to central helper ? --> use defaultdict
    @staticmethod
    def add_or_create(d, key, value, food):
        if key in d:
            # value can be None if a previous instance of the same food was missing a conversion
            if d[key]['value']:
                d[key]['value'] += value
            else:
                d[key]['value'] = value
        else:
            d[key] = {'id': food.id, 'food': {'id': food.id, 'name': food.name}, 'value': value}
        return d
