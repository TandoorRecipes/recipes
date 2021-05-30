import json
import os

import pytest

from django.urls import reverse

from ._recipes import (
    ALLRECIPES, AMERICAS_TEST_KITCHEN, CHEF_KOCH, COOKPAD,
    COOKS_COUNTRY, DELISH, FOOD_NETWORK, GIALLOZAFFERANO, JOURNAL_DES_FEMMES,
    MADAME_DESSERT, MARMITON, TASTE_OF_HOME, THE_SPRUCE_EATS, TUDOGOSTOSO)

IMPORT_SOURCE_URL = 'api_recipe_from_source'
DATA_DIR = "cookbook/tests/other/test_data/"


# These were chosen arbitrarily from:
# Top 10 recipe websites listed here https://www.similarweb.com/top-websites/category/food-and-drink/cooking-and-recipes/
# plus the test that previously existed
# plus the custom scraper that was created
# TODO thoughtfully add recipes that test specific scenerios


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
    for f in arg['file']:
        if 'cookbook' in os.getcwd():
            test_file = os.path.join(os.getcwd(), 'other', 'test_data', f)
        else:
            test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', f)
        with open(test_file, 'r', encoding='UTF-8') as d:
            response = u1_s1.post(
                reverse(IMPORT_SOURCE_URL),
                {
                    'data': d.read(),
                    'url': arg['url'],
                    'mode': 'source'
                },
                files={'foo': 'bar'}
            )
        recipe = json.loads(response.content)['recipe_json']
        for key in list(set(arg) - set(['file', 'url'])):
            if type(arg[key]) == list:
                assert len(recipe[key]) == len(arg[key])
                if key == 'keywords':
                    valid_keywords = [i['text'] for i in arg[key]]
                    for k in recipe[key]:
                        assert k['text'] in valid_keywords
                elif key == 'recipeIngredient':
                    valid_ing = ["{:g}{}{}{}{}".format(
                        i['amount'],
                        i['unit']['text'],
                        i['ingredient']['text'],
                        i['note'],
                        i['original'])
                        for i in arg[key]]
                    for i in recipe[key]:
                        assert "{:g}{}{}{}{}".format(
                            i['amount'],
                            i['unit']['text'],
                            i['ingredient']['text'],
                            i['note'],
                            i['original']) in valid_ing
            else:
                assert recipe[key] == arg[key]
