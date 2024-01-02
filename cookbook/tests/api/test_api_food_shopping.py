import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.tests.factories import FoodFactory

SHOPPING_LIST_URL = 'api:shoppinglistentry-list'
SHOPPING_FOOD_URL = 'api:food-shopping'


@pytest.fixture()
def food(request, space_1, u1_s1):
    return FoodFactory(space=space_1)


def test_shopping_forbidden_methods(food, u1_s1):
    r = u1_s1.post(
        reverse(SHOPPING_FOOD_URL, args={food.id}))
    assert r.status_code == 405

    r = u1_s1.delete(
        reverse(SHOPPING_FOOD_URL, args={food.id}))
    assert r.status_code == 405

    r = u1_s1.get(
        reverse(SHOPPING_FOOD_URL, args={food.id}))
    assert r.status_code == 405


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 204],
    ['u1_s2', 404],
    ['a1_s1', 204],
])
def test_shopping_food_create(request, arg, food):
    c = request.getfixturevalue(arg[0])
    r = c.put(reverse(SHOPPING_FOOD_URL, args={food.id}))
    assert r.status_code == arg[1]
    if r.status_code == 204:
        assert len(json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)) == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 204],
    ['u1_s2', 404],
    ['a1_s1', 204],
])
def test_shopping_food_delete(request, arg, food):
    c = request.getfixturevalue(arg[0])
    r = c.put(
        reverse(SHOPPING_FOOD_URL, args={food.id}),
        {'_delete': "true"},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 204:
        assert len(json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)) == 0


def test_shopping_food_share(u1_s1, u2_s1, food, space_1):
    with scope(space=space_1):
        user1 = auth.get_user(u1_s1)
        user2 = auth.get_user(u2_s1)
        food2 = FoodFactory(space=space_1)
    u1_s1.put(reverse(SHOPPING_FOOD_URL, args={food.id}))
    u2_s1.put(reverse(SHOPPING_FOOD_URL, args={food2.id}))
    sl_1 = json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)
    sl_2 = json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)
    assert len(sl_1) == 1
    assert len(sl_2) == 1
    sl_1[0]['created_by']['id'] == user1.id
    sl_2[0]['created_by']['id'] == user2.id

    with scopes_disabled():
        user1.userpreference.shopping_share.add(user2)
        user1.userpreference.save()
    assert len(json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)) == 1
    assert len(json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)) == 2
