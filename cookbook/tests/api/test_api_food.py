import json
from datetime import date
from unittest.mock import PropertyMock, patch

import pytest
from django.contrib import auth
from django.core.cache import caches
from django.urls import reverse
from django_scopes import scope, scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import Food, Ingredient, ShoppingListEntry
from cookbook.tests.factories import (FoodFactory, IngredientFactory, InventoryEntryFactory,
                                      InventoryLocationFactory, RecipeFactory,
                                      ShoppingListEntryFactory, StepFactory,
                                      SupermarketCategoryFactory)

#    ------------------ IMPORTANT -------------------
#
#  if changing any capabilities associated with food
#  you will need to ensure that it is tested against both
#  SqlLite and PostgresSQL
#  adding load_env() to settings.py will enable Postgress access
#
#    ------------------ IMPORTANT -------------------

LIST_URL = 'api:food-list'
DETAIL_URL = 'api:food-detail'
MOVE_URL = 'api:food-move'
MERGE_URL = 'api:food-merge'
STATS_URL = 'api:food-stats'
if (Food.node_order_by):
    node_location = 'sorted-child'
else:
    node_location = 'last-child'

register(FoodFactory, 'obj_1', space=LazyFixture('space_1'))
register(FoodFactory, 'obj_2', space=LazyFixture('space_1'))
register(FoodFactory, 'obj_3', space=LazyFixture('space_2'))
register(SupermarketCategoryFactory, 'cat_1', space=LazyFixture('space_1'))
register(SupermarketCategoryFactory, 'cat_2', space=LazyFixture('space_1'))


@pytest.fixture
def false():
    return False


@pytest.fixture
def non_exist():
    return {}


@pytest.fixture()
def obj_tree_1(request, space_1):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    inherit = params.pop('inherit', False)
    FoodFactory.create_batch(3, space=space_1, **params)
    objs = Food.objects.values_list('id', flat=True)
    obj_id = objs[1]
    child_id = objs[0]
    parent_id = objs[2]

    # set all foods to inherit everything
    if inherit:
        inherit = Food.inheritable_fields
        Through = Food.objects.filter(
            space=space_1).first().inherit_fields.through
        for i in inherit:
            Through.objects.bulk_create([
                Through(food_id=x, foodinheritfield_id=i.id)
                for x in Food.objects.filter(space=space_1).values_list('id', flat=True)
            ])

    Food.objects.get(id=child_id).move(
        Food.objects.get(id=obj_id), node_location)

    Food.objects.get(id=obj_id).move(
        Food.objects.get(id=parent_id), node_location)

    # whenever you move/merge a tree it's safest to re-get the object
    return Food.objects.get(id=obj_id)


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
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 2
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0

    with scopes_disabled():
        # for some reason the 'path' attribute changes between the factory and the test
        obj_1 = Food.objects.get(id=obj_1.id)
        obj_2 = Food.objects.get(id=obj_2.id)
        obj_1.space = space_2
        obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1


