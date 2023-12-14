import json
from datetime import datetime, timedelta

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.models import MealPlan, MealType
from cookbook.tests.factories import RecipeFactory

LIST_URL = 'api:mealplan-list'
DETAIL_URL = 'api:mealplan-detail'


# NOTE: auto adding shopping list from meal plan is tested in test_shopping_recipe as tests are identical


@pytest.fixture()
def meal_type(space_1, u1_s1):
    return MealType.objects.get_or_create(name='test', space=space_1, created_by=auth.get_user(u1_s1))[0]


@pytest.fixture()
def obj_1(space_1, recipe_1_s1, meal_type, u1_s1):
    return MealPlan.objects.create(recipe=recipe_1_s1, space=space_1, meal_type=meal_type, from_date=datetime.now(), to_date=datetime.now(),
                                   created_by=auth.get_user(u1_s1))


@pytest.fixture
def obj_2(space_1, recipe_1_s1, meal_type, u1_s1):
    return MealPlan.objects.create(recipe=recipe_1_s1, space=space_1, meal_type=meal_type, from_date=datetime.now(), to_date=datetime.now(),
                                   created_by=auth.get_user(u1_s1))


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


def test_list_filter(obj_1, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert len(response) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?meal_type={response[0]["meal_type"]["id"]}').content)
    assert len(response) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?meal_type=0').content)
    assert len(response) == 0

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?from_date={(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")}').content)
    assert len(response) == 0

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?to_date={(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")}').content)
    assert len(response) == 0

    response = json.loads(u1_s1.get(
        f'{reverse(LIST_URL)}?from_date={(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")}&to_date={(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")}').content)
    assert len(response) == 1


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
        {'title': 'new'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['title'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2, recipe_1_s1, meal_type):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'recipe': {'id': recipe_1_s1.id, 'name': recipe_1_s1.name, 'keywords': []}, 'meal_type': {'id': meal_type.id, 'name': meal_type.name},
         'from_date': (datetime.now()).strftime("%Y-%m-%d"), 'to_date': (datetime.now()).strftime("%Y-%m-%d"), 'servings': 1, 'title': 'test', 'shared': []},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(response)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['title'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
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
        assert MealPlan.objects.count() == 0


def test_add_with_shopping(u1_s1, meal_type):
    space = meal_type.space
    with scope(space=space):
        recipe = RecipeFactory.create(space=space)
    u1_s1.post(
        reverse(LIST_URL),
        {'recipe': {'id': recipe.id, 'name': recipe.name, 'keywords': []}, 'meal_type': {'id': meal_type.id, 'name': meal_type.name},
         'from_date': (datetime.now()).strftime("%Y-%m-%d"), 'to_date': (datetime.now()).strftime("%Y-%m-%d"), 'servings': 1, 'title': 'test', 'shared': [], 'addshopping': True},
        content_type='application/json'
    )

    assert len(json.loads(u1_s1.get(reverse('api:shoppinglistentry-list')).content)) == 10
