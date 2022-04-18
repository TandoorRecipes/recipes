import json
import os

import pytest

from django.urls import reverse

from cookbook.helper.recipe_url_import import get_from_youtube_scraper

from cookbook.tests.conftest import validate_recipe
from ._recipes import (
    ALLRECIPES, AMERICAS_TEST_KITCHEN, CHEF_KOCH, CHEF_KOCH2, COOKPAD,
    COOKS_COUNTRY, DELISH, FOOD_NETWORK, GIALLOZAFFERANO, JOURNAL_DES_FEMMES,
    MADAME_DESSERT, MARMITON, TASTE_OF_HOME, THE_SPRUCE_EATS, TUDOGOSTOSO)

IMPORT_SOURCE_URL = 'api_recipe_from_source'
DATA_DIR = "cookbook/tests/other/test_data/"


# These were chosen arbitrarily from:
# Top 10 recipe websites listed here https://www.similarweb.com/top-websites/category/food-and-drink/cooking-and-recipes/
# plus the test that previously existed
# plus the custom scraper that was created
# plus any specific defects discovered along the way


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 400],
    ['a1_s1', 400],
])
def test_import_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(IMPORT_SOURCE_URL)).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ALLRECIPES,
    # test of custom scraper ATK
    AMERICAS_TEST_KITCHEN,
    CHEF_KOCH,
    # test for empty ingredient in ingredient_parser
    CHEF_KOCH2,
    COOKPAD,
    # test of custom scraper ATK
    COOKS_COUNTRY,
    DELISH,
    FOOD_NETWORK,
    GIALLOZAFFERANO,
    JOURNAL_DES_FEMMES,
    # example of recipes_scraper in with wildmode
    # example of json only source
    MADAME_DESSERT,
    MARMITON,
    TASTE_OF_HOME,
    # example of non-json recipes_scraper
    THE_SPRUCE_EATS,
    TUDOGOSTOSO,
])
def test_recipe_import(arg, u1_s1):
    url = arg['url']
    for f in list(arg['file']) :  # url and files get popped later
        if 'cookbook' in os.getcwd():
            test_file = os.path.join(os.getcwd(), 'test_data', f)
        else:
            test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'test_data', f)
        with open(test_file, 'r', encoding='UTF-8') as d:
            response = u1_s1.post(
                reverse(IMPORT_SOURCE_URL),
                {
                    'data': d.read(),
                    'url': url,
                    'mode': 'source'
                },
                files={'foo': 'bar'}
            )
        recipe = json.loads(response.content)['recipe_json']
        validate_recipe(arg, recipe)


def test_youtube_import(url='https://www.youtube.com/watch?v=8yPTW1RTFb4'):
    expected_response = {
        'name': 'How to Make Italian Bruschetta - Recipe in description',
        'description': "Bruschetta is an Italian classic, full of tomato and basil goodness, and is the perfect appetizer or light meal. Fun fact: Bruschetta is pronounced 'Broo-sket-tuh.'\n\nIf you enjoyed this video make sure to give it a 'like' and leave a comment!\n\nPreparation time: 35 minutes.\nDifficulty: Easy\nCalories per serving: about 120 kcal.\n\nIngredients for 6 people:\n1 kg of tomatoes (vine tomatoes)\n3 onions\n4 cloves of garlic\nOlive oil\n1 bunch of basil\n1 ciabatta\n\nDice the tomatoes. Chop the onions finely (or coarsely, it depends on your taste) and add to the bowl with the tomatoes. Peel and press the garlic (only three cloves) and drop in the bowl. Season with salt (preferably ground sea salt) and pepper. Leave to stand a few moments and then fill it with olive oil.\n\nSprinkle the bread with a few drops of olive oil, rub with the remaining garlic clove and slide it into the oven (only bread) at about 200 ° C. Remove from the oven once crispy (this takes about 8 min.). Finely chop the basil and place in bowl with the tomatoes, garlic and onion to season.\n\nPlace everything on the table and serve - if you like, try adding mozzarella or Parmesan cheese.\n\nAuthor: pierrehh \n\nNew videos added weekly\nSUBSCRIBE NOW - http://bit.ly/1MbySIl\n\nImported from: https://www.youtube.com/watch?v=8yPTW1RTFb4",
        'servings': 1,
        'prepTime': 0,
        'cookTime': 0,
        'image': 'https://i.ytimg.com/vi/8yPTW1RTFb4/sddefault.jpg',
        'keywords': [],
        'recipeIngredient': [],
        'recipeInstructions': ''
    }
    recipe_json = get_from_youtube_scraper(url)
    assert recipe_json == expected_response
