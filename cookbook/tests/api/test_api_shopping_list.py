import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import RecipeBook, Storage, Sync, SyncLog, ShoppingList

LIST_URL = 'api:shoppinglist-list'
DETAIL_URL = 'api:shoppinglist-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    return ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )


@pytest.fixture
def obj_2(space_1, u1_s1):
    return ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )


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

    obj_1.space = space_2
    obj_1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


def test_share(obj_1, u1_s1, u2_s1, u1_s2):
    assert u1_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 200
    assert u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 404
    assert u1_s2.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 404

    obj_1.shared.add(auth.get_user(u2_s1))
    obj_1.shared.add(auth.get_user(u1_s2))

    assert u1_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 200
    assert u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 200
    assert u1_s2.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 404


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
        {'note': 'new'},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert response['note'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'note': 'test', 'recipes': [], 'shared': [], 'entries': [], 'supermarket': None},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['note'] == 'test'


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
