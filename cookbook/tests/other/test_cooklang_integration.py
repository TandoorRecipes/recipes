import os
from io import BytesIO

from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.helper.cooklang_parser import Recipe
from cookbook.integration.cooklang import Cooklang


# ---------------------------------------------------Helper Functions---------------------------------------------------
def request_generator(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    return space, request


# ----------------------------------------------------Test Functions----------------------------------------------------
def parser_assertions(expected_metadata, expected_ingredients, expected_steps, recipe):
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


def test_cooklang_parser():
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
    with open("cookbook/tests/other/test_data/Cooklang/American Pancakes.cook") as file:
        recipe_text = file.read()
    recipe = Recipe.parse(recipe_text)

    parser_assertions(expected_metadata, expected_ingredients, expected_steps, recipe)


def test_greater_greater_metadata_parser():
    expected_metadata = [
        ("source", "https://www.glorioustreats.com/lemon-blueberry-bread/"),
        ("total time", "1 hour 30 minutes"),
        ("serves", '10'),
        ("tags", "baking, fresh fruit, hosting"),
    ]
    expected_ingredients = [
        ("all-purpose flour", 1.5, "cups"),
        ("baking powder", 1, "tsp"),
        ("salt", 1, "tsp"),
        ("lemon zest", 2, "tsp"),
        ("granulated sugar", 1, "cup"),
        ("eggs", 2, ""),
        ("unsalted butter", 0.333, "cup"),
        ("vanilla", 1, "tsp"),
        ("lemon juice", 4, "Tbsp"),
        ("whole milk", 0.5, "cup"),
        ("frozen blueberries", 1, "cup"),
        ("all-purpose flour(Tbsp)", 1, "Tbsp"),
        ("unsalted butter(Tbsp)", 2, "Tbsp"),
        ("confectioners' sugar", 0.5, "cup"),
    ]
    expected_steps = [
        [("text", "Preheat oven to 350°F and line a "), ("Cookware", """9"x 5" loaf pan"""), ("text", " with "), ("Cookware", "parchment paper"),
         ("text", " (or lightly grease with butter).")],
        [("text", "In a "), ("Cookware", "medium bowl"), ("text", ", whisk the "), ("Ingredient", ("all-purpose flour", 1.5, "cups")), ("text", ", "),
         ("Ingredient",
          ("baking powder", 1,
           "tsp")), ("text", " and "), ("Ingredient",
                                        ("salt", 1, "tsp")), ("text", ", and set aside.")],
        [("text", "Massage the "), ("Ingredient", ("lemon zest", 2, "tsp")), ("text", " with the "), ("Ingredient", ("granulated sugar", 1, "cup"))
         ], [("text", "Beat the lemon sugar mixture with the "), ("Ingredient", ("eggs", 2, "")),
             ("text", " until light and fluffy.")],
        [("text", "In the bowl of an "), ("Cookware", "electric mixer"), ("text", ", blend together the melted "), ("Ingredient", ("unsalted butter", 0.333, "cup")),
         ("text", " and lemon sugar and egg mixture. Mix until well combined.")],
        [("text", "Add thee "), ("Ingredient", ("vanilla", 0.5, "tsp")), ("text", ", and "), ("Ingredient", ("lemon juice", 2, "Tbsp")), ("text", " to the "),
         ("Ingredient",
          ("whole milk", 0.5,
           "cup")), ("text", ".")],
        [(
            "text",
            "While slowly mixing, add flour mixture and milk mixture in two batches (some flour, then some milk, then the rest of the flour and the rest of the milk). Stop mixing as soon as it's just combined."
        )],
        [("text", "Rinse off the "), ("Ingredient", ("frozen blueberries", 1, "cup")), ("text", " (if using fresh) so they have just a bit of moisture on them, then, in a "),
         ("Cookware", "small bowl"), ("text", " toss the blueberries and "), ("Ingredient", ("all-purpose flour", 1, "Tbsp")),
         ("text", ". This flour coating will help prevent the blueberries from sinking to the bottom of your loaf while baking.")],
        [("text", "Add the flour coated berries to the batter and gently but quickly stir, by hand, to combine.")],
        [("text", "Immediately pour batter into prepared pan and bake for 55 to "), ("Timer", ("", 65, "minutes")),
         ("text", ", or until a toothpick inserted in the center of the loaf comes out clean. Cool bread in the pan for about "), ("Timer", ("", 30, "minutes")),
         ("text", ", then move to a wire cooling rack with a baking sheet below (to catch the glaze you're about to add).")],
        [("text", "Prepare glaze by simply whisking together the melted "), ("Ingredient", ("unsalted butter", 2, "Tbsp")), ("text", ", "),
         ("Ingredient", ("confectioners' sugar", 0.5, "cup")), ("text", ", "), ("Ingredient", ("lemon juice", 2, "Tbsp")), ("text", " and "),
         ("Ingredient", ("vanilla", 0.5, "tsp")), ("text", ", then pour glaze over the loaf. Allow to set a few minutes, then enjoy!")]
    ]
    with open("cookbook/tests/other/test_data/Cooklang/Another Lemon Blueberry Bread.cook") as file:
        recipe_text = file.read()
    recipe = Recipe.parse(recipe_text)

    parser_assertions(expected_metadata, expected_ingredients, expected_steps, recipe)


def test_cooklang_integration(u1_s1):
    expected_metadata = {
        'name': "Christmas Butter Swirl Shortbread Cookies",
        "description": '"A great holiday treat for your loved ones"',
        "servings": 24,
        "servings_text": "cookies",
        "source_url": "https://www.fifteenspatulas.com/butter-swirl-shortbread-cookies/",
        "keywords": ["DingoDoyle", "dessert", "Christmas", "Holiday", "From Scratch"],
        "working_time": 25,
        "waiting_time": 15,
    }
    expected_step_strings = [
        "Preheat the oven to 350°F.",
        "Place the 1cup unsalted butter, 114g confectioners' sugar and 1tsp vanilla in a large bowl, and beat with an electric mixer until combined, light, and fluffy.",
        "Add the 240g all-purpose flour and 0.5tsp salt and mix until it’s crumbly and looks like it can’t be mixed more.",
        "*** Be patient, if it is longer than 15 seconds then keep going for another 15 until before adding any more milk ***\nAdd the 1Tbsp whole milk and keep mixing. The dough should clump together after about 15 seconds.",
        "Place the dough into a pastry bag fitted with a very large star tip, and pipe onto a silicone mat lined baking sheet, with no more than 12 cookies per sheet.",
        "Bake the cookies for 15 minutes or until lightly golden.",
        "Let them cool completely (on the tray is fine), and enjoy! (best still warm)",
    ]

    expected_step_ingredients = [
        [],
        [
            ("unsalted butter", 1.0, "cup"),
            ("confectioners' sugar", 114.0, "g"),
            ("vanilla", 1.0, "tsp"),
        ],
        [
            ("all-purpose flour", 240.0, "g"),
            ("salt", 0.5, "tsp"),
        ],
        [("whole milk", 1.0, "Tbsp")],
        [],
        [],
        [],
    ]

    space, request = request_generator(u1_s1)
    with scope(space=space):
        cooklang_integration = Cooklang(request, "export")
        with open("cookbook/tests/other/test_data/Cooklang/Butter Swirl Shortbread Cookies.cook", "rb") as file:
            recipe_bytes = file.read()
            recipe_name = file.name
        buffer = BytesIO(recipe_bytes)
        buffer.name = recipe_name
        recipe = cooklang_integration.get_recipe_from_file(buffer)

        for key in expected_metadata.keys():
            match key:
                case "keywords":
                    keywords = [keyword.name for keyword in recipe.__getattribute__(key).all()]
                    assert len(expected_metadata[key]) == len(keywords)
                    for tag in expected_metadata[key]:
                        assert tag in keywords
                case _:
                    assert expected_metadata[key] == recipe.__getattribute__(key)
        i = 0
        steps = recipe.steps.all()
        assert len(expected_step_strings) == len(steps)
        for line in expected_step_strings:
            assert line == steps[i].instruction
            i += 1
        i = 0
        for line in expected_step_ingredients:
            step_ingredients_info = [(ingredient.food.name, float(ingredient.amount), ingredient.unit.name) for ingredient in steps[i].ingredients.all()]
            assert len(line) == len(step_ingredients_info)
            assert line == step_ingredients_info
            i += 1
