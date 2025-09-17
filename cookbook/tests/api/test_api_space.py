import json

import pytest
from django.contrib import auth
from django.contrib.auth.models import Group
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import UserSpace
from recipes import settings

LIST_URL = 'api:space-list'
DETAIL_URL = 'api:space-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403, 0],
    ['g1_s1', 200, 1],
    ['u1_s1', 200, 1],
    ['a1_s1', 200, 1],
    ['a2_s1', 200, 1],
])
def test_list_permission(arg, request, space_1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    c = request.getfixturevalue(arg[0])
    result = c.get(reverse(LIST_URL))
    assert result.status_code == arg[1]
    if arg[1] == 200:
        assert len(json.loads(result.content)['results']) == arg[2]


def test_list_multiple(u1_s1, space_1, space_2):
    # only member of one space
    u1_response = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    assert len(u1_response['results']) == 1

    # add user to a second space
    us = UserSpace.objects.create(user=auth.get_user(u1_s1), space=space_2)
    us.groups.add(Group.objects.get(name='admin'))
    u1_response = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    assert len(u1_response['results']) == 2

    # test /current/ endpoint to only return active space
    u1_response = json.loads(u1_s1.get(reverse('api:space-current')).content)
    assert u1_response['id'] == space_1.id


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
    ['g1_s2', 403],
    ['u1_s2', 403],
    ['a1_s2', 404],
])
def test_update(arg, request, space_1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    with scopes_disabled():
        c = request.getfixturevalue(arg[0])
        r = c.patch(reverse(DETAIL_URL, args={space_1.id}), {'message': 'new'},
                    content_type='application/json')
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['message'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(reverse(LIST_URL), {'name': 'test'}, content_type='application/json')
    assert r.status_code == arg[1]


def test_delete(u1_s1, u1_s2, a1_s1, space_1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    # user cannot delete space
    r = u1_s1.delete(reverse(DETAIL_URL, args={space_1.id}))
    assert r.status_code == 403

    # event the space owner cannot delete his space over the api (this might change later but for now it's only available in the UI)
    r = a1_s1.delete(reverse(DETAIL_URL, args={space_1.id}))
    assert r.status_code == 405


def test_superuser_parameters(space_1, a1_s1, s1_s1):
    # ------- test as normal user -------
    response = a1_s1.post(reverse(LIST_URL), {'name': 'test', 'ai_enabled': not settings.SPACE_AI_ENABLED, 'ai_credits_monthly': settings.SPACE_AI_CREDITS_MONTHLY + 100, 'ai_credits_balance': 100},
                           content_type='application/json')

    assert response.status_code == 201
    response = json.loads(response.content)
    assert response['ai_enabled'] == settings.SPACE_AI_ENABLED
    assert response['ai_credits_monthly'] == settings.SPACE_AI_CREDITS_MONTHLY
    assert response['ai_credits_balance'] == 0

    space_1.created_by = auth.get_user(a1_s1)
    space_1.ai_enabled = False
    space_1.ai_credits_monthly = 0
    space_1.ai_credits_balance = 0
    space_1.save()

    response = a1_s1.patch(reverse(DETAIL_URL, args={space_1.id}), {'ai_enabled': True, 'ai_credits_monthly': 100, 'ai_credits_balance': 100},
                           content_type='application/json')

    assert response.status_code == 200

    space_1.refresh_from_db()
    assert space_1.ai_enabled == False
    assert space_1.ai_credits_monthly == 0
    assert space_1.ai_credits_balance == 0

    # ------- test as superuser -------

    response = s1_s1.post(reverse(LIST_URL),
                          {'name': 'test', 'ai_enabled': not settings.SPACE_AI_ENABLED, 'ai_credits_monthly': settings.SPACE_AI_CREDITS_MONTHLY + 100, 'ai_credits_balance': 100},
                          content_type='application/json')

    assert response.status_code == 201
    response = json.loads(response.content)
    assert response['ai_enabled'] == settings.SPACE_AI_ENABLED
    assert response['ai_credits_monthly'] == settings.SPACE_AI_CREDITS_MONTHLY
    assert response['ai_credits_balance'] == 0

    space_1.created_by = auth.get_user(s1_s1)
    space_1.ai_enabled = False
    space_1.ai_credits_monthly = 0
    space_1.ai_credits_balance = 0
    space_1.save()

    response = s1_s1.patch(reverse(DETAIL_URL, args={space_1.id}), {'ai_enabled': True, 'ai_credits_monthly': 100, 'ai_credits_balance': 100},
                           content_type='application/json')

    assert response.status_code == 200

    space_1.refresh_from_db()
    assert space_1.ai_enabled == True
    assert space_1.ai_credits_monthly == 100
    assert space_1.ai_credits_balance == 100
