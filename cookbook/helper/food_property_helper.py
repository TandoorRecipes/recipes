from cookbook.models import FoodPropertyType, Unit, Food, FoodProperty, Recipe, Step


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
            computed_properties[fpt.id] = {'id': fpt.id, 'name': fpt.name, 'icon': fpt.icon, 'description': fpt.description, 'unit': fpt.unit, 'food_values': {}, 'total_value': 0, 'missing_value': False}

        # TODO unit conversion support

        for i in ingredients:
            for pt in property_types:
                p = i.food.foodproperty_set.filter(space=self.space, property_type=pt).first()
                if p:
                    computed_properties[pt.id]['total_value'] += (i.amount / p.food_amount) * p.property_amount
                    computed_properties[pt.id]['food_values'] = self.add_or_create(computed_properties[p.property_type.id]['food_values'], i.food.id, (i.amount / p.food_amount) * p.property_amount, i.food)
                else:
                    computed_properties[pt.id]['missing_value'] = True
                    computed_properties[pt.id]['food_values'][i.food.id] = {'id': i.food.id, 'food': i.food.name, 'value': 0}

        return computed_properties

    # small dict helper to add to existing key or create new, probably a better way of doing this
    # TODO move to central helper ?
    @staticmethod
    def add_or_create(d, key, value, food):
        if key in d:
            d[key]['value'] += value
        else:
            d[key] = {'id': food.id, 'food': food.name, 'value': value}
        return d

    def generate_debug_recipe(self):
        """
        DEBUG FUNCTION ONLY, generates a test recipe
        """
        unit_gram = Unit.objects.create(name='gram', base_unit='g', space=self.space)
        unit_pcs = Unit.objects.create(name='pcs', base_unit='', space=self.space)
        unit_floz1 = Unit.objects.create(name='fl. oz 1', base_unit='imperial_fluid_ounce', space=self.space)  # US and UK use different volume systems (US vs imperial)
        unit_floz2 = Unit.objects.create(name='fl. oz 2', base_unit='fluid_ounce', space=self.space)
        unit_fantasy = Unit.objects.create(name='Fantasy Unit', base_unit='', space=self.space)

        food_1 = Food.objects.create(name='Food 1', space=self.space)
        food_2 = Food.objects.create(name='Food 2', space=self.space)

        property_fat = FoodPropertyType.objects.create(name='Fat', unit='g', space=self.space)
        property_calories = FoodPropertyType.objects.create(name='Calories', unit='kcal', space=self.space)
        property_nuts = FoodPropertyType.objects.create(name='Nuts', space=self.space)
        property_price = FoodPropertyType.objects.create(name='Price', unit='€', space=self.space)

        food_1_property_fat = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=50, property_type=property_fat, space=self.space)
        food_1_property_nuts = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=1, property_type=property_nuts, space=self.space)
        food_1_property_price = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_1, property_amount=7.50, property_type=property_price, space=self.space)

        food_2_property_fat = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=25, property_type=property_fat, space=self.space)
        food_2_property_nuts = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=0, property_type=property_nuts, space=self.space)
        food_2_property_price = FoodProperty.objects.create(food_amount=100, food_unit=unit_gram, food=food_2, property_amount=2.50, property_type=property_price, space=self.space)

        recipe_1 = Recipe.objects.create(name='recipe_1', waiting_time=0, working_time=0, space=self.space, created_by=self.space.created_by)

        step_1 = Step.objects.create(instruction='instruction_step_1', space=self.space)
        step_1.ingredients.create(amount=500, unit=unit_gram, food=food_1, space=self.space)
        step_1.ingredients.create(amount=1000, unit=unit_gram, food=food_2, space=self.space)
        recipe_1.steps.add(step_1)

        step_2 = Step.objects.create(instruction='instruction_step_1', space=self.space)
        step_2.ingredients.create(amount=50, unit=unit_gram, food=food_1, space=self.space)
        recipe_1.steps.add(step_2)
