import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.tests.factories import RecipeFactory

RELATED_URL = 'api:recipe-related'


@pytest.fixture()
def recipe(request, space_1, u1_s1):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    # step_recipe = params.get('steps__count', 1)   #  TODO add tests for step recipes
    steps__recipe_count = params.get('steps__recipe_count', 0)
    steps__food_recipe_count = params.get('steps__food_recipe_count', {})
    created_by = params.get('created_by', auth.get_user(u1_s1))

    return RecipeFactory.create(
        steps__recipe_count=steps__recipe_count,
        steps__food_recipe_count=steps__food_recipe_count,
        # steps__step_recipe=step_recipe,  #  TODO add tests for step recipes
        created_by=created_by,
        space=space_1,
    )


@pytest.mark.parametrize("arg", [
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['u1_s2', 404],
    ['a1_s1', 200],
])
@pytest.mark.parametrize("recipe, related_count", [
    ({}, 0),
    ({'steps__recipe_count': 1}, 1),  # shopping list from recipe with StepRecipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}}, 1),  # shopping list from recipe with food recipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}, 'steps__recipe_count': 1}, 2),  # shopping list from recipe with StepRecipe and food recipe
], indirect=['recipe'])
def test_get_related_recipes(request, arg, recipe, related_count, u1_s1, space_2):
    c = request.getfixturevalue(arg[0])
    r = c.get(reverse(RELATED_URL, args={recipe.id}))
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert len(json.loads(r.content)) == related_count


@pytest.mark.parametrize("recipe", [
    ({'steps__recipe_count': 1}),  # shopping list from recipe with StepRecipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}}),  # shopping list from recipe with food recipe
    ({'steps__food_recipe_count': {'step': 0, 'count': 1}, 'steps__recipe_count': 1}),  # shopping list from recipe with StepRecipe and food recipe
], indirect=['recipe'])
def test_related_mixed_space(request, recipe, u1_s2, space_2):
    with scopes_disabled():
        recipe.space = space_2
        recipe.save()
    assert len(json.loads(
        u1_s2.get(
            reverse(RELATED_URL, args={recipe.id})).content)) == 0


# TODO if/when related recipes includes multiple levels (related recipes of related recipes) add the following tests
#   -- step recipes included in step recipes
#   -- step recipes included in food recipes
#   -- food recipes included in step recipes
#   -- food recipes included in food recipes
#   -- -- included recipes in the wrong space
