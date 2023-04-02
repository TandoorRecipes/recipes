from cookbook.models import FoodPropertyType


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
        property_types = FoodPropertyType.objects.filter(space=self.space).all()

        for s in recipe.steps.all():
            ingredients += s.ingredients.all()

        for fpt in property_types:  # TODO is this safe or should I require the request context?
            computed_properties[fpt.id] = {'name': fpt.name, 'food_values': {}, 'total_value': 0}

        # TODO unit conversion support

        for i in ingredients:
            for pt in property_types:
                p = i.food.foodproperty_set.filter(space=self.space, property_type=pt).first()
                if p:
                    computed_properties[p.property_type.id]['total_value'] += (i.amount / p.food_amount) * p.property_amount
                    computed_properties[p.property_type.id]['food_values'] = self.add_or_create(computed_properties[p.property_type.id]['food_values'], i.food.id, (i.amount / p.food_amount) * p.property_amount)
                else:
                    computed_properties[pt.id]['food_values'][i.food.id] = None

        return computed_properties

    # small dict helper to add to existing key or create new, probably a better way of doing this
    # TODO move to central helper ?
    @staticmethod
    def add_or_create(d, key, value):
        if key in d:
            d[key] += value
        else:
            d[key] = value
        return d
