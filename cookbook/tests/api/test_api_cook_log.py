import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import CookLog

LIST_URL = 'api:cooklog-list'
DETAIL_URL = 'api:cooklog-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1, recipe_1_s1):
    return CookLog.objects.create(recipe=recipe_1_s1, created_by=auth.get_user(u1_s1), space=space_1)


@pytest.fixture
def obj_2(space_1, u1_s1, recipe_1_s1):
    return CookLog.objects.create(recipe=recipe_1_s1, created_by=auth.get_user(u1_s1), space=space_1)


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
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 2
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0

    obj_1.space = space_2
    obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],  # changed expected value.  based on list permissions the log is visible, but not editable
    ['u1_s1', 200],
    ['a1_s1', 403],  # changed expected value.  based on list permissions the log is visible, but not editable
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
        {'servings': 2},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['servings'] == 2


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
        {'recipe': recipe_1_s1.id},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 201:
        response = json.loads(r.content)
        assert response['recipe'] == recipe_1_s1.id
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u2_s1.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 403  # expected value changed.  user can list the log - detail should be 403 as no reason to 'hide' that it actually exists
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


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
    with scopes_disabled():
        assert CookLog.objects.count() == 0
