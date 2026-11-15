import json
import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import (
    CustomFilter, Food, Household, InventoryEntry, InventoryLocation,
    MealPlan, MealType, Recipe, RecipeBook, ShoppingList, ShoppingListEntry
)


def test_case1_inventory_location_household_isolation(space_1, space_2, u1_s1, u1_s2, a1_s1):
    """
    Case 1: InventoryLocation / InventoryEntry -> Household
    Prevent cross-Space Household mutation and unauthorized Household mutation.
    """
    with scopes_disabled():
        hh_space_1 = Household.objects.create(name='Household S1', space=space_1)
        hh_space_2 = Household.objects.create(name='Household S2', space=space_2)
        loc_1 = InventoryLocation.objects.create(name='Pantry', space=space_1, household=hh_space_1, created_by=auth.get_user(u1_s1))

    # 1. Attempt cross-Space Household rename via nested PATCH
    r = u1_s1.patch(
        reverse('api:inventorylocation-detail', args=[loc_1.id]),
        {'household': {'id': hh_space_2.id, 'name': 'Hacked Household S2'}},
        content_type='application/json'
    )
    with scopes_disabled():
        hh_space_2.refresh_from_db()
        assert hh_space_2.name == 'Household S2'

    # 2. Attempt setting foreign household_id should be rejected
    r = u1_s1.patch(
        reverse('api:inventorylocation-detail', args=[loc_1.id]),
        {'household_id': hh_space_2.id},
        content_type='application/json'
    )
    assert r.status_code == 400

    # 3. Attempt same-Space Household rename via nested PATCH
    r = u1_s1.patch(
        reverse('api:inventorylocation-detail', args=[loc_1.id]),
        {'household': {'id': hh_space_1.id, 'name': 'Renamed Household S1'}},
        content_type='application/json'
    )
    with scopes_disabled():
        hh_space_1.refresh_from_db()
        assert hh_space_1.name == 'Household S1'

    # 4. Valid linking of own household works
    r = a1_s1.patch(
        reverse('api:inventorylocation-detail', args=[loc_1.id]),
        {'household_id': hh_space_1.id},
        content_type='application/json'
    )
    assert r.status_code == 200
    res = json.loads(r.content)
    assert res['household']['id'] == hh_space_1.id


def test_case2_user_preference_meal_type_isolation(space_1, space_2, g1_s1, u1_s1):
    """
    Case 2: UserPreference -> MealType
    Prevent cross-Space MealType mutation and linking.
    """
    user_g = auth.get_user(g1_s1)
    with scopes_disabled():
        mt_space_1 = MealType.objects.create(name='Dinner S1', space=space_1, created_by=auth.get_user(u1_s1))
        mt_space_2 = MealType.objects.create(name='Dinner S2', space=space_2, created_by=auth.get_user(u1_s1))

    pref_url = reverse('api:userpreference-detail', args=[user_g.id])

    # 1. Attempt cross-Space MealType rename via nested PATCH
    r = g1_s1.patch(
        pref_url,
        {'default_meal_type': {'id': mt_space_2.id, 'name': 'Hacked MealType S2'}},
        content_type='application/json'
    )
    with scopes_disabled():
        mt_space_2.refresh_from_db()
        assert mt_space_2.name == 'Dinner S2'

    # 2. Attempt setting foreign default_meal_type_id directly should fail
    r = g1_s1.patch(
        pref_url,
        {'default_meal_type_id': mt_space_2.id},
        content_type='application/json'
    )
    assert r.status_code == 400

    # 3. Setting own space meal type via default_meal_type_id or default_meal_type dict works
    r = g1_s1.patch(
        pref_url,
        {'default_meal_type_id': mt_space_1.id},
        content_type='application/json'
    )
    assert r.status_code == 200
    res = json.loads(r.content)
    assert res['default_meal_type']['id'] == mt_space_1.id

    user_g.refresh_from_db()
    assert user_g.userpreference.default_meal_type == mt_space_1


