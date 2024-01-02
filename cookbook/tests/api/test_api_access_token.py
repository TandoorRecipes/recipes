import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled
from oauth2_provider.models import AccessToken

LIST_URL = 'api:accesstoken-list'
DETAIL_URL = 'api:accesstoken-detail'


@pytest.fixture()
def obj_1(u1_s1):
    return AccessToken.objects.create(user=auth.get_user(u1_s1), scope='test', expires=timezone.now() + timezone.timedelta(days=365 * 5), token='test1')


@pytest.fixture()
def obj_2(u1_s1):
    return AccessToken.objects.create(user=auth.get_user(u1_s1), scope='test', expires=timezone.now() + timezone.timedelta(days=365 * 5), token='test2')


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(obj_1, obj_2, u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    obj_1.user = auth.get_user(u1_s2)
    obj_1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 1


def test_token_visibility(u1_s1, obj_1):
    # tokens should only be returned on the first API request (first 15 seconds)
    at = json.loads(u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id])).content)
    assert at['token'] == obj_1.token
    with scopes_disabled():
        obj_1.created = timezone.now() - timezone.timedelta(seconds=16)
        obj_1.save()
    at = json.loads(u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id])).content)
    assert at['token'] != obj_1.token


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        ),
        {'scope': 'lorem ipsum'},
        content_type='application/json'
    )
    assert r.status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2, u2_s1, recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'scope': 'test', 'expires': timezone.now() + timezone.timedelta(days=365 * 5)},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['scope'] == 'test'


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 204