def test_list_filter(obj_1, obj_2, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert response['count'] == 2

    assert obj_1.name in [x['name'] for x in response['results']]
    assert obj_2.name in [x['name'] for x in response['results']]
    assert response['results'][0]['name'] < response['results'][1]['name']

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?page_size=1').content)
    assert len(response['results']) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=1').content)
    assert len(response['results']) == 1

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?query=''&limit=1').content)
    assert len(response['results']) == 1

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?query=chicken').content)
    assert response['count'] == 0

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?query={obj_1.name[:-4]}').content)
    assert response['count'] == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['g1_s2', 403],
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
        {'name': 'new'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['name'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'name': 'test'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['name'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_add_duplicate(u1_s1, u1_s2, obj_1, obj_3):
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] == obj_1.id
    assert response['name'] == obj_1.name
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1

    r = u1_s2.post(
        reverse(LIST_URL),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] != obj_1.id
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 2


def test_delete(u1_s1, u1_s2, obj_1, obj_tree_1):
    with scopes_disabled():
        assert Food.objects.count() == 4

    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404
    with scopes_disabled():
        assert Food.objects.count() == 4

    # should delete self and child, leaving parent
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_tree_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Food.objects.count() == 2
        assert Food.find_problems() == ([], [], [], [], [])


def test_move(u1_s1, obj_tree_1, obj_2, obj_3, space_1):
    with scope(space=space_1):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        parent = obj_tree_1.get_parent()
        assert parent.get_num_children() == 1
        assert parent.get_descendant_count() == 2
        assert Food.get_root_nodes().filter(space=space_1).count() == 2

    url = reverse(MOVE_URL, args=[obj_tree_1.id, obj_2.id])

    # move child to new parent, only HTTP put method should work
    r = u1_s1.get(url)
    assert r.status_code == 405
    r = u1_s1.post(url)
    assert r.status_code == 405
    r = u1_s1.delete(url)
    assert r.status_code == 405
    r = u1_s1.put(url)
    assert r.status_code == 200
    with scopes_disabled():
        # django-treebeard bypasses django ORM so object needs retrieved again
        parent = Food.objects.get(pk=parent.id)
        obj_2 = Food.objects.get(pk=obj_2.id)
        assert parent.get_num_children() == 0
        assert parent.get_descendant_count() == 0
        assert obj_2.get_num_children() == 1
        assert obj_2.get_descendant_count() == 2

    # run diagnostic to find problems - none should be found
    with scopes_disabled():
        assert Food.find_problems() == ([], [], [], [], [])


def test_move_errors(u1_s1, obj_tree_1, obj_3, space_1):
    with scope(space=space_1):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        parent = obj_tree_1.get_parent()
    # move child to root
    r = u1_s1.put(reverse(MOVE_URL, args=[obj_tree_1.id, 0]))
    assert r.status_code == 200
    with scopes_disabled():
        assert Food.get_root_nodes().filter(space=space_1).count() == 2

    # attempt to move to non-existent parent
    r = u1_s1.put(
        reverse(MOVE_URL, args=[parent.id, 9999])
    )
    assert r.status_code == 404

    # attempt to move non-existent mode to parent
    r = u1_s1.put(
        reverse(MOVE_URL, args=[9999, parent.id])
    )
    assert r.status_code == 404

    # attempt to move to wrong space
    r = u1_s1.put(
        reverse(MOVE_URL, args=[obj_tree_1.id, obj_3.id])
    )
    assert r.status_code == 404


# TODO: figure out how to generalize this to be all related objects
def test_merge_ingredients(obj_tree_1, u1_s1, space_1):
    with scope(space=space_1):
        parent = obj_tree_1.get_parent()
        child = obj_tree_1.get_descendants()[0]
        IngredientFactory.create(food=parent, space=space_1)
        IngredientFactory.create(food=child, space=space_1)
        assert parent.get_num_children() == 1
        assert parent.get_descendant_count() == 2
        assert Ingredient.objects.count() == 2
        assert parent.ingredient_set.count() == 1
        assert obj_tree_1.ingredient_set.count() == 0
        assert child.ingredient_set.count() == 1

    # merge food (with connected ingredient) with children to another food
    r = u1_s1.put(reverse(MERGE_URL, args=[child.id, obj_tree_1.id]))
    assert r.status_code == 200
    with scope(space=space_1):
        # django-treebeard bypasses django ORM so object needs retrieved again
        with pytest.raises(Food.DoesNotExist):
            Food.objects.get(pk=child.id)
        obj_tree_1 = Food.objects.get(pk=obj_tree_1.id)
        assert obj_tree_1.ingredient_set.count() == 1  # now has child's ingredient


def test_merge_shopping_entries(obj_tree_1, u1_s1, space_1):
    with scope(space=space_1):
        parent = obj_tree_1.get_parent()
        child = obj_tree_1.get_descendants()[0]
        ShoppingListEntryFactory.create(food=parent, space=space_1)
        ShoppingListEntryFactory.create(food=child, space=space_1)
        assert parent.get_num_children() == 1
        assert parent.get_descendant_count() == 2
        assert ShoppingListEntry.objects.count() == 2
        assert parent.shopping_entries.count() == 1
        assert obj_tree_1.shopping_entries.count() == 0
        assert child.shopping_entries.count() == 1

    # merge food (with connected shoppinglistentry) with children to another food
    r = u1_s1.put(reverse(MERGE_URL, args=[child.id, obj_tree_1.id]))
    assert r.status_code == 200
    with scope(space=space_1):
        # django-treebeard bypasses django ORM so object needs retrieved again
        with pytest.raises(Food.DoesNotExist):
            Food.objects.get(pk=child.id)
        obj_tree_1 = Food.objects.get(pk=obj_tree_1.id)
        assert obj_tree_1.shopping_entries.count() == 1  # now has child's ingredient


def test_merge(u1_s1, obj_tree_1, obj_1, obj_3, space_1):
    with scope(space=space_1):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        parent = obj_tree_1.get_parent()
        child = obj_tree_1.get_descendants()[0]
        assert parent.get_num_children() == 1
        assert parent.get_descendant_count() == 2
        assert Food.get_root_nodes().filter(space=space_1).count() == 2
        assert Food.objects.count() == 4

    # merge food with no children with another food, only HTTP put method should work
    url = reverse(MERGE_URL, args=[child.id, obj_tree_1.id])
    r = u1_s1.get(url)
    assert r.status_code == 405
    r = u1_s1.post(url)
    assert r.status_code == 405
    r = u1_s1.delete(url)
    assert r.status_code == 405
    r = u1_s1.put(url)
    assert r.status_code == 200
    with scope(space=space_1):
        # django-treebeard bypasses django ORM so object needs retrieved again
        with pytest.raises(Food.DoesNotExist):
            Food.objects.get(pk=child.id)
        obj_tree_1 = Food.objects.get(pk=obj_tree_1.id)
        assert parent.get_num_children() == 1
        assert parent.get_descendant_count() == 1

    # merge food with children with another food
    r = u1_s1.put(reverse(MERGE_URL, args=[parent.id, obj_1.id]))
    assert r.status_code == 200
    with scope(space=space_1):
        # django-treebeard bypasses django ORM so object needs retrieved again
        with pytest.raises(Food.DoesNotExist):
            Food.objects.get(pk=parent.id)
        obj_1 = Food.objects.get(pk=obj_1.id)
        assert obj_1.get_num_children() == 1
        assert obj_1.get_descendant_count() == 1

    # run diagnostic to find problems - none should be found
    with scopes_disabled():
        assert Food.find_problems() == ([], [], [], [], [])


def test_merge_errors(u1_s1, obj_tree_1, obj_3, space_1):
    with scope(space=space_1):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        parent = obj_tree_1.get_parent()

    # attempt to merge with non-existent parent
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_tree_1.id, 9999])
    )
    assert r.status_code == 404

    # attempt to merge non-existent node to parent
    r = u1_s1.put(
        reverse(MERGE_URL, args=[9999, obj_tree_1.id])
    )
    assert r.status_code == 404
    # attempt to move to wrong space
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_tree_1.id, obj_3.id])
    )
    assert r.status_code == 404

    # attempt to merge with child
    r = u1_s1.put(
        reverse(MERGE_URL, args=[parent.id, obj_tree_1.id])
    )
    assert r.status_code == 403

    # attempt to merge with self
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_tree_1.id, obj_tree_1.id])
    )
    assert r.status_code == 403


