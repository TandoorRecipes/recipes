import json

import pytest
from django.contrib import auth
from django.core.cache import caches
from django.urls import reverse
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import Food
from cookbook.tests.factories import (FoodFactory, RecipeFactory, ShoppingListEntryFactory,
                                      SupermarketCategoryFactory)

LIST_URL = 'api:food-list'

register(SupermarketCategoryFactory, 'cat_1', space=LazyFixture('space_1'))
register(SupermarketCategoryFactory, 'cat_2', space=LazyFixture('space_1'))


def get_results(client, params=''):
    """Helper to GET the food list and return parsed results."""
    r = client.get(f'{reverse(LIST_URL)}{params}')
    assert r.status_code == 200
    return json.loads(r.content)


# ==================== onhand filter ====================

@pytest.mark.parametrize("filter_value,expected_count", [
    ('true', 1),
    ('false', 1),
])
def test_filter_onhand(filter_value, expected_count, u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_onhand = FoodFactory(space=space_1, users_onhand=[user])
        food_not_onhand = FoodFactory(space=space_1)

    response = get_results(u1_s1, f'?onhand={filter_value}')
    assert response['count'] == expected_count

    if filter_value == 'true':
        assert food_onhand.id in [x['id'] for x in response['results']]
    else:
        assert food_not_onhand.id in [x['id'] for x in response['results']]


def test_filter_onhand_shared_user(u1_s1, u2_s1, space_1):
    """Onhand filter should respect shopping sharing — shared user's onhand foods should be visible."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    # user2 shares shopping with user1, so user1 can see user2's onhand foods
    user2.userpreference.shopping_share.add(user1)
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')

    with scopes_disabled():
        food_onhand_user2 = FoodFactory(space=space_1, users_onhand=[user2])
        FoodFactory(space=space_1)

    response = get_results(u1_s1, '?onhand=true')
    assert food_onhand_user2.id in [x['id'] for x in response['results']]


# ==================== has_substitute filter ====================

def test_filter_has_substitute_true(u1_s1, space_1):
    with scopes_disabled():
        food_with_sub = FoodFactory(space=space_1)
        food_substitute = FoodFactory(space=space_1)
        food_without_sub = FoodFactory(space=space_1)
        food_with_sub.substitute.add(food_substitute)

    response = get_results(u1_s1, '?has_substitute=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_sub.id in result_ids
    assert food_without_sub.id not in result_ids


def test_filter_has_substitute_false(u1_s1, space_1):
    with scopes_disabled():
        food_with_sub = FoodFactory(space=space_1)
        food_substitute = FoodFactory(space=space_1)
        food_without_sub = FoodFactory(space=space_1)
        food_with_sub.substitute.add(food_substitute)

    response = get_results(u1_s1, '?has_substitute=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_sub.id not in result_ids
    # food_substitute and food_without_sub should be in results (neither has substitutes assigned TO them)
    assert food_without_sub.id in result_ids


# ==================== in_shopping_list filter ====================

def test_filter_in_shopping_list_true(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_in_list = FoodFactory(space=space_1)
        food_not_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    response = get_results(u1_s1, '?in_shopping_list=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_in_list.id in result_ids
    assert food_not_in_list.id not in result_ids


def test_filter_in_shopping_list_false(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_in_list = FoodFactory(space=space_1)
        food_not_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    response = get_results(u1_s1, '?in_shopping_list=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_in_list.id not in result_ids
    assert food_not_in_list.id in result_ids


def test_filter_in_shopping_list_checked_excluded(u1_s1, space_1):
    """Checked-off shopping list entries should NOT count as 'in shopping list'."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food, space=space_1, created_by=user, checked=True)

    response = get_results(u1_s1, '?in_shopping_list=true')
    result_ids = [x['id'] for x in response['results']]
    assert food.id not in result_ids


# ==================== ignore_shopping filter ====================

def test_filter_ignore_shopping(u1_s1, space_1):
    with scopes_disabled():
        food_ignored = FoodFactory(space=space_1)
        food_not_ignored = FoodFactory(space=space_1)
        food_ignored.ignore_shopping = True
        food_ignored.save()

    response = get_results(u1_s1, '?ignore_shopping=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_ignored.id in result_ids
    assert food_not_ignored.id not in result_ids

    response = get_results(u1_s1, '?ignore_shopping=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_ignored.id not in result_ids
    assert food_not_ignored.id in result_ids


# ==================== has_children filter ====================

def test_filter_has_children(u1_s1, space_1):
    if Food.node_order_by:
        node_location = 'sorted-child'
    else:
        node_location = 'last-child'

    with scopes_disabled():
        parent = FoodFactory(space=space_1)
        child = FoodFactory(space=space_1)
        leaf = FoodFactory(space=space_1)
        child.move(parent, node_location)
        # Re-fetch to get updated numchild
        parent = Food.objects.get(id=parent.id)
        child = Food.objects.get(id=child.id)

    response = get_results(u1_s1, '?has_children=true')
    result_ids = [x['id'] for x in response['results']]
    assert parent.id in result_ids
    assert child.id not in result_ids
    assert leaf.id not in result_ids

    response = get_results(u1_s1, '?has_children=false')
    result_ids = [x['id'] for x in response['results']]
    assert parent.id not in result_ids
    assert child.id in result_ids
    assert leaf.id in result_ids


# ==================== has_recipe filter ====================

def test_filter_has_recipe(u1_s1, space_1):
    with scopes_disabled():
        recipe = RecipeFactory(space=space_1)
        food_with_recipe = FoodFactory(space=space_1)
        food_without_recipe = FoodFactory(space=space_1)
        food_with_recipe.recipe = recipe
        food_with_recipe.save()

    response = get_results(u1_s1, '?has_recipe=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_recipe.id in result_ids
    assert food_without_recipe.id not in result_ids

    response = get_results(u1_s1, '?has_recipe=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_recipe.id not in result_ids
    assert food_without_recipe.id in result_ids


# ==================== supermarket_category filter ====================

def test_filter_supermarket_category(u1_s1, space_1, cat_1, cat_2):
    with scopes_disabled():
        food_cat1 = FoodFactory(space=space_1)
        food_cat2 = FoodFactory(space=space_1)
        food_no_cat = FoodFactory(space=space_1)
        food_cat1.supermarket_category = cat_1
        food_cat1.save()
        food_cat2.supermarket_category = cat_2
        food_cat2.save()

    response = get_results(u1_s1, f'?supermarket_category={cat_1.id}')
    result_ids = [x['id'] for x in response['results']]
    assert food_cat1.id in result_ids
    assert food_cat2.id not in result_ids
    assert food_no_cat.id not in result_ids


# ==================== combined filters ====================

def test_filter_combined(u1_s1, space_1, cat_1):
    """Multiple filters should be AND-combined."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_both = FoodFactory(space=space_1, users_onhand=[user])
        food_onhand_only = FoodFactory(space=space_1, users_onhand=[user])
        food_cat_only = FoodFactory(space=space_1)
        food_both.supermarket_category = cat_1
        food_both.save()
        food_cat_only.supermarket_category = cat_1
        food_cat_only.save()

    response = get_results(u1_s1, f'?onhand=true&supermarket_category={cat_1.id}')
    result_ids = [x['id'] for x in response['results']]
    assert food_both.id in result_ids
    assert food_onhand_only.id not in result_ids
    assert food_cat_only.id not in result_ids


# ==================== filter with no match ====================

def test_filter_no_results(u1_s1, space_1):
    with scopes_disabled():
        FoodFactory(space=space_1)

    response = get_results(u1_s1, '?onhand=true')
    assert response['count'] == 0


# ==================== filter values are case-insensitive ====================

def test_filter_case_insensitive(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        FoodFactory(space=space_1, users_onhand=[user])
        FoodFactory(space=space_1)

    for val in ['True', 'TRUE', 'true', '1']:
        response = get_results(u1_s1, f'?onhand={val}')
        assert response['count'] == 1, f"onhand={val} should return 1 result"
