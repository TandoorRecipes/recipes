import json

import pytest
from django.contrib import auth
from django.forms import model_to_dict
from django.urls import reverse
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import Food, ShoppingListEntry
from cookbook.tests.factories import ShoppingListEntryFactory

LIST_URL = 'api:shoppinglistentry-list'
DETAIL_URL = 'api:shoppinglistentry-detail'

register(ShoppingListEntryFactory, 'sle_1', space=LazyFixture('space_1'))
register(ShoppingListEntryFactory, 'sle_2', space=LazyFixture('space_2'))


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(sle_1, sle_2, u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    with scopes_disabled():
        e = ShoppingListEntry.objects.first()
        e.space = space_2
        e.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


def test_get_detail(sle_1):
    # r = u1_s1.get(reverse(
    #     DETAIL_URL,
    #     args={sle_1.id}
    # ))
    # assert sle_1.id == 1
    pass


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, sle_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={sle_1.id}
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
def test_add(arg, request, sle_1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'food': model_to_dict(sle_1.food), 'amount': 1},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['food']['id'] == sle_1.food.pk


def test_delete(u1_s1, u1_s2, sle_1):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={sle_1.id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={sle_1.id}
        )
    )

    assert r.status_code == 204


# TODO test sharing
# TODO test completed entries still visible if today, but not yesterday
# TODO test create shopping list from recipe
# TODO test delete shopping list from recipe -  include created by, shared with and not shared with
# TODO test create shopping list from food
# TODO test delete shopping list from food -  include created by, shared with and not shared with
# TODO test create shopping list from mealplan
# TODO test create shopping list from recipe, excluding ingredients
# TODO test auto creating shopping list from meal plan
# TODO test excluding on-hand when auto creating shopping list
# test delay
# test completed_at when checked
# test completed_at cleared when unchecked
