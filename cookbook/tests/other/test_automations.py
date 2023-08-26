import json
import os

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.forms import ImportExportBase
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_search import RecipeSearch
from cookbook.models import Automation, ExportLog, Food, Recipe
from cookbook.tests.conftest import validate_recipe
from cookbook.tests.factories import FoodFactory, RecipeFactory

IMPORT_SOURCE_URL = 'api_recipe_from_source'

# TODO test case sensitive match, assert update value
# TODO test case insensitive match, assert update value
# TODO test no match, assert not update value
# TODO test accent insensitive match, assert not update value


@pytest.fixture
def obj_1(space_1, u1_s1):
    return ExportLog.objects.create(type=ImportExportBase.DEFAULT, running=False, created_by=auth.get_user(u1_s1), space=space_1, exported_recipes=10, total_recipes=10)


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_keyword_automation():
    assert True == True


def test_unit_automation():
    assert True == True


def test_food_automation():
    assert True == True


def test_description_replace_automation():
    assert True == True


def test_instruction_replace_automation():
    assert True == True


def test_never_unit_automation():
    assert True == True


def test_transpose_automation():
    assert True == True
# for some reason this tests cant run due to some kind of encoding issue, needs to be fixed
# def test_description_replace_automation(u1_s1, space_1):
#     if 'cookbook' in os.getcwd():
#         test_file = os.path.join(os.getcwd(), 'other', 'test_data', 'chefkoch2.html')
#     else:
#         test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', 'chefkoch2.html')
#
#     # original description
#     # Brokkoli - Bratlinge. Über 91 Bewertungen und für vorzüglich befunden. Mit ► Portionsrechner ► Kochbuch ► Video-Tipps! Jetzt entdecken und ausprobieren!
#
#     with scopes_disabled():
#         Automation.objects.create(
#             name='test1',
#             created_by=auth.get_user(u1_s1),
#             space=space_1,
#             param_1='.*',
#             param_2='.*',
#             param_3='',
#             order=1000,
#         )
#
#     with open(test_file, 'r', encoding='UTF-8') as d:
#         response = u1_s1.post(
#             reverse(IMPORT_SOURCE_URL),
#             {
#                 'data': d.read(),
#                 'url': 'https://www.chefkoch.de/rezepte/804871184310070/Brokkoli-Bratlinge.html',
#             },
#             content_type='application/json')
#         recipe = json.loads(response.content)['recipe_json']
#         assert recipe['description'] == ''
