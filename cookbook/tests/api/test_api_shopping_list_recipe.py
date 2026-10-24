import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled

from cookbook.models import ShoppingListEntry, ShoppingListRecipe, Food, Unit, Ingredient, ShoppingList, MealType, MealPlan

LIST_URL = 'api:shoppinglistrecipe-list'
DETAIL_URL = 'api:shoppinglistrecipe-detail'
BULK_CREATE_URL = 'api:shoppinglistrecipe-bulk-create-entries'


@pytest.fixture()
def obj_1(space_1, u1_s1, recipe_1_s1):
    r = ShoppingListRecipe.objects.create(recipe=recipe_1_s1, servings=1, space=space_1, created_by=auth.get_user(u1_s1))
    for ing in r.recipe.steps.first().ingredients.all():
        ShoppingListEntry.objects.create(list_recipe=r, ingredient=ing, food=ing.food, unit=ing.unit, amount=ing.amount, created_by=auth.get_user(u1_s1), space=space_1)
    return r


@pytest.mark.parametrize("arg", [['a_u', 403], ['g1_s1', 200], ['u1_s1', 200], ['a1_s1', 200], ])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


@pytest.mark.parametrize("arg", [['a_u', 403], ['g1_s1', 404], ['u1_s1', 200], ['a1_s1', 404], ['g1_s2', 404], ['u1_s2', 404], ['a1_s2', 404], ])
def test_update(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(reverse(DETAIL_URL, args={obj_1.id}), {'servings': 2}, content_type='application/json')
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert response['servings'] == 2


@pytest.mark.parametrize("arg", [['a_u', 403], ['g1_s1', 201], ['u1_s1', 201], ['a1_s1', 201], ])
def test_add(arg, request, obj_1, recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    r = c.post(reverse(LIST_URL), {'recipe': recipe_1_s1.pk, 'servings': 1}, content_type='application/json')
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['recipe'] == recipe_1_s1.pk


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(reverse(DETAIL_URL, args={obj_1.id}))
    assert r.status_code == 404

    r = u1_s1.delete(reverse(DETAIL_URL, args={obj_1.id}))

    assert r.status_code == 204


def test_bulk_create_entries(u1_s1, space_1, space_2, obj_1):
    with scopes_disabled():
        food_s1 = Food.objects.create(name='Food S1', space=space_1)
        unit_s1 = Unit.objects.create(name='Unit S1', space=space_1)
        ing_s1 = Ingredient.objects.create(food=food_s1, unit=unit_s1, amount=1, space=space_1)

        food_s2 = Food.objects.create(name='Food S2', space=space_2)
        unit_s2 = Unit.objects.create(name='Unit S2', space=space_2)
        ing_s2 = Ingredient.objects.create(food=food_s2, unit=unit_s2, amount=1, space=space_2)

        list_s1 = ShoppingList.objects.create(name='List S1', space=space_1)

    payload = {
        'shopping_lists_ids': [list_s1.id],
        'entries': [
            {
                'amount': 3.5,
                'unit_id': unit_s1.id,
                'food_id': food_s1.id,
                'ingredient_id': ing_s1.id,
            },
            {
                'amount': 2.0,
                'unit_id': unit_s2.id,  # foreign space unit
                'food_id': food_s1.id,
                'ingredient_id': ing_s1.id,
            },
            {
                'amount': 1.0,
                'unit_id': unit_s1.id,
                'food_id': food_s2.id,  # foreign space food -> should be skipped entirely
                'ingredient_id': ing_s1.id,
            },
            {
                'amount': 4.0,
                'unit_id': unit_s1.id,
                'food_id': food_s1.id,
                'ingredient_id': ing_s2.id,  # foreign space ingredient
            },
            {
                'amount': 5.0,
                'unit_id': None,
                'food_id': food_s1.id,
                'ingredient_id': None,
            }
        ]
    }

    url = reverse(BULK_CREATE_URL, args=[obj_1.id])
    r = u1_s1.post(url, payload, content_type='application/json')
    assert r.status_code == 200

    with scopes_disabled():
        created = ShoppingListEntry.objects.filter(list_recipe=obj_1, food=food_s1)
        amounts = [float(e.amount) for e in created]
        assert 3.5 in amounts
        assert 5.0 in amounts
        # Entry with foreign food must not be created
        assert not ShoppingListEntry.objects.filter(list_recipe=obj_1, food=food_s2).exists()
        # Check that shopping list relation was created
        for entry in created:
            assert entry.shopping_lists.filter(id=list_s1.id).exists()


def test_bulk_create_entries_food_default_shopping_lists(u1_s1, space_1, obj_1):
    with scopes_disabled():
        list_s1 = ShoppingList.objects.create(name='Default List', space=space_1)
        food_s1 = Food.objects.create(name='Food With List', space=space_1)
        food_s1.shopping_lists.add(list_s1)

    payload = {
        'entries': [
            {
                'amount': 2.0,
                'unit_id': None,
                'food_id': food_s1.id,
                'ingredient_id': None,
            }
        ]
    }

    url = reverse(BULK_CREATE_URL, args=[obj_1.id])
    r = u1_s1.post(url, payload, content_type='application/json')
    assert r.status_code == 200

    with scopes_disabled():
        entry = ShoppingListEntry.objects.filter(list_recipe=obj_1, food=food_s1, amount=2.0).first()
        assert entry is not None
        assert entry.shopping_lists.filter(id=list_s1.id).exists()


def test_bulk_create_entries_permissions(u1_s2, obj_1):
    url = reverse(BULK_CREATE_URL, args=[obj_1.id])
    r = u1_s2.post(url, {'entries': []}, content_type='application/json')
    assert r.status_code == 404

def test_private_recipe_requires_access_before_shopping_list_create(g1_s1, u1_s1, recipe_1_s1):
    owner = auth.get_user(u1_s1)
    guest = auth.get_user(g1_s1)
    with scopes_disabled():
        recipe_1_s1.private = True
        recipe_1_s1.created_by = owner
        recipe_1_s1.description = 'SYNTHETIC PRIVATE RECIPE'
        recipe_1_s1.save()

    assert g1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.pk])).status_code == 403
    with scopes_disabled():
        before = ShoppingListRecipe.objects.count()
    response = g1_s1.post(reverse(LIST_URL), {'recipe': recipe_1_s1.pk, 'servings': 1}, content_type='application/json')
    assert response.status_code == 400
    with scopes_disabled():
        assert ShoppingListRecipe.objects.count() == before
    assert recipe_1_s1.description.encode() not in response.content

    with scopes_disabled():
        recipe_1_s1.shared.add(guest)
    response = g1_s1.post(reverse(LIST_URL), {'recipe': recipe_1_s1.pk, 'servings': 1}, content_type='application/json')
    assert response.status_code == 201
    assert response.json()['recipe_data']['id'] == recipe_1_s1.pk


