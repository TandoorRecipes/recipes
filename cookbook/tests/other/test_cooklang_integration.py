from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.helper.cooklang_parser import Recipe
from cookbook.integration.cooklang import Cooklang

expected_metadata = [("Title", "American Pancakes"), ("Author", "DingoDoyle"), ("Cuisine", "American"), ("Course", "Breakfast"), ("tags", "Breakfast, Simple, From Scratch, ")]
expected_ingredients = [
    ("buttermilk", 0.5, "l"),
    ("egg", 1, ""),
    ("salt", 0.333, "tsp"),
    ("sugar", 1.75, "tbsp"),
    ("flour", 2.5, "cups"),
    ("baking soda", 0.5, "tsp"),
    ("oil", "", ""),
]
expected_steps = [
    [("text", "Retrieve from the refrigerator in advance so it's at room temperature.\nPour "), ("Ingredient", ("buttermilk", 0.5, "l")), ("text", " into a "),
     ("Cookware", "bowl"), ("text", ". Add "), ("Ingredient", ("egg", 1, "")), ("text", ", "), ("Ingredient", ("salt", 0.333, "tsp")), ("text", ", and "),
     ("Ingredient", ("sugar", 1.5, "tbsp")), ("text", ". Mix well.")],
    [("inline comment", "still in that same bowl"), ("text", "\nAdd sifted "), ("Ingredient", ("flour", 2.5, "cups")), ("text", " and "),
     ("Ingredient", ("baking soda", 0.5, "tsp")), ("text", ". Mix-thoroughly.")],
    [("text", "Leave the batter for "), ("Timer", ("", 30, "minutes")), ("text", " to allow the buttermilk and baking soda to react.")],
    [("text", "After half an hour, when bubbles form on the surface of the batter, you can start frying.\nHeat a small amount of "), ("Ingredient", ("oil", "", "")),
     ("text", " in a "), ("Cookware", "frying pan"), ("text", " "), ("Timer", ("oil", 10.5, "seconds")), ("text", ".")],
    [("text", "Take the batter with a spoon from the edge, carefully place it on the "), ("Cookware", "frying pan"), ("text", ", and fry over medium heat.")],
    [("text", "When bubbles start to appear and burst on the surface, flip to the other side.")],
    [("block comment", " maple syrup is the choice for normies "), ("text", "\nServe the ready pancakes with sour cream, jam and sprinkle "),
     ("Ingredient", ("sugar", 0.25, "tbsp")), ("text", " on top  "), ("inline comment", " or just as they are.")],
]


def test_cooklang_parser():

    with open("cookbook/tests/other/test_data/Cooklang/American Pancakes.cook") as file:
        recipe_text = file.read()
    recipe = Recipe.parse(recipe_text)

    for step in recipe.steps:
        print(step)

    assert len(expected_metadata) == len(recipe.metadata.keys())
    assert len(expected_ingredients) == len(recipe.ingredients)
    assert len(expected_steps) == len(recipe.steps)

    for expected in expected_metadata:
        assert expected[0] in recipe.metadata.keys()
        assert recipe.metadata[expected[0]] == expected[1]

    i = 0
    for expected in expected_ingredients:
        assert expected[0] == recipe.ingredients[i].name
        assert expected[1] == recipe.ingredients[i].quantity.amount
        assert expected[2] == recipe.ingredients[i].quantity.unit
        i += 1

    i = 0
    for expected in expected_steps:
        j = 0
        assert len(expected) == len(recipe.steps[i].blocks)
        for expected_block in expected:
            assert expected_block[0] == recipe.steps[i].blocks[j].type
            match expected_block[0]:
                case "Ingredient":
                    assert expected_block[1][0] == recipe.steps[i].blocks[j].value.name
                    assert expected_block[1][1] == recipe.steps[i].blocks[j].value.quantity.amount
                    assert expected_block[1][2] == recipe.steps[i].blocks[j].value.quantity.unit
                case "Timer":
                    assert expected_block[1][0] == recipe.steps[i].blocks[j].value.ingredient_str
                    assert expected_block[1][1] == recipe.steps[i].blocks[j].value.quantity
                    assert expected_block[1][2] == recipe.steps[i].blocks[j].value.unit

                case _:
                    assert expected_block[1] == recipe.steps[i].blocks[j].value
            j += 1
        i += 1


def request_generator(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    return space, request


# def test_cooklang_integration(u1_s1):
#
#     space, request = request_generator(u1_s1)
#     with scope(space=space):
#         cooklang_integration = Cooklang(request, "export")
#         with open("cookbook/tests/other/test_data/Cooklang/Butter Swirl Shortbread Cookies.cook") as file:
#             recipe = cooklang_integration.get_recipe_from_file(file)
#     assert False
