import json
from datetime import timedelta

import factory
import pytest
from django.contrib import auth
from django.forms import model_to_dict
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import ShoppingListEntry
from cookbook.tests.factories import RecipeFactory

SHOPPING_LIST_URL = 'api:shoppinglistentry-list'
SHOPPING_RECIPE_URL = 'api:recipe-shopping'


@pytest.fixture()
def recipe(request, space_1, u1_s1):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    step_recipe = params.get('steps__count', 1)
    steps__recipe_count = params.get('steps__recipe_count', 0)
    steps__food_recipe_count = params.get('steps__food_recipe_count', {})
    created_by = params.get('created_by', auth.get_user(u1_s1))

    return RecipeFactory.create(
        steps__recipe_count=steps__recipe_count,
        steps__food_recipe_count=steps__food_recipe_count,
        created_by=created_by,
        space=space_1,
    )


@pytest.mark.parametrize("arg", [
    ['g1_s1', 204],
    ['u1_s1', 204],
    ['u1_s2', 404],
    ['a1_s1', 204],
])
@pytest.mark.parametrize("recipe, sle_count", [
    ({}, 10),
    ({'steps__recipe_count': 1}, 20),  # shopping list from recipe with StepRecipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}}, 19),  # shopping list from recipe with food recipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}, 'steps__recipe_count': 1}, 29),  # shopping list from recipe with StepRecipe and food recipe
], indirect=['recipe'])
def test_shopping_recipe_method(request, arg, recipe, sle_count,  u1_s1, u2_s1):
    c = request.getfixturevalue(arg[0])
    user = auth.get_user(c)
    user.userpreference.mealplan_autoadd_shopping = True
    user.userpreference.save()

    assert len(json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)) == 0

    url = reverse(SHOPPING_RECIPE_URL, args={recipe.id})
    r = c.put(url)
    assert r.status_code == arg[1]
    # only PUT method should work
    if r.status_code == 204:  # skip anonymous user

        r = json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)
        assert len(r) == sle_count  # recipe factory creates 10 ingredients by default
        assert [x['created_by']['id'] for x in r].count(user.id) == sle_count
        # user in space can't see shopping list
        assert len(json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)) == 0
        user.userpreference.shopping_share.add(auth.get_user(u2_s1))
        # after share, user in space can see shopping list
        assert len(json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)) == sle_count
        # confirm that the author of the recipe doesn't have access to shopping list
        if c != u1_s1:
            assert len(json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)) == 0

        r = c.get(url)
        assert r.status_code == 405
        r = c.post(url)
        assert r.status_code == 405
        r = c.delete(url)
        assert r.status_code == 405


# TODO test creating shopping list from recipe that includes recipes from multiple users
# TODO test create shopping list from recipe, excluding ingredients
# TODO meal plan recipe with all the user preferences tested
# TODO shopping list from recipe with different servings
