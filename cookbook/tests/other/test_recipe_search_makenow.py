"""Direct tests for RecipeSearch makenow filter.

Tests use InventoryEntry (not Food.onhand_users) to track food availability.
"""
import time

import pytest
from django.contrib import auth
from django_scopes import scope

from cookbook.models import Food, Household, InventoryEntry, UserSpace
from cookbook.tests.factories import FoodFactory, InventoryEntryFactory, InventoryLocationFactory, RecipeFactory
from cookbook.tests.other.conftest import _node_pos, do_search


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def shared_household(u1_s1, u2_s1, space_1):
    """Create a shared household with an inventory location for both test users."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    household = Household.objects.create(name='test', space=space_1)
    UserSpace.objects.filter(user=user1, space=space_1).update(household=household)
    UserSpace.objects.filter(user=user2, space=space_1).update(household=household)
    location = InventoryLocationFactory(
        household=household,
        space=space_1,
        created_by=user1,
    )
    return household, location


@pytest.fixture
def makenow_recipe(request, space_1, shared_household):
    """Create a recipe where all foods have inventory entries."""
    household, location = shared_household
    created_by = auth.get_user(request.getfixturevalue(request.param.get('created_by', 'u1_s1')))
    recipe = RecipeFactory.create(space=space_1)
    for food in Food.objects.filter(ingredient__step__recipe=recipe.id):
        InventoryEntryFactory(
            food=food,
            inventory_location=location,
            amount=1,
            space=space_1,
            created_by=created_by,
        )
    return recipe


@pytest.mark.parametrize("makenow_recipe", [({'created_by': 'u1_s1'}), ({'created_by': 'u2_s1'})], indirect=['makenow_recipe'])
def test_makenow_onhand(recipes, makenow_recipe, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    results = do_search(request, space_1, makenow='true')
    ids = set(results.values_list('id', flat=True))
    assert len(ids) == 1
    assert makenow_recipe.id in ids


@pytest.mark.parametrize("makenow_recipe", [({'created_by': 'u1_s1'}), ({'created_by': 'u2_s1'})], indirect=['makenow_recipe'])
def test_makenow_ignoreshopping(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    household, location = shared_household
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        InventoryEntry.objects.filter(food=food, inventory_location__household=household).delete()
        assert do_search(request, space_1, makenow='true').count() == 0
        food.ignore_shopping = True
        food.save()
        assert InventoryEntry.objects.filter(
            food__ingredient__step__recipe=makenow_recipe.id,
            inventory_location__household=household,
            amount__gt=0,
        ).values('food').distinct().count() == 9
        assert Food.objects.filter(ingredient__step__recipe=makenow_recipe.id, ignore_shopping=True).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [({'created_by': 'u1_s1'}), ({'created_by': 'u2_s1'})], indirect=['makenow_recipe'])
def test_makenow_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    household, location = shared_household
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        InventoryEntry.objects.filter(food=food, inventory_location__household=household).delete()
        assert do_search(request, space_1, makenow='true').count() == 0
        sub_food = FoodFactory.create(space=space_1)
        InventoryEntryFactory(
            food=sub_food,
            inventory_location=location,
            amount=1,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )
        food.substitute.add(sub_food)
        assert InventoryEntry.objects.filter(
            food__ingredient__step__recipe=makenow_recipe.id,
            inventory_location__household=household,
            amount__gt=0,
        ).values('food').distinct().count() == 9
        assert Food.objects.filter(ingredient__step__recipe=makenow_recipe.id, substitute__isnull=False).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [({'created_by': 'u1_s1'}), ({'created_by': 'u2_s1'})], indirect=['makenow_recipe'])
def test_makenow_child_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    household, location = shared_household
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        InventoryEntry.objects.filter(food=food, inventory_location__household=household).delete()
        food.substitute_children = True
        food.save()
        assert do_search(request, space_1, makenow='true').count() == 0
        new_food = FoodFactory.create(space=space_1)
        InventoryEntryFactory(
            food=new_food,
            inventory_location=location,
            amount=1,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )
        new_food.move(food, _node_pos)
        assert InventoryEntry.objects.filter(
            food__ingredient__step__recipe=makenow_recipe.id,
            inventory_location__household=household,
            amount__gt=0,
        ).values('food').distinct().count() == 9
        assert Food.objects.filter(ingredient__step__recipe=makenow_recipe.id, numchild__gt=0).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [({'created_by': 'u1_s1'}), ({'created_by': 'u2_s1'})], indirect=['makenow_recipe'])
def test_makenow_sibling_substitute(recipes, makenow_recipe, shared_household, space_1, make_search_request, u1_s1):
    request = make_search_request(u1_s1)
    household, location = shared_household
    with scope(space=space_1):
        food = Food.objects.filter(ingredient__step__recipe=makenow_recipe.id).first()
        InventoryEntry.objects.filter(food=food, inventory_location__household=household).delete()
        food.substitute_siblings = True
        food.save()
        assert do_search(request, space_1, makenow='true').count() == 0

        new_parent = FoodFactory.create(space=space_1)
        new_sibling = FoodFactory.create(space=space_1)
        InventoryEntryFactory(
            food=new_sibling,
            inventory_location=location,
            amount=1,
            space=space_1,
            created_by=auth.get_user(u1_s1),
        )
        new_sibling.move(new_parent, _node_pos)
        food.move(new_parent, _node_pos)
        # treebeard's move() uses raw SQL that bypasses Django's ORM cache;
        # brief pause ensures the DB transaction is visible to subsequent reads
        time.sleep(1)
        food = Food.objects.get(id=food.id)
        assert InventoryEntry.objects.filter(
            food__ingredient__step__recipe=makenow_recipe.id,
            inventory_location__household=household,
            amount__gt=0,
        ).values('food').distinct().count() == 9
        assert Food.objects.filter(ingredient__step__recipe=makenow_recipe.id, depth=2).count() == 1
        results = do_search(request, space_1, makenow='true')
        assert results.count() == 1
        assert results.first().id == makenow_recipe.id


# --- New inventory-specific tests ---


def test_makenow_zero_amount_not_available(recipes, shared_household, space_1, make_search_request, u1_s1):
    """InventoryEntry with amount=0 should NOT count as available."""
    household, location = shared_household
    with scope(space=space_1):
        recipe = RecipeFactory.create(space=space_1)
        for food in Food.objects.filter(ingredient__step__recipe=recipe.id):
            InventoryEntryFactory(
                food=food,
                inventory_location=location,
                amount=0,
                space=space_1,
                created_by=auth.get_user(u1_s1),
            )
        request = make_search_request(u1_s1)
        results = do_search(request, space_1, makenow='true')
        assert recipe.id not in set(results.values_list('id', flat=True))


def test_makenow_other_household_not_visible(recipes, space_1, u1_s1, u2_s1, make_search_request):
    """Inventory in a different household shouldn't affect makenow results."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    # user1's household
    household1 = Household.objects.create(name='h1', space=space_1)
    UserSpace.objects.filter(user=user1, space=space_1).update(household=household1)
    # user2's separate household
    household2 = Household.objects.create(name='h2', space=space_1)
    UserSpace.objects.filter(user=user2, space=space_1).update(household=household2)

    with scope(space=space_1):
        recipe = RecipeFactory.create(space=space_1)
        # put all foods in user2's household inventory (not user1's)
        loc2 = InventoryLocationFactory(household=household2, space=space_1, created_by=user2)
        for food in Food.objects.filter(ingredient__step__recipe=recipe.id):
            InventoryEntryFactory(
                food=food,
                inventory_location=loc2,
                amount=1,
                space=space_1,
                created_by=user2,
            )
        # user1 should NOT see recipe as makeable
        request = make_search_request(u1_s1)
        results = do_search(request, space_1, makenow='true')
        assert recipe.id not in set(results.values_list('id', flat=True))


