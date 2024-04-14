import os

import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope
from recipe_scrapers import scrape_html

from cookbook.helper.automation_helper import AutomationEngine
from cookbook.helper.recipe_url_import import get_from_scraper
from cookbook.models import Automation

DATA_DIR = "cookbook/tests/other/test_data/"


@pytest.mark.parametrize("arg", [
    ['Match', True],
    ['mAtCh', True],
    ['No Match', False],
    ['Màtch', False],
])
def test_food_automation(u1_s1, arg):
    target_name = "Matched Automation"
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, False)

    with scope(space=space):
        Automation.objects.get_or_create(name='food test', type=Automation.FOOD_ALIAS, param_1=arg[0], param_2=target_name, created_by=user, space=space)
        assert (automation.apply_food_automation(arg[0]) == target_name) is True


@pytest.mark.parametrize("arg", [
    ['Match', True],
    ['mAtCh', True],
    ['No Match', False],
    ['Màtch', False],
])
def test_keyword_automation(u1_s1, arg):
    target_name = "Matched Automation"
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, False)

    with scope(space=space):
        Automation.objects.get_or_create(name='keyword test', type=Automation.KEYWORD_ALIAS, param_1=arg[0], param_2=target_name, created_by=user, space=space)
        assert (automation.apply_keyword_automation(arg[0]) == target_name) is True


@pytest.mark.parametrize("arg", [
    ['Match', True],
    ['mAtCh', True],
    ['No Match', False],
    ['Màtch', False],
])
def test_unit_automation(u1_s1, arg):
    target_name = "Matched Automation"
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, False)

    with scope(space=space):
        Automation.objects.get_or_create(name='unit test', type=Automation.UNIT_ALIAS, param_1=arg[0], param_2=target_name, created_by=user, space=space)
        assert (automation.apply_unit_automation(arg[0]) == target_name) is True


@pytest.mark.parametrize(
    "arg", [
        [[1, 'egg', 'white'], '', [1, '', 'egg', 'white']],
        [[1, 'Egg', 'white'], '', [1, '', 'Egg', 'white']],
        [[1, 'êgg', 'white'], '', [1, 'êgg', 'white']],
        [[1, 'egg', 'white'], 'whole', [1, 'whole', 'egg', 'white']],
    ]
)
def test_never_unit_automation(u1_s1, arg):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, False)

    with scope(space=space):
        Automation.objects.get_or_create(name='never unit test', type=Automation.NEVER_UNIT, param_1='egg', param_2=arg[1], created_by=user, space=space)
        assert automation.apply_never_unit_automation(arg[0]) == arg[2]


@pytest.mark.parametrize("source", [
    ['.*', True],
    ['.*allrecipes.*', True],
    ['.*google.*', False],
])
@pytest.mark.parametrize(
    "arg", [
        [Automation.DESCRIPTION_REPLACE],
        [Automation.INSTRUCTION_REPLACE],
        [Automation.NAME_REPLACE],
        [Automation.FOOD_REPLACE],
        [Automation.UNIT_REPLACE],
    ]
)
def test_regex_automation(u1_s1, arg, source):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, use_cache=False, source='https://www.allrecipes.com/recipe/24010/easy-chicken-marsala/')
    middle = 'test_remove_phrase'
    beginning = 'remove_test phrase'
    fail = 'test remove_phrase'
    target = 'test phrase'

    with scope(space=space):
        Automation.objects.get_or_create(name='regex middle test', type=arg[0], param_1=source[0], param_2='_remove_', param_3=' ', created_by=user, space=space)
        Automation.objects.get_or_create(name='regex beginning test', type=arg[0], param_1=source[0], param_2='^remove_', param_3='', created_by=user, space=space)
        assert (automation.apply_regex_replace_automation(middle, arg[0]) == target) == source[1]
        assert (automation.apply_regex_replace_automation(beginning, arg[0]) == target) == source[1]
        assert (automation.apply_regex_replace_automation(fail, arg[0]) == target) == False


@pytest.mark.parametrize(
    "arg", [
        ['second first', 'first second'],
        ['longer string second first longer string', 'longer string first second longer string'],
        ['second fails first', 'second fails first'],
    ]
)
def test_transpose_automation(u1_s1, arg):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    automation = AutomationEngine(request, False)

    with scope(space=space):
        Automation.objects.get_or_create(name='transpose words test', type=Automation.TRANSPOSE_WORDS, param_1='second', param_2='first', created_by=user, space=space)
        assert automation.apply_transpose_automation(arg[0]) == arg[1]


def test_url_import_regex_replace(u1_s1):
    # TODO this does not test import with multiple steps - do any sites import with this pattern?  It doesn't look like the url_importer supports it
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    recipe = 'regex_recipe.html'
    types = [Automation.DESCRIPTION_REPLACE, Automation.INSTRUCTION_REPLACE, Automation.NAME_REPLACE, Automation.FOOD_REPLACE, Automation.UNIT_REPLACE]
    find_text = "_remove"
    target_text = "Test"

    if 'cookbook' in os.getcwd():
        test_file = os.path.join(os.getcwd(), 'other', 'test_data', recipe)
        # TODO this catch doesn't really work depending on from where you start the test, must check for duplicate path sections
    else:
        test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', recipe)
    with open(test_file, 'r', encoding='UTF-8') as d:
        scrape = scrape_html(html=d.read(), org_url="https://testrecipe.test", supported_only=False)
    with scope(space=space):
        for t in types:
            Automation.objects.get_or_create(name=t, type=t, param_1='.*', param_2=find_text, param_3='', created_by=user, space=space)
        recipe_json = get_from_scraper(scrape, request)
    assert recipe_json['name'] == target_text
    assert recipe_json['description'] == target_text
    assert recipe_json['steps'][0]['instruction'] == target_text
    assert recipe_json['steps'][0]['ingredients'][0]['food']['name'] == target_text
    assert recipe_json['steps'][0]['ingredients'][0]['food']['name'] == target_text
    assert recipe_json['steps'][0]['ingredients'][1]['unit']['name'] == target_text
    assert recipe_json['steps'][0]['ingredients'][1]['unit']['name'] == target_text
