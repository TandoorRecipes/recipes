import json

import pytest
from django.contrib import auth
from django.forms import model_to_dict
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import ShoppingList, ShoppingListEntry, Food

LIST_URL = 'api:shoppinglistentry-list'
DETAIL_URL = 'api:shoppinglistentry-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(food=Food.objects.get_or_create(name='test 1', space=space_1)[0])
    s = ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )
    s.entries.add(e)
    return e


@pytest.fixture
def obj_2(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(food=Food.objects.get_or_create(name='test 2', space=space_1)[0])
    s = ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )
    s.entries.add(e)
    return e


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

    with scopes_disabled():
        s = ShoppingList.objects.first()
        s.space = space_2
        s.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


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
        {'amount': 2},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert response['amount'] == 2


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'food': model_to_dict(obj_1.food), 'amount': 1},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['food']['id'] == obj_1.food.pk


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
