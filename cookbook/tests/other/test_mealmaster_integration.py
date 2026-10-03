from io import BytesIO

from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.integration.mealmaster import MealMaster
from cookbook.models import Food

MEALMASTER_FILE = """---------- Recipe via Meal-Master (tm) v7.07

      Title: "Duck" Sauce
 Categories: Appetizers, Sauces
   Servings:  1

    1/2 c  Peach or apricot preserves
    1/4 c  White vinegar
      1 tb Grated ginger
    1/3 c  Finely chopped scallions

  Combine the preserves, vinegar & ginger & heat to a simmer.

-----

---------- Recipe via Meal-Master (tm) v7.07

      Title: Pickled Onions
 Categories: Sauces
   Servings:  4

      1 c  White vinegar
      2    Onions

  Slice the onions and cover them with the vinegar.

-----
"""


def request_generator(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    return space, request


def test_mealmaster_ingredient_food(u1_s1):
    space, request = request_generator(u1_s1)
    with scope(space=space):
        mealmaster_integration = MealMaster(request, "import")
        recipe_texts = mealmaster_integration.split_recipe_file(BytesIO(MEALMASTER_FILE.encode("UTF-8")))
        recipes = [mealmaster_integration.get_recipe_from_file(text) for text in recipe_texts]

        ingredients = [(ingredient.food.name, ingredient.unit.name if ingredient.unit else None) for ingredient in recipes[0].steps.first().ingredients.all()]
        assert ingredients == [
            ("Peach or apricot preserves", "c"),
            ("White vinegar", "c"),
            ("Grated ginger", "tb"),
            ("Finely chopped scallions", "c"),
        ]
        # the same food in another recipe is reused instead of creating a new one per ingredient line
        assert recipes[1].steps.first().ingredients.first().food == Food.objects.get(name="White vinegar", space=space)
