import json
import os

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.tests.conftest import validate_recipe

from ._recipes import (ALLRECIPES, AMERICAS_TEST_KITCHEN, CHEF_KOCH, CHEF_KOCH2, COOKPAD,
                       COOKS_COUNTRY, DELISH, FOOD_NETWORK, GIALLOZAFFERANO, JOURNAL_DES_FEMMES,
                       MADAME_DESSERT, MARMITON, TASTE_OF_HOME, THE_SPRUCE_EATS, TUDOGOSTOSO)
from ...models import Automation

IMPORT_SOURCE_URL = 'api_recipe_from_source'
DATA_DIR = "cookbook/tests/other/test_data/"


# These were chosen arbitrarily from:
# Top 10 recipe websites listed here https://www.similarweb.com/top-websites/category/food-and-drink/cooking-and-recipes/
# plus the test that previously existed
# plus the custom scraper that was created
# plus any specific defects discovered along the way


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 405],
    ['a1_s1', 405],
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
    THE_SPRUCE_EATS,  # TODO seems to be broken in recipe scrapers
    TUDOGOSTOSO,
])
def test_recipe_import(arg, u1_s1):
    url = arg['url']
    for f in list(arg['file']):  # url and files get popped later
        if 'cookbook' in os.getcwd():
            test_file = os.path.join(os.getcwd(), 'other', 'test_data', f)
        else:
            test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', f)
        with open(test_file, 'r', encoding='UTF-8') as d:
            response = u1_s1.post(
                reverse(IMPORT_SOURCE_URL),
                {
                    'data': d.read(),
                    'url': url,
                },
                content_type='application/json')
        recipe = json.loads(response.content)['recipe_json']
        validate_recipe(arg, recipe)


def test_description_replace_automation(u1_s1, space_1):
    if 'cookbook' in os.getcwd():
        test_file = os.path.join(os.getcwd(), 'other', 'test_data', 'chefkoch2.html')
    else:
        test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', 'chefkoch2.html')

    # original description
    # Brokkoli - Bratlinge. Über 91 Bewertungen und für vorzüglich befunden. Mit ► Portionsrechner ► Kochbuch ► Video-Tipps! Jetzt entdecken und ausprobieren!

    with scopes_disabled():
        Automation.objects.create(
            name='test1',
            created_by=auth.get_user(u1_s1),
            space=space_1,
            param_1='.*',
            param_2='.*',
            param_3='',
            order=1000,
        )

    with open(test_file, 'r', encoding='UTF-8', errors='ignore') as d:
        response = u1_s1.post(
            reverse(IMPORT_SOURCE_URL),
            {
                'data': d.read(),
                'url': 'https://www.chefkoch.de/rezepte/804871184310070/Brokkoli-Bratlinge.html',
            },
            content_type='application/json')
        recipe = json.loads(response.content)['recipe_json']
        assert recipe['description'] == ''