def test_makenow_ignoreshopping_onhand_no_double_count(recipes, shared_household, space_1, make_search_request, u1_s1):
    """Food that is both on-hand AND ignore_shopping should not cause negative missingfood count.

    Bug: if a food is on-hand (count_onhand subtracts 1) AND ignore_shopping
    (count_ignore_shopping subtracts 1), it gets double-subtracted, making
    missingfood = -1. This masks a truly missing food when makenow=1.
    """
    household, location = shared_household
    with scope(space=space_1):
        recipe = RecipeFactory.create(space=space_1)
        foods = list(Food.objects.filter(ingredient__step__recipe=recipe.id))
        assert len(foods) == 10  # RecipeFactory creates 10 foods

        # put 9 of 10 foods in inventory (food[0] is NOT on-hand)
        for food in foods[1:]:
            InventoryEntryFactory(
                food=food, inventory_location=location, amount=1,
                space=space_1, created_by=auth.get_user(u1_s1),
            )
        # mark one ON-HAND food as ignore_shopping too
        foods[1].ignore_shopping = True
        foods[1].save()

        request = make_search_request(u1_s1)
        # 1 food is truly missing → should appear with makenow=1
        results = do_search(request, space_1, makenow=1)
        assert recipe.id in set(results.values_list('id', flat=True))

        # should NOT appear with makenow=0 (exact match, 1 food is missing)
        results = do_search(request, space_1, makenow=0)
        assert recipe.id not in set(results.values_list('id', flat=True))


def test_makenow_no_household_returns_empty(recipes, space_1, u1_s1, make_search_request):
    """User with no household gets empty queryset for makenow."""
    user1 = auth.get_user(u1_s1)
    # Ensure user has no household
    UserSpace.objects.filter(user=user1, space=space_1).update(household=None)
    request = make_search_request(u1_s1)
    results = do_search(request, space_1, makenow='true')
    assert results.count() == 0