def test_root_filter(obj_tree_1, obj_2, obj_3, u1_s1):
    with scope(space=obj_tree_1.space):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        obj_2 = Food.objects.get(id=obj_2.id)
        parent = obj_tree_1.get_parent()

    # should return root objects in the space (obj_1, obj_2), ignoring query filters
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?root=0').content)
    assert len(response['results']) == 2

    # django_tree bypasses ORM - best to retrieve all changed objects
    with scopes_disabled():
        obj_2.move(parent, node_location)
        obj_2 = Food.objects.get(id=obj_2.id)
        parent = Food.objects.get(id=parent.id)
    # should return direct children of parent (obj_tree_1, obj_2), ignoring query filters
    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?root={parent.id}').content)
    assert response['count'] == 2
    response = json.loads(u1_s1.get(
        f'{reverse(LIST_URL)}?root={parent.id}&query={obj_2.name[4:]}').content)
    assert response['count'] == 2


def test_tree_filter(obj_tree_1, obj_2, obj_3, u1_s1):
    with scope(space=obj_tree_1.space):
        # for some reason the 'path' attribute changes between the factory and the test when using both obj_tree and obj
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        obj_2 = Food.objects.get(id=obj_2.id)
        parent = obj_tree_1.get_parent()
        obj_2.move(parent, node_location)
        obj_2 = Food.objects.get(id=obj_2.id)

    # should return full tree starting at, but excluding parent (obj_tree_1, obj_2), ignoring query filters
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?tree={parent.id}').content)
    assert response['count'] == 4
    # filtering is ignored - should return identical results as ?tree=x
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?tree={parent.id}&query={obj_2.name[4:]}').content)
    assert response['count'] == 4


# This is more about the model than the API - should this be moved to a different test?
@pytest.mark.parametrize("obj_tree_1, field, inherit, new_val", [
    ({'has_category': True, 'inherit': True},
     'supermarket_category', True, 'cat_1'),
    ({'has_category': True, 'inherit': False},
     'supermarket_category', False, 'cat_1'),
    ({'ignore_shopping': True, 'inherit': True}, 'ignore_shopping', True, 'false'),
    ({'ignore_shopping': True, 'inherit': False},
     'ignore_shopping', False, 'false'),
    ({'substitute_children': True, 'inherit': True},
     'substitute_children', True, 'false'),
    ({'substitute_children': True, 'inherit': False},
     'substitute_children', False, 'false'),
    ({'substitute_siblings': True, 'inherit': True},
     'substitute_siblings', True, 'false'),
    ({'substitute_siblings': True, 'inherit': False},
     'substitute_siblings', False, 'false'),
], indirect=['obj_tree_1'])  # indirect=True populates magic variable request.param of obj_tree_1 with the parameter
def test_inherit(request, obj_tree_1, field, inherit, new_val, u1_s1):
    with scope(space=obj_tree_1.space):
        parent = obj_tree_1.get_parent()
        child = obj_tree_1.get_descendants()[0]

    new_val = request.getfixturevalue(new_val)
    # if this test passes it demonstrates that inheritance works
    #  when moving to a parent as each food is created with a different category
    assert (getattr(parent, field) == getattr(
        obj_tree_1, field)) in [inherit, True]
    assert (getattr(obj_tree_1, field) == getattr(
        child, field)) in [inherit, True]
    # change parent to a new value
    setattr(parent, field, new_val)
    with scope(space=parent.space):
        parent.save()  # trigger post-save signal
        # get the objects again because values are cached
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        child = Food.objects.get(id=child.id)
    # when changing parent value the obj value should be same if inherited
    assert (getattr(obj_tree_1, field) == new_val) == inherit
    assert (getattr(child, field) == new_val) == inherit


# TODO add test_inherit with child_inherit


@pytest.mark.parametrize("obj_tree_1", [
    ({
        'has_category': True,
        'inherit': False,
        'ignore_shopping': True,
        'substitute_children': True,
        'substitute_siblings': True,
    }),
], indirect=['obj_tree_1'])
@pytest.mark.parametrize("global_reset", [True, False])
@pytest.mark.parametrize("field", ['ignore_shopping', 'substitute_children', 'substitute_siblings', 'supermarket_category'])
def test_reset_inherit_space_fields(obj_tree_1, space_1, global_reset, field):
    with scope(space=space_1):
        parent = obj_tree_1.get_parent()
        child = obj_tree_1.get_descendants()[0]

        if field == 'supermarket_category':
            assert parent.supermarket_category != child.supermarket_category
            assert parent.supermarket_category != obj_tree_1.supermarket_category
        else:
            setattr(obj_tree_1, field, False)
            obj_tree_1.save()
            assert getattr(parent, field) == getattr(child, field)
            assert getattr(parent, field) != getattr(obj_tree_1, field)

        if global_reset:
            # set default inherit fields
            space_1.food_inherit.add(*Food.inheritable_fields.values_list('id', flat=True))
            parent.reset_inheritance(space=space_1)
        else:
            obj_tree_1.child_inherit_fields.set(Food.inheritable_fields.values_list('id', flat=True))
            obj_tree_1.save()
            parent.reset_inheritance(space=space_1, food=obj_tree_1)
        # djangotree bypasses ORM and need to be retrieved again
        obj_tree_1 = Food.objects.get(id=obj_tree_1.id)
        parent = Food.objects.get(id=parent.id)
        child = Food.objects.get(id=child.id)

        assert (getattr(parent, field) == getattr(obj_tree_1, field)) == global_reset
        assert getattr(obj_tree_1, field) == getattr(child, field)


