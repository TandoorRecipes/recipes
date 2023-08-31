import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.helper.automation_helper import AutomationEngine
from cookbook.models import Automation


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
        Automation.objects.get_or_create(name='keyword test', type=Automation.KEYWORD_ALIAS, param_1=arg[0], param_2=arg[1], created_by=user, space=space)
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


# def test_description_replace_automation():
#     assert True == True


# def test_instruction_replace_automation():
#     assert True == True

@pytest.mark.parametrize("arg", [
    [[1, 'egg', 'white'], '', [1, '', 'egg', 'white']],
    [[1, 'Egg', 'white'], '', [1, '', 'Egg', 'white']],
    [[1, 'êgg', 'white'], '', [1, 'êgg', 'white']],
    [[1, 'egg', 'white'], 'whole', [1, 'whole', 'egg', 'white']],
])
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


@pytest.mark.parametrize("arg", [
    ['second first', 'first second'],
    ['longer string second first longer string', 'longer string first second longer string'],
    ['second fails first', 'second fails first'],
])
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

    assert True == True
# # for some reason this tests cant run due to some kind of encoding issue, needs to be fixed
# # def test_description_replace_automation(u1_s1, space_1):
# #     if 'cookbook' in os.getcwd():
# #         test_file = os.path.join(os.getcwd(), 'other', 'test_data', 'chefkoch2.html')
# #     else:
# #         test_file = os.path.join(os.getcwd(), 'cookbook', 'tests', 'other', 'test_data', 'chefkoch2.html')
# #
# #     # original description
# #     # Brokkoli - Bratlinge. Über 91 Bewertungen und für vorzüglich befunden. Mit ► Portionsrechner ► Kochbuch ► Video-Tipps! Jetzt entdecken und ausprobieren!
# #
# #     with scopes_disabled():
# #         Automation.objects.create(
# #             name='test1',
# #             created_by=auth.get_user(u1_s1),
# #             space=space_1,
# #             param_1='.*',
# #             param_2='.*',
# #             param_3='',
# #             order=1000,
# #         )
# #
# #     with open(test_file, 'r', encoding='UTF-8') as d:
# #         response = u1_s1.post(
# #             reverse(IMPORT_SOURCE_URL),
# #             {
# #                 'data': d.read(),
# #                 'url': 'https://www.chefkoch.de/rezepte/804871184310070/Brokkoli-Bratlinge.html',
# #             },
# #             content_type='application/json')
# #         recipe = json.loads(response.content)['recipe_json']
# #         assert recipe['description'] == ''
