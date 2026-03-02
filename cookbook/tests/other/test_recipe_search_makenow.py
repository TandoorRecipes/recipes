"""Direct tests for RecipeSearch makenow filter.

Migrated from test_makenow_filter.py to use shared fixtures.
"""
import time

import pytest
from django.contrib import auth
from django_scopes import scope

from cookbook.models import Food, Household, UserSpace
from cookbook.tests.factories import FoodFactory, RecipeFactory
from cookbook.tests.other.conftest import _node_pos, do_search


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def makenow_recipe(request, space_1):
    onhand_user = auth.get_user(request.getfixturevalue(request.param.get('onhand_users', 'u1_s1')))
    recipe = RecipeFactory.create(space=space_1)
    for food in Food.objects.filter(ingredient__step__recipe=recipe.id):
        food.onhand_users.add(onhand_user)
    return recipe


@pytest.fixture
def shared_household(u1_s1, u2_s1, space_1):
    """Create a shared household for both test users so _makenow_filter can resolve shopping_users."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    household = Household.objects.create(name='test', space=space_1)
    UserSpace.objects.filter(user=user1, space=space_1).update(household=household)
    UserSpace.objects.filter(user=user2, space=space_1).update(household=household)


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'})
], indirect=['makenow_recipe'])
def test_makenow_onhand(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    results = do_search(request, space_1, makenow='true')
    ids = set(results.values_list('id', flat=True))
    assert len(ids) == 1
    assert makenow_recipe.id in ids


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'})
], indirect=['makenow_recipe'])
def test_makenow_ignoreshopping(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        food.onhand_users.clear()
        assert do_search(request, space_1, makenow='true').count() == 0
        food.ignore_shopping = True
        food.save()
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False
        ).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, ignore_shopping=True
        ).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'})
], indirect=['makenow_recipe'])
def test_makenow_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        assert do_search(request, space_1, makenow='true').count() == 0
        food.substitute.add(FoodFactory.create(space=space_1, onhand_users=[onhand_user]))
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False
        ).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, substitute__isnull=False
        ).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'})
], indirect=['makenow_recipe'])
def test_makenow_child_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        food.substitute_children = True
        food.save()
        assert do_search(request, space_1, makenow='true').count() == 0
        new_food = FoodFactory.create(space=space_1, onhand_users=[onhand_user])
        new_food.move(food, _node_pos)
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False
        ).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, numchild__gt=0
        ).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'})
], indirect=['makenow_recipe'])
def test_makenow_sibling_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        food.substitute_siblings = True
        food.save()
        assert do_search(request, space_1, makenow='true').count() == 0

        new_parent = FoodFactory.create(space=space_1)
        new_sibling = FoodFactory.create(space=space_1, onhand_users=[onhand_user])
        new_sibling.move(new_parent, _node_pos)
        food.move(new_parent, _node_pos)
        # force refresh from database, treebeard bypasses ORM after short pause
        time.sleep(1)
        food = Food.objects.get(id=food.id)
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False
        ).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, depth=2
        ).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id