@pytest.mark.parametrize("obj_tree_1", [
    ({
        'has_category': True,
        'inherit': False,
        'ignore_shopping': True,
        'substitute_children': True,
        'substitute_siblings': True,
    }),
], indirect=['obj_tree_1'])
@pytest.mark.parametrize("field", ['ignore_shopping', 'substitute_children', 'substitute_siblings', 'supermarket_category'])
def test_reset_inherit_no_food_instances(obj_tree_1, space_1, field):
    with scope(space=space_1):
        parent = obj_tree_1.get_parent()
        Food.objects.all().delete()

        # set default inherit fields
        space_1.food_inherit.add(*Food.inheritable_fields.values_list('id', flat=True))
        parent.reset_inheritance(space=space_1)


def test_onhand(obj_1, u1_s1, u2_s1, space_1):
    assert json.loads(u1_s1.get(reverse(DETAIL_URL, args={obj_1.id})).content)['food_onhand'] is False
    assert json.loads(u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).content)['food_onhand'] is False

    u1_s1.patch(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        ),
        {'food_onhand': True},
        content_type='application/json'
    )
    assert json.loads(u1_s1.get(reverse(DETAIL_URL, args={obj_1.id})).content)['food_onhand'] is True
    assert json.loads(u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).content)['food_onhand'] is False

    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    user1.userpreference.shopping_share.add(user2)
    caches['default'].set(f'shopping_shared_users_{space_1.id}_{user2.id}', None)

    assert json.loads(u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).content)['food_onhand'] is True


# ==================== list filter helpers ====================

def get_filter_results(client, params=''):
    """Helper to GET the food list and return parsed results."""
    r = client.get(f'{reverse(LIST_URL)}{params}')
    assert r.status_code == 200
    return json.loads(r.content)


def get_stats(client):
    """Helper to GET the dedicated food stats endpoint and return parsed results."""
    r = client.get(reverse(STATS_URL))
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

    response = get_filter_results(u1_s1, f'?onhand={filter_value}')
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

    response = get_filter_results(u1_s1, '?onhand=true')
    assert food_onhand_user2.id in [x['id'] for x in response['results']]


def test_filter_onhand_no_duplicates(u1_s1, u2_s1, space_1):
    """Onhand filter should not return duplicate rows when food is onhand for multiple shared users."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    user2.userpreference.shopping_share.add(user1)
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')

    with scopes_disabled():
        # food is onhand for both user1 AND user2 (both in shared_users)
        food = FoodFactory(space=space_1, users_onhand=[user1, user2])

    response = get_filter_results(u1_s1, '?onhand=true')
    result_ids = [x['id'] for x in response['results']]
    assert result_ids.count(food.id) == 1, f"Food {food.id} appears {result_ids.count(food.id)} times, expected 1"


# ==================== has_substitute filter ====================

def test_filter_has_substitute_true(u1_s1, space_1):
    with scopes_disabled():
        food_with_sub = FoodFactory(space=space_1)
        food_substitute = FoodFactory(space=space_1)
        food_without_sub = FoodFactory(space=space_1)
        food_with_sub.substitute.add(food_substitute)

    response = get_filter_results(u1_s1, '?has_substitute=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_sub.id in result_ids
    assert food_substitute.id in result_ids  # symmetrical M2M: food_substitute also has a substitute
    assert food_without_sub.id not in result_ids


def test_filter_has_substitute_false(u1_s1, space_1):
    with scopes_disabled():
        food_with_sub = FoodFactory(space=space_1)
        food_substitute = FoodFactory(space=space_1)
        food_without_sub = FoodFactory(space=space_1)
        food_with_sub.substitute.add(food_substitute)

    response = get_filter_results(u1_s1, '?has_substitute=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_sub.id not in result_ids
    # Only food_without_sub should be in results; food_substitute is excluded because
    # symmetrical M2M means it also has food_with_sub as a substitute
    assert food_substitute.id not in result_ids
    assert food_without_sub.id in result_ids


# ==================== in_shopping_list filter ====================

def test_filter_in_shopping_list_true(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_in_list = FoodFactory(space=space_1)
        food_not_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    response = get_filter_results(u1_s1, '?in_shopping_list=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_in_list.id in result_ids
    assert food_not_in_list.id not in result_ids


def test_filter_in_shopping_list_false(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_in_list = FoodFactory(space=space_1)
        food_not_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    response = get_filter_results(u1_s1, '?in_shopping_list=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_in_list.id not in result_ids
    assert food_not_in_list.id in result_ids


def test_filter_in_shopping_list_checked_excluded(u1_s1, space_1):
    """Checked-off shopping list entries should NOT count as 'in shopping list'."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food, space=space_1, created_by=user, checked=True)

    response = get_filter_results(u1_s1, '?in_shopping_list=true')
    result_ids = [x['id'] for x in response['results']]
    assert food.id not in result_ids


# ==================== ignore_shopping filter ====================

