from cookbook.models import FoodPropertyType


def calculate_recipe_properties(recipe):
    ingredients = []
    computed_properties = {}
    property_types = FoodPropertyType.objects.filter(space=recipe.space).all()

    for s in recipe.steps.all():
        ingredients += s.ingredients.all()

    for fpt in property_types:  # TODO is this safe or should I require the request context?
        computed_properties[fpt.id] = {'name': fpt.name, 'food_values': {}, 'total_value': 0}

    # TODO unit conversion support

    for i in ingredients:
        for pt in property_types:
            p = i.food.foodproperty_set.filter(property_type=pt).first()
            if p:
                computed_properties[p.property_type.id]['total_value'] += (i.amount / p.food_amount) * p.property_amount
                computed_properties[p.property_type.id]['food_values'] = add_or_create(computed_properties[p.property_type.id]['food_values'], i.food.id, (i.amount / p.food_amount) * p.property_amount)
            else:
                computed_properties[pt.id]['food_values'][i.food.id] = None

    return computed_properties

# small dict helper to add to existing key or create new, probably a better way of doing this
def add_or_create(d, key, value):
    if key in d:
        d[key] += value
    else:
        d[key] = value
    return d
