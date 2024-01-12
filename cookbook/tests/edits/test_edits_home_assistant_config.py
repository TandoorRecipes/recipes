from cookbook.models import Storage, HomeAssistantConfig
from django.contrib import auth
from django.urls import reverse
import pytest

EDIT_VIEW_NAME = 'edit_home_assistant_config'


@pytest.fixture
def home_assistant_config_obj(a1_s1, space_1):
    return HomeAssistantConfig.objects.create(
        name='HomeAssistant 1',
        token='token',
        url='url',
        todo_entity='todo.shopping_list',
        enabled=True,
        created_by=auth.get_user(a1_s1),
        space=space_1,
    )


def test_edit_home_assistant_config(home_assistant_config_obj, a1_s1, a1_s2):
    new_token = '1234_token'

    r = a1_s1.post(
        reverse(EDIT_VIEW_NAME, args={home_assistant_config_obj.pk}),
        {
            'name': 'HomeAssistant 1',
            'token': new_token,
        }
    )
    home_assistant_config_obj.refresh_from_db()
    assert r.status_code == 200
    assert home_assistant_config_obj.token == new_token

    r = a1_s2.post(
        reverse(EDIT_VIEW_NAME, args={home_assistant_config_obj.pk}),
        {
            'name': 'HomeAssistant 1',
            'token': new_token,
        }
    )
    assert r.status_code == 404


@pytest.mark.parametrize(
    "arg", [
        ['a_u', 302],
        ['g1_s1', 302],
        ['u1_s1', 302],
        ['a1_s1', 200],
        ['g1_s2', 302],
        ['u1_s2', 302],
        ['a1_s2', 404],
    ])
def test_view_permission(arg, request, home_assistant_config_obj):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(EDIT_VIEW_NAME, args={home_assistant_config_obj.pk})).status_code == arg[1]
