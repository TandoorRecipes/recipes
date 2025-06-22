import json

import pytest
# work around for bug described here https://stackoverflow.com/a/70312265/15762829
from django.conf import settings
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Food, Ingredient, ShoppingListEntry
from cookbook.tests.factories import (MealPlanFactory, RecipeFactory,
                                      StepFactory, UserFactory)

if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    from django.db.backends.postgresql.features import DatabaseFeatures
    DatabaseFeatures.can_defer_constraint_checks = False

SHOPPING_LIST_URL = 'api:shoppinglistentry-list'
SHOPPING_RECIPE_URL = 'api:recipe-shopping'


@pytest.fixture()
def user2(request, u1_s1):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    user = auth.get_user(u1_s1)
    user.userpreference.mealplan_autoadd_shopping = params.get(
        'mealplan_autoadd_shopping', True)
    user.userpreference.mealplan_autoinclude_related = params.get(
        'mealplan_autoinclude_related', True)
    user.userpreference.mealplan_autoexclude_onhand = params.get(
        'mealplan_autoexclude_onhand', True)
    user.userpreference.save()
    return u1_s1


@pytest.fixture()
def recipe(request, space_1, u1_s1):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    params['created_by'] = params.get('created_by', auth.get_user(u1_s1))
    params['space'] = space_1
    return RecipeFactory(**params)


@pytest.mark.parametrize("arg", [
    ['g1_s1', 403],
    ['u1_s1', 204],
    ['u1_s2', 404],
    ['a1_s1', 204],
])
@pytest.mark.parametrize("recipe, sle_count", [
    ({}, 10),
    # shopping list from recipe with StepRecipe
    ({'steps__recipe_count': 1}, 20),
    # shopping list from recipe with food recipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}}, 19),
    # shopping list from recipe with StepRecipe and food recipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}, 'steps__recipe_count': 1}, 29),
], indirect=['recipe'])
def test_shopping_recipe_method(request, arg, recipe, sle_count, u1_s1, u2_s1):
    c = request.getfixturevalue(arg[0])
    user = auth.get_user(c)
    user.userpreference.mealplan_autoadd_shopping = True
    user.userpreference.save()

    assert json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 0

    url = reverse(SHOPPING_RECIPE_URL, args={recipe.id})
    r = c.put(url)
    assert r.status_code == arg[1]
    # only PUT method should work
    if r.status_code == 204:  # skip anonymous user

        r = json.loads(c.get(reverse(SHOPPING_LIST_URL)).content)
        # recipe factory creates 10 ingredients by default
        assert r['count'] == sle_count
        assert [x['created_by']['id'] for x in r['results']].count(user.id) == sle_count
        # user in space can't see shopping list
        assert json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 0
        user.userpreference.shopping_share.add(auth.get_user(u2_s1))
        # after share, user in space can see shopping list
        assert json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == sle_count
        # confirm that the author of the recipe doesn't have access to shopping list
        if c != u1_s1:
            assert json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 0

        r = c.get(url)
        assert r.status_code == 405
        r = c.post(url)
        assert r.status_code == 405
        r = c.delete(url)
        assert r.status_code == 405


def test_shopping_recipe_mixed_authors(u1_s1, u2_s1, space_1):
    with scopes_disabled():
        user1 = auth.get_user(u1_s1)
        user2 = auth.get_user(u2_s1)
        space = space_1
        user3 = UserFactory(space=space)
        recipe1 = RecipeFactory(created_by=user1, space=space)
        recipe2 = RecipeFactory(created_by=user2, space=space)
        recipe3 = RecipeFactory(created_by=user3, space=space)
        food = Food.objects.get(id=recipe1.steps.first().ingredients.first().food.id)
        food.recipe = recipe2
        food.save()
        recipe1.steps.add(StepFactory(step_recipe=recipe3, ingredients__count=0, space=space))
        recipe1.save()

        u1_s1.put(reverse(SHOPPING_RECIPE_URL, args={recipe1.id}))
        assert json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 29
        assert json.loads(u2_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 0


@pytest.mark.parametrize("recipe", [{'steps__ingredients__header': 1}], indirect=['recipe'])
def test_shopping_with_header_ingredient(u1_s1, recipe):
    u1_s1.put(reverse(SHOPPING_RECIPE_URL, args={recipe.id}))
    assert json.loads(u1_s1.get(reverse(SHOPPING_LIST_URL)).content)['count'] == 10
    assert json.loads(u1_s1.get(reverse('api:ingredient-list')).content)['count'] == 11
