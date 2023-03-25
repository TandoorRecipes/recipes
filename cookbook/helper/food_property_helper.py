from cookbook.models import FoodPropertyType


def calculate_recipe_properties(recipe):
    ingredients = []
    computed_properties = {}

    for s in recipe.steps.all():
        ingredients += s.ingredients.all()

    for fpt in FoodPropertyType.objects.filter(space=recipe.space).all():  # TODO is this safe or should I require the request context?
        computed_properties[fpt.id] = {'name': fpt.name, 'food_values': {}, 'total_value': 0}

    # TODO unit conversion support

    for i in ingredients:
        for p in i.food.foodproperty_set.all():
            computed_properties[p.property_type.id]['total_value'] += (i.amount / p.food_amount) * p.property_amount
            computed_properties[p.property_type.id]['food_values'][i.food.id] = add_or_create(computed_properties[p.property_type.id]['food_values'], i.food.id, (i.amount / p.food_amount) * p.property_amount)

    return computed_properties

# small dict helper to add to existing key or create new, probably a better way of doing this
def add_or_create(d, key, value):
    if key in d:
        d[key] += value
    else:
        d[key] = value
    return d