def test_filter_ignore_shopping(u1_s1, space_1):
    with scopes_disabled():
        food_ignored = FoodFactory(space=space_1)
        food_not_ignored = FoodFactory(space=space_1)
        food_ignored.ignore_shopping = True
        food_ignored.save()

    response = get_filter_results(u1_s1, '?ignore_shopping=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_ignored.id in result_ids
    assert food_not_ignored.id not in result_ids

    response = get_filter_results(u1_s1, '?ignore_shopping=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_ignored.id not in result_ids
    assert food_not_ignored.id in result_ids


# ==================== has_children filter ====================

def test_filter_has_children(u1_s1, space_1):
    with scopes_disabled():
        parent = FoodFactory(space=space_1)
        child = FoodFactory(space=space_1)
        leaf = FoodFactory(space=space_1)
        child.move(parent, node_location)
        # Re-fetch to get updated numchild
        parent = Food.objects.get(id=parent.id)
        child = Food.objects.get(id=child.id)

    response = get_filter_results(u1_s1, '?has_children=true')
    result_ids = [x['id'] for x in response['results']]
    assert parent.id in result_ids
    assert child.id not in result_ids
    assert leaf.id not in result_ids

    response = get_filter_results(u1_s1, '?has_children=false')
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

    response = get_filter_results(u1_s1, '?has_recipe=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_recipe.id in result_ids
    assert food_without_recipe.id not in result_ids

    response = get_filter_results(u1_s1, '?has_recipe=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_with_recipe.id not in result_ids
    assert food_without_recipe.id in result_ids


# ==================== used_in_recipes filter ====================

def test_filter_used_in_recipes(u1_s1, space_1):
    with scopes_disabled():
        food_used = FoodFactory(name='UsedFood', space=space_1)
        food_unused = FoodFactory(name='UnusedFood', space=space_1)
        # Wire up: Ingredient(food) → Step → Recipe
        ingredient = IngredientFactory(food=food_used, space=space_1)
        step = StepFactory(ingredients__count=0, space=space_1)
        step.ingredients.add(ingredient)
        recipe = RecipeFactory(steps__count=0, space=space_1)
        recipe.steps.add(step)

    response = get_filter_results(u1_s1, '?used_in_recipes=true')
    result_ids = [x['id'] for x in response['results']]
    assert food_used.id in result_ids
    assert food_unused.id not in result_ids

    response = get_filter_results(u1_s1, '?used_in_recipes=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_used.id not in result_ids
    assert food_unused.id in result_ids


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

    response = get_filter_results(u1_s1, f'?supermarket_category={cat_1.id}')
    result_ids = [x['id'] for x in response['results']]
    assert food_cat1.id in result_ids
    assert food_cat2.id not in result_ids
    assert food_no_cat.id not in result_ids


def test_filter_supermarket_category_invalid(u1_s1, space_1):
    """Non-integer supermarket_category should not cause a 500 error."""
    r = u1_s1.get(f'{reverse(LIST_URL)}?supermarket_category=abc')
    assert r.status_code == 200
    response = json.loads(r.content)
    assert response['count'] == 0


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

    response = get_filter_results(u1_s1, f'?onhand=true&supermarket_category={cat_1.id}')
    result_ids = [x['id'] for x in response['results']]
    assert food_both.id in result_ids
    assert food_onhand_only.id not in result_ids
    assert food_cat_only.id not in result_ids


# ==================== filter with no match ====================

def test_filter_no_results(u1_s1, space_1):
    with scopes_disabled():
        FoodFactory(space=space_1)

    response = get_filter_results(u1_s1, '?onhand=true')
    assert response['count'] == 0


# ==================== filter values are case-insensitive ====================

def test_filter_case_insensitive(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        FoodFactory(space=space_1, users_onhand=[user])
        FoodFactory(space=space_1)

    for val in ['True', 'TRUE', 'true', '1']:
        response = get_filter_results(u1_s1, f'?onhand={val}')
        assert response['count'] == 1, f"onhand={val} should return 1 result"


# ==================== ordering ====================

def test_ordering_name_asc(u1_s1, space_1):
    with scopes_disabled():
        FoodFactory(name='Banana', space=space_1)
        FoodFactory(name='Apple', space=space_1)
        FoodFactory(name='Cherry', space=space_1)

    response = get_filter_results(u1_s1, '?ordering=name')
    names = [x['name'] for x in response['results']]
    assert names == sorted(names, key=str.lower)


def test_ordering_name_desc(u1_s1, space_1):
    with scopes_disabled():
        FoodFactory(name='Banana', space=space_1)
        FoodFactory(name='Apple', space=space_1)
        FoodFactory(name='Cherry', space=space_1)

    response = get_filter_results(u1_s1, '?ordering=-name')
    names = [x['name'] for x in response['results']]
    assert names == sorted(names, key=str.lower, reverse=True)


def test_ordering_numrecipe(u1_s1, space_1):
    """Ordering by numrecipe should sort by recipe_count annotation."""
    with scopes_disabled():
        FoodFactory(name='NoRecipes', space=space_1)
        food_with_recipes = FoodFactory(name='WithRecipes', space=space_1)
        # Wire up: Ingredient(food) → Step → Recipe
        ingredient = IngredientFactory(food=food_with_recipes, space=space_1)
        step = StepFactory(ingredients__count=0, space=space_1)
        step.ingredients.add(ingredient)
        recipe = RecipeFactory(steps__count=0, space=space_1)
        recipe.steps.add(step)

    response = get_filter_results(u1_s1, '?ordering=numrecipe')
    names = [x['name'] for x in response['results']]
    assert names.index('NoRecipes') < names.index('WithRecipes')

    response = get_filter_results(u1_s1, '?ordering=-numrecipe')
    names = [x['name'] for x in response['results']]
    assert names.index('WithRecipes') < names.index('NoRecipes')


def test_ordering_invalid_field_ignored(u1_s1, space_1):
    """Invalid ordering field should be silently ignored (default ordering applies)."""
    with scopes_disabled():
        FoodFactory(name='Banana', space=space_1)
        FoodFactory(name='Apple', space=space_1)

    response = get_filter_results(u1_s1, '?ordering=invalid_field')
    assert response['count'] == 2
    # Default ordering (name asc) should apply
    names = [x['name'] for x in response['results']]
    assert names == sorted(names, key=str.lower)


def test_ordering_with_query_active(u1_s1, space_1):
    """Ordering param is accepted alongside a search query (frontend controls suppression)."""
    with scopes_disabled():
        FoodFactory(name='Apple Pie', space=space_1)
        FoodFactory(name='Banana', space=space_1)

    # Backend applies both query filter and ordering — frontend is responsible
    # for not sending ordering when relevance-based results are desired
    response = get_filter_results(u1_s1, '?ordering=-name&query=Apple')
    assert response['count'] == 1
    assert response['results'][0]['name'] == 'Apple Pie'


def test_ordering_supermarket_category_name(u1_s1, space_1, cat_1, cat_2):
    """Ordering by supermarket_category__name should sort using case-insensitive comparison."""
    with scopes_disabled():
        cat_1.name = 'Bakery'
        cat_1.save()
        cat_2.name = 'Produce'
        cat_2.save()
        FoodFactory(name='Bread', space=space_1, supermarket_category=cat_1)
        FoodFactory(name='Apple', space=space_1, supermarket_category=cat_2)
        FoodFactory(name='NoCat', space=space_1)  # NULL category

    response = get_filter_results(u1_s1, '?ordering=supermarket_category__name')
    names = [x['name'] for x in response['results']]
    # Bakery < Produce; NULLs always sort last regardless of direction
    assert names.index('Bread') < names.index('Apple')
    assert names.index('NoCat') > names.index('Apple')

    response = get_filter_results(u1_s1, '?ordering=-supermarket_category__name')
    names = [x['name'] for x in response['results']]
    # Produce > Bakery; NULLs still last in descending
    assert names.index('Apple') < names.index('Bread')
    assert names.index('NoCat') > names.index('Bread')


def test_ordering_applied_when_tree_active(u1_s1, space_1):
    """Backend applies ordering even with tree param (frontend controls suppression)."""
    with scopes_disabled():
        parent = FoodFactory(name='Apple', space=space_1)
        child = FoodFactory(name='Zebra', space=space_1)
        child.move(parent, node_location)

    # Backend honours ordering — Zebra before Apple with -name
    response = get_filter_results(u1_s1, f'?tree={parent.id}&ordering=-name')
    names = [x['name'] for x in response['results']]
    assert names.index('Zebra') < names.index('Apple')


def test_filter_onhand_false_shared_user(u1_s1, u2_s1, space_1):
    """Onhand=false should exclude shared user's onhand foods."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    user2.userpreference.shopping_share.add(user1)
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')

    with scopes_disabled():
        food_onhand_user2 = FoodFactory(space=space_1, users_onhand=[user2])
        food_not_onhand = FoodFactory(space=space_1)

    response = get_filter_results(u1_s1, '?onhand=false')
    result_ids = [x['id'] for x in response['results']]
    assert food_not_onhand.id in result_ids
    assert food_onhand_user2.id not in result_ids


# ==================== stats ====================

def test_stats_endpoint_returns_counts(u1_s1, space_1):
    """Dedicated stats endpoint should return onhand, shopping, ignored, total as integers.
    List endpoint should NOT include a 'stats' key."""
    with scopes_disabled():
        FoodFactory(space=space_1)

    # List endpoint must never return stats
    response_list = get_filter_results(u1_s1)
    assert 'stats' not in response_list

    stats = get_stats(u1_s1)
    assert isinstance(stats['onhand'], int)
    assert isinstance(stats['shopping'], int)
    assert isinstance(stats['ignored'], int)
    assert isinstance(stats['total'], int)


def test_stats_counts_are_space_wide(u1_s1, space_1):
    """Stats should reflect totals for the entire space."""
    user = auth.get_user(u1_s1)

    # capture baseline before creating test data (parallel tests may add foods)
    baseline = get_stats(u1_s1)

    with scopes_disabled():
        FoodFactory(space=space_1, users_onhand=[user])
        _food_shopping = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=_food_shopping, space=space_1, created_by=user, checked=False)
        food_ignored = FoodFactory(space=space_1)
        food_ignored.ignore_shopping = True
        food_ignored.save()
        FoodFactory(space=space_1)  # plain food

    stats = get_stats(u1_s1)
    assert stats['onhand'] == baseline['onhand'] + 1
    assert stats['shopping'] == baseline['shopping'] + 1
    assert stats['ignored'] == baseline['ignored'] + 1
    assert stats['total'] == baseline['total'] + 4


def test_stats_shopping_is_user_scoped(u1_s1, u2_s1, space_1):
    """Shopping stats should only count entries created by the user or their shared users."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)

    # clear stale shared-user cache from parallel tests
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')
    # ensure user2 does NOT share with user1 at the start
    user2.userpreference.shopping_share.remove(user1)

    # capture baseline before creating test data (parallel tests may add foods)
    baseline = get_stats(u1_s1)['shopping']

    with scopes_disabled():
        food_u1 = FoodFactory(space=space_1)
        food_u2 = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_u1, space=space_1, created_by=user1, checked=False)
        ShoppingListEntryFactory(food=food_u2, space=space_1, created_by=user2, checked=False)

    # user1 should only see their own new shopping entry
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')
    stats = get_stats(u1_s1)
    assert stats['shopping'] == baseline + 1

    # After sharing, user1 should see both new entries
    user2.userpreference.shopping_share.add(user1)
    caches['default'].delete(f'shopping_shared_users_{space_1.id}_{user1.id}')

    stats = get_stats(u1_s1)
    assert stats['shopping'] == baseline + 2


def test_stats_exclude_other_spaces(u1_s1, space_1, space_2):
    """Stats should only count foods in the requesting user's space."""
    user = auth.get_user(u1_s1)

    # capture baseline before creating test data (parallel tests may add foods)
    baseline = get_stats(u1_s1)

    with scopes_disabled():
        FoodFactory(space=space_1, users_onhand=[user])
        # Food in another space — should not appear in stats
        other_food = FoodFactory(space=space_2)
        other_food.ignore_shopping = True
        other_food.save()

    stats = get_stats(u1_s1)
    assert stats['onhand'] == baseline['onhand'] + 1
    assert stats['ignored'] == baseline['ignored']


def test_stats_anonymous_shared_users(u1_s1, space_1):
    """When _shared_users returns empty (anonymous), onhand and shopping should be 0."""
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        food.ignore_shopping = True
        food.save()
        FoodFactory(space=space_1)

    # Simulate anonymous user path (_shared_users returns [])
    from cookbook.views.api import FoodViewSet
    with patch.object(FoodViewSet, '_shared_users', new_callable=PropertyMock, return_value=[]):
        stats = get_stats(u1_s1)

    assert stats['onhand'] == 0
    assert stats['shopping'] == 0
    assert stats['ignored'] >= 1
    assert stats['total'] >= 2


# ==================== empty shared_users (anonymous/share-link) ====================

def test_shopping_status_false_when_shared_users_empty(u1_s1, space_1):
    """When shared_users is empty (anonymous user), shopping field should always be False."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food, space=space_1, created_by=user, checked=False)

    with patch('cookbook.views.api.FoodViewSet._shared_users', new_callable=PropertyMock, return_value=[]):
        response = get_filter_results(u1_s1, '')
        result = next(x for x in response['results'] if x['id'] == food.id)
        assert result['shopping'] == 'False'


def test_in_shopping_list_true_empty_when_shared_users_empty(u1_s1, space_1):
    """in_shopping_list=true should return no results when shared_users is empty."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        FoodFactory(space=space_1)
        food_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    with patch('cookbook.views.api.FoodViewSet._shared_users', new_callable=PropertyMock, return_value=[]):
        response = get_filter_results(u1_s1, '?in_shopping_list=true')
        assert response['count'] == 0


def test_in_shopping_list_false_returns_all_when_shared_users_empty(u1_s1, space_1):
    """in_shopping_list=false should return all foods when shared_users is empty."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_plain = FoodFactory(space=space_1)
        food_in_list = FoodFactory(space=space_1)
        ShoppingListEntryFactory(food=food_in_list, space=space_1, created_by=user, checked=False)

    with patch('cookbook.views.api.FoodViewSet._shared_users', new_callable=PropertyMock, return_value=[]):
        response = get_filter_results(u1_s1, '?in_shopping_list=false')
        result_ids = [x['id'] for x in response['results']]
        assert food_plain.id in result_ids
        assert food_in_list.id in result_ids


# ==================== has_inventory filter ====================

@pytest.mark.parametrize("filter_value,expected_match", [
    ('true', 'with'),
    ('false', 'without'),
])
def test_filter_has_inventory(filter_value, expected_match, u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_with = FoodFactory(space=space_1)
        food_without = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food_with, space=space_1, created_by=user, amount=5)

    response = get_filter_results(u1_s1, f'?has_inventory={filter_value}')
    result_ids = [x['id'] for x in response['results']]
    if expected_match == 'with':
        assert food_with.id in result_ids
        assert food_without.id not in result_ids
    else:
        assert food_without.id in result_ids
        assert food_with.id not in result_ids


def test_filter_has_inventory_zero_amount_excluded(u1_s1, space_1):
    """Inventory entries with amount=0 should not count as 'in inventory'."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food, space=space_1, created_by=user, amount=0)

    response = get_filter_results(u1_s1, '?has_inventory=true')
    result_ids = [x['id'] for x in response['results']]
    assert food.id not in result_ids


def test_filter_has_inventory_no_duplicates(u1_s1, space_1):
    """Multiple inventory entries for the same food should not cause duplicates."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food, space=space_1, created_by=user, amount=3)
        InventoryEntryFactory(food=food, space=space_1, created_by=user, amount=2)

    response = get_filter_results(u1_s1, '?has_inventory=true')
    result_ids = [x['id'] for x in response['results']]
    assert result_ids.count(food.id) == 1


# ==================== inventory_location filter ====================

def test_filter_inventory_location(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        loc_a = InventoryLocationFactory(space=space_1, created_by=user)
        loc_b = InventoryLocationFactory(space=space_1, created_by=user)
        food_a = FoodFactory(space=space_1)
        food_b = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food_a, inventory_location=loc_a, space=space_1, created_by=user, amount=1)
        InventoryEntryFactory(food=food_b, inventory_location=loc_b, space=space_1, created_by=user, amount=1)

    response = get_filter_results(u1_s1, f'?inventory_location={loc_a.id}')
    result_ids = [x['id'] for x in response['results']]
    assert food_a.id in result_ids
    assert food_b.id not in result_ids


def test_filter_inventory_location_zero_amount_excluded(u1_s1, space_1):
    """Entries with amount=0 at a location should be excluded."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        loc = InventoryLocationFactory(space=space_1, created_by=user)
        food = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food, inventory_location=loc, space=space_1, created_by=user, amount=0)

    response = get_filter_results(u1_s1, f'?inventory_location={loc.id}')
    assert response['count'] == 0


def test_filter_inventory_location_no_duplicates(u1_s1, space_1):
    """Multiple entries at the same location should not cause duplicates."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        loc = InventoryLocationFactory(space=space_1, created_by=user)
        food = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food, inventory_location=loc, space=space_1, created_by=user, amount=1)
        InventoryEntryFactory(food=food, inventory_location=loc, space=space_1, created_by=user, amount=2)

    response = get_filter_results(u1_s1, f'?inventory_location={loc.id}')
    result_ids = [x['id'] for x in response['results']]
    assert result_ids.count(food.id) == 1


def test_filter_inventory_location_invalid_value(u1_s1, space_1):
    """Invalid inventory_location value should return empty result, not 500."""
    response = get_filter_results(u1_s1, '?inventory_location=abc')
    assert response['count'] == 0


# ==================== expired filter ====================

@pytest.mark.parametrize("filter_value,expected_match", [
    ('true', 'expired'),
    ('false', 'not_expired'),
])
def test_filter_expired(filter_value, expected_match, u1_s1, space_1):
    from datetime import timedelta
    user = auth.get_user(u1_s1)
    today = date.today()
    with scopes_disabled():
        food_expired = FoodFactory(space=space_1)
        food_not_expired = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food_expired, space=space_1, created_by=user,
                              amount=1, expires=today - timedelta(days=1))
        InventoryEntryFactory(food=food_not_expired, space=space_1, created_by=user,
                              amount=1, expires=today + timedelta(days=10))

    response = get_filter_results(u1_s1, f'?expired={filter_value}')
    result_ids = [x['id'] for x in response['results']]
    if expected_match == 'expired':
        assert food_expired.id in result_ids
        assert food_not_expired.id not in result_ids
    else:
        assert food_not_expired.id in result_ids
        assert food_expired.id not in result_ids


def test_filter_expired_ignores_no_expiration(u1_s1, space_1):
    """Entries without an expiration date should never be considered expired."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food, space=space_1, created_by=user, amount=1, expires=None)

    response = get_filter_results(u1_s1, '?expired=true')
    result_ids = [x['id'] for x in response['results']]
    assert food.id not in result_ids


# ==================== expiring_soon filter ====================

def test_filter_expiring_soon(u1_s1, space_1):
    from datetime import timedelta
    user = auth.get_user(u1_s1)
    today = date.today()
    with scopes_disabled():
        food_soon = FoodFactory(space=space_1)
        food_later = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food_soon, space=space_1, created_by=user,
                              amount=1, expires=today + timedelta(days=2))
        InventoryEntryFactory(food=food_later, space=space_1, created_by=user,
                              amount=1, expires=today + timedelta(days=10))

    response = get_filter_results(u1_s1, '?expiring_soon=3')
    result_ids = [x['id'] for x in response['results']]
    assert food_soon.id in result_ids
    assert food_later.id not in result_ids


def test_filter_expiring_soon_excludes_already_expired(u1_s1, space_1):
    """Already expired entries should not appear in expiring_soon results."""
    from datetime import timedelta
    user = auth.get_user(u1_s1)
    today = date.today()
    with scopes_disabled():
        food_expired = FoodFactory(space=space_1)
        InventoryEntryFactory(food=food_expired, space=space_1, created_by=user,
                              amount=1, expires=today - timedelta(days=1))

    response = get_filter_results(u1_s1, '?expiring_soon=3')
    result_ids = [x['id'] for x in response['results']]
    assert food_expired.id not in result_ids


def test_filter_expiring_soon_invalid_value(u1_s1, space_1):
    """Invalid expiring_soon value should be ignored (no filter applied)."""
    with scopes_disabled():
        FoodFactory(space=space_1)

    response = get_filter_results(u1_s1, '?expiring_soon=abc')
    # Should not crash and should return results (no filter applied)
    assert response['count'] >= 1


# ==================== inventory stats ====================

def test_stats_inventory_and_expired(u1_s1, space_1):
    """Stats endpoint should return inventory and expired counts."""
    from datetime import timedelta
    user = auth.get_user(u1_s1)
    today = date.today()

    baseline = get_stats(u1_s1)

    with scopes_disabled():
        food_inv = FoodFactory(space=space_1)
        food_expired = FoodFactory(space=space_1)
        food_both = FoodFactory(space=space_1)
        FoodFactory(space=space_1)  # plain food

        InventoryEntryFactory(food=food_inv, space=space_1, created_by=user, amount=1)
        InventoryEntryFactory(food=food_expired, space=space_1, created_by=user,
                              amount=1, expires=today - timedelta(days=1))
        # food_both has inventory AND is expired
        InventoryEntryFactory(food=food_both, space=space_1, created_by=user,
                              amount=1, expires=today - timedelta(days=5))

    stats = get_stats(u1_s1)
    assert stats['inventory'] == baseline.get('inventory', 0) + 3  # all 3 foods have inventory
    assert stats['expired'] == baseline.get('expired', 0) + 2  # food_expired + food_both


# ==================== cross-space isolation ====================

def test_substitute_inventory_shows_true_when_substitute_has_inventory(u1_s1, space_1):
    """substitute_inventory is True when a substitute food has inventory entries."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food_a = FoodFactory(space=space_1)
        food_b = FoodFactory(space=space_1)
        food_a.substitute.add(food_b)
        InventoryEntryFactory(food=food_b, space=space_1, created_by=user, amount=3)

    response = json.loads(u1_s1.get(reverse(DETAIL_URL, args=[food_a.id])).content)
    assert response['substitute_inventory'] is True


def test_substitute_inventory_shows_false_when_substitute_has_no_inventory(u1_s1, space_1):
    """substitute_inventory is False when no substitute foods have inventory."""
    with scopes_disabled():
        food_a = FoodFactory(space=space_1)
        food_b = FoodFactory(space=space_1)
        food_a.substitute.add(food_b)
        # food_b has no inventory entries

    response = json.loads(u1_s1.get(reverse(DETAIL_URL, args=[food_a.id])).content)
    assert response['substitute_inventory'] is False

