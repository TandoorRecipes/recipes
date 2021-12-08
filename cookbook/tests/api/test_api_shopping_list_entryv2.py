import json

import factory
import pytest
from django.contrib import auth
from django.forms import model_to_dict
from django.urls import reverse
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import ShoppingListEntry
from cookbook.tests.factories import FoodFactory, ShoppingListEntryFactory

LIST_URL = 'api:shoppinglistentry-list'
DETAIL_URL = 'api:shoppinglistentry-detail'


@pytest.fixture
def sle(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    return ShoppingListEntryFactory.create_batch(10, space=space_1, created_by=user)


@pytest.fixture
def sle_2(request):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    u = request.getfixturevalue(params.get('user', 'u1_s1'))
    user = auth.get_user(u)
    count = params.get('count', 10)
    return ShoppingListEntryFactory.create_batch(count, space=user.userpreference.space, created_by=user)


@ pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(sle,  u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    with scopes_disabled():
        e = ShoppingListEntry.objects.first()
        e.space = space_2
        e.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 9
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


def test_get_detail(u1_s1, sle):
    r = u1_s1.get(reverse(
        DETAIL_URL,
        args={sle[0].id}
    ))
    assert json.loads(r.content)['id'] == sle[0].id


@ pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, sle):
    c = request.getfixturevalue(arg[0])
    new_val = float(sle[0].amount + 1)
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        ),
        {'amount': new_val},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert response['amount'] == new_val


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, sle):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'food': model_to_dict(sle[0].food), 'amount': 1},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['food']['id'] == sle[0].food.pk


def test_delete(u1_s1, u1_s2, sle):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        )
    )

    assert r.status_code == 204


@pytest.mark.parametrize("shared, count, sle_2", [
    ('g1_s1', 20, {'user': 'g1_s1'}),
    ('g1_s2', 10, {'user': 'g1_s2'}),
    ('u2_s1', 20, {'user': 'u2_s1'}),
    ('u1_s2', 10, {'user': 'u1_s2'}),
    ('a1_s1', 20, {'user': 'a1_s1'}),
    ('a1_s2', 10, {'user': 'a1_s2'}),
], indirect=['sle_2'])
def test_sharing(request, shared, count, sle_2, sle, u1_s1):
    user = auth.get_user(u1_s1)
    shared_client = request.getfixturevalue(shared)
    shared_user = auth.get_user(shared_client)

    # confirm shared user can't access shopping list items created by u1_s1
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    assert len(json.loads(shared_client.get(reverse(LIST_URL)).content)) == 10

    user.userpreference.shopping_share.add(shared_user)
    # confirm sharing user only sees their shopping list
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    r = shared_client.get(reverse(LIST_URL))
    # confirm shared user sees their list and the list that's shared with them
    assert len(json.loads(r.content)) == count


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