def test_case3_shopping_list_entry_guest_creation_blocked(space_1, g1_s1, u1_s1):
    """
    Case 3: ShoppingListEntry -> Food / ShoppingList (same-Space only)
    Guests must be blocked from creating new Food and ShoppingList records via nested entry creation.
    """
    with scopes_disabled():
        existing_food = Food.objects.create(name='Existing Apple', space=space_1)
        existing_list = ShoppingList.objects.create(name='Existing List', space=space_1)

    url = reverse('api:shoppinglistentry-list')

    # 1. Guest attempts to create a new Food via nested field -> Rejected (400)
    r = g1_s1.post(
        url,
        {
            'food': {'name': 'New Guest Food'},
            'amount': '1',
            'shopping_lists': [{'id': existing_list.id}]
        },
        content_type='application/json'
    )
    assert r.status_code == 400
    with scopes_disabled():
        assert not Food.objects.filter(name='New Guest Food', space=space_1).exists()

    # 2. Guest attempts to create a new ShoppingList via nested field -> Rejected (400)
    r = g1_s1.post(
        url,
        {
            'food': {'id': existing_food.id, 'name': existing_food.name},
            'amount': '1',
            'shopping_lists': [{'name': 'New Guest List'}]
        },
        content_type='application/json'
    )
    assert r.status_code == 400
    with scopes_disabled():
        assert not ShoppingList.objects.filter(name='New Guest List', space=space_1).exists()

    # 3. Guest using existing Food and existing ShoppingList -> Succeeds (201)
    r = g1_s1.post(
        url,
        {
            'food': {'id': existing_food.id, 'name': existing_food.name},
            'amount': '2',
            'shopping_lists': [{'id': existing_list.id}]
        },
        content_type='application/json'
    )
    assert r.status_code == 201

    # 4. User (non-guest) CAN create new food / shopping list via nested field
    r = u1_s1.post(
        url,
        {
            'food': {'name': 'New User Food'},
            'amount': '1',
            'shopping_lists': [{'name': 'New User List'}]
        },
        content_type='application/json'
    )
    assert r.status_code == 201
    with scopes_disabled():
        assert Food.objects.filter(name='New User Food', space=space_1).exists()
        assert ShoppingList.objects.filter(name='New User List', space=space_1).exists()


def test_case4_meal_plan_guest_meal_type_creation_blocked(space_1, g1_s1, u1_s1):
    """
    Case 4: MealPlan -> MealType (same-Space only)
    Guests must be blocked from creating new MealType records via nested meal plan creation.
    """
    with scopes_disabled():
        existing_mt = MealType.objects.create(name='Existing Lunch', space=space_1, created_by=auth.get_user(u1_s1))

    url = reverse('api:mealplan-list')

    # 1. Guest attempts to create a new MealType via nested field -> Rejected (400)
    r = g1_s1.post(
        url,
        {
            'meal_type': {'name': 'New Guest MealType'},
            'from_date': '2026-11-20T12:00:00Z',
            'to_date': '2026-11-20T13:00:00Z',
            'servings': 1,
        },
        content_type='application/json'
    )
    assert r.status_code == 400
    with scopes_disabled():
        assert not MealType.objects.filter(name='New Guest MealType', space=space_1).exists()

    # 2. Guest creating a MealPlan with existing MealType -> Succeeds (201)
    r = g1_s1.post(
        url,
        {
            'meal_type': {'id': existing_mt.id, 'name': existing_mt.name},
            'from_date': '2026-11-20T12:00:00Z',
            'to_date': '2026-11-20T13:00:00Z',
            'servings': 1,
        },
        content_type='application/json'
    )
    assert r.status_code == 201

    # 3. User creating a MealPlan with a new MealType -> Succeeds (201)
    r = u1_s1.post(
        url,
        {
            'meal_type': {'name': 'New User MealType'},
            'from_date': '2026-11-20T12:00:00Z',
            'to_date': '2026-11-20T13:00:00Z',
            'servings': 1,
        },
        content_type='application/json'
    )
    assert r.status_code == 201
    with scopes_disabled():
        assert MealType.objects.filter(name='New User MealType', space=space_1).exists()


def test_case5_recipe_book_custom_filter_isolation(space_1, g1_s1, u1_s1, u2_s1):
    """
    Case 5: RecipeBook -> CustomFilter (cross-user, same Space)
    Prevent unauthorized mutation and access to other users' CustomFilters.
    """
    user_victim = auth.get_user(u1_s1)
    user_guest = auth.get_user(g1_s1)

    with scopes_disabled():
        victim_filter = CustomFilter.objects.create(
            name='Victim Filter',
            search='keyword=secret',
            space=space_1,
            created_by=user_victim
        )
        guest_filter = CustomFilter.objects.create(
            name='Guest Filter',
            search='keyword=guest',
            space=space_1,
            created_by=user_guest
        )

    url = reverse('api:recipebook-list')

    # 1. Guest attempts to rename/mutate victim's CustomFilter via nested object -> Must not mutate
    r = g1_s1.post(
        url,
        {
            'name': 'Guest Book',
            'shared': [],
            'filter': {
                'id': victim_filter.id,
                'name': 'Hacked Filter Name',
                'search': 'hacked'
            }
        },
        content_type='application/json'
    )
    # The request should either be rejected or should not mutate the victim's filter
    with scopes_disabled():
        victim_filter.refresh_from_db()
        assert victim_filter.name == 'Victim Filter'
        assert victim_filter.search == 'keyword=secret'
        assert victim_filter.created_by == user_victim

    # 2. Guest cannot link to victim's unshared filter
    assert r.status_code == 400

    # 3. Guest can create a RecipeBook with their own filter
    r = g1_s1.post(
        url,
        {
            'name': 'Guest Book 2',
            'shared': [],
            'filter_id': guest_filter.id,
        },
        content_type='application/json'
    )
    assert r.status_code == 201
    res = json.loads(r.content)
    assert res['filter']['id'] == guest_filter.id