def test_existing_private_recipe_wrapper_is_hidden(g1_s1, u1_s1, recipe_1_s1, space_1):
    owner = auth.get_user(u1_s1)
    guest = auth.get_user(g1_s1)
    with scopes_disabled():
        recipe_1_s1.private = True
        recipe_1_s1.created_by = owner
        recipe_1_s1.save()
        wrapper = ShoppingListRecipe.objects.create(
            recipe=recipe_1_s1, servings=1, space=space_1, created_by=guest)

    response = g1_s1.get(reverse(LIST_URL))
    assert response.status_code == 200
    assert all(item['id'] != wrapper.pk for item in response.json()['results'])
    assert g1_s1.get(reverse(DETAIL_URL, args=[wrapper.pk])).status_code == 404

    with scopes_disabled():
        ingredient = recipe_1_s1.steps.first().ingredients.first()
        entry = ShoppingListEntry.objects.create(
            list_recipe=wrapper, food=ingredient.food, ingredient=ingredient,
            amount=1, created_by=guest, space=space_1)
    entry_response = g1_s1.get(reverse('api:shoppinglistentry-detail', args=[entry.pk]))
    assert entry_response.status_code == 404
    # assert entry_response.json()['list_recipe_data']['recipe_data'] is None

    with scopes_disabled():
        recipe_1_s1.shared.add(guest)
    detail = g1_s1.get(reverse(DETAIL_URL, args=[wrapper.pk]))
    assert detail.status_code == 200
    assert detail.json()['recipe_data']['id'] == recipe_1_s1.pk


def test_private_recipe_cannot_be_read_via_meal_plan_reference(g1_s1, u1_s1, recipe_1_s1, space_1):
    owner = auth.get_user(u1_s1)
    guest = auth.get_user(g1_s1)
    with scopes_disabled():
        recipe_1_s1.private = True
        recipe_1_s1.created_by = owner
        recipe_1_s1.description = 'SYNTHETIC PRIVATE MEAL PLAN RECIPE'
        recipe_1_s1.save()
        meal_type = MealType.objects.create(name='synthetic', space=space_1, created_by=owner)
        plan = MealPlan.objects.create(
            recipe=recipe_1_s1, space=space_1, meal_type=meal_type,
            from_date=timezone.now(), to_date=timezone.now(), created_by=owner)

    assert g1_s1.get(reverse('api:mealplan-detail', args=[plan.pk])).status_code == 404
    response = g1_s1.post(reverse(LIST_URL), {'mealplan': plan.pk, 'servings': 1}, content_type='application/json')
    assert recipe_1_s1.description.encode() not in response.content
    assert response.status_code == 400

    with scopes_disabled():
        wrapper = ShoppingListRecipe.objects.create(
            mealplan=plan, servings=1, space=space_1, created_by=guest)
        ingredient = recipe_1_s1.steps.first().ingredients.first()
        entry = ShoppingListEntry.objects.create(
            list_recipe=wrapper, food=ingredient.food, ingredient=ingredient,
            amount=1, created_by=guest, space=space_1)

    listing = g1_s1.get(reverse(LIST_URL))
    assert all(item['id'] != wrapper.pk for item in listing.json()['results'])
    assert g1_s1.get(reverse(DETAIL_URL, args=[wrapper.pk])).status_code == 404
    entry_response = g1_s1.get(reverse('api:shoppinglistentry-detail', args=[entry.pk]))
    assert entry_response.status_code == 404

    allowed = u1_s1.post(reverse(LIST_URL), {'mealplan': plan.pk, 'servings': 1}, content_type='application/json')
    assert allowed.status_code == 201
    assert allowed.json()['meal_plan_data']['recipe']['id'] == recipe_1_s1.pk