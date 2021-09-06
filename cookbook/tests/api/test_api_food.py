import json
import pytest

from django.contrib import auth
from django_scopes import scopes_disabled
from django.urls import reverse


from cookbook.models import Food, Ingredient, ShoppingList, ShoppingListEntry

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


@pytest.fixture()
def obj_1(space_1):
    return Food.objects.get_or_create(name='test_1', space=space_1)[0]


@pytest.fixture()
def obj_1_1(obj_1, space_1):
    return obj_1.add_child(name='test_1_1', space=space_1)


@pytest.fixture()
def obj_1_1_1(obj_1_1, space_1):
    return obj_1_1.add_child(name='test_1_1_1', space=space_1)


@pytest.fixture
def obj_2(space_1):
    return Food.objects.get_or_create(name='test_2', space=space_1)[0]


@pytest.fixture()
def obj_3(space_2):
    return Food.objects.get_or_create(name='test_3', space=space_2)[0]


@pytest.fixture()
def ing_1_s1(obj_1, space_1):
    return Ingredient.objects.create(food=obj_1, space=space_1)


@pytest.fixture()
def ing_2_s1(obj_2, space_1):
    return Ingredient.objects.create(food=obj_2, space=space_1)


@pytest.fixture()
def ing_3_s2(obj_3, space_2):
    return Ingredient.objects.create(food=obj_3, space=space_2)


@pytest.fixture()
def ing_1_1_s1(obj_1_1, space_1):
    return Ingredient.objects.create(food=obj_1_1, space=space_1)


@pytest.fixture()
def sle_1_s1(obj_1, u1_s1, space_1):
    e = ShoppingListEntry.objects.create(food=obj_1)
    s = ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )
    s.entries.add(e)
    return e


@pytest.fixture()
def sle_2_s1(obj_2, u1_s1, space_1):
    return ShoppingListEntry.objects.create(food=obj_2)


@pytest.fixture()
def sle_3_s2(obj_3, u1_s2, space_2):
    e = ShoppingListEntry.objects.create(food=obj_3)
    s = ShoppingList.objects.create(created_by=auth.get_user(u1_s2), space=space_2, )
    s.entries.add(e)
    return e


@pytest.fixture()
def sle_1_1_s1(obj_1_1, u1_s1, space_1):
    e = ShoppingListEntry.objects.create(food=obj_1_1)
    s = ShoppingList.objects.create(created_by=auth.get_user(u1_s1), space=space_1, )
    s.entries.add(e)
    return e


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(obj_1, obj_2, u1_s1, u1_s2, space_2):
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 2
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0

    obj_1.space = space_2
    obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1


def test_list_filter(obj_1, obj_2, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert response['count'] == 2
    assert response['results'][0]['name'] == obj_1.name

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?page_size=1').content)
    assert len(response['results']) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=1').content)
    assert len(response['results']) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query=''&limit=1').content)
    assert len(response['results']) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query=chicken').content)
    assert response['count'] == 0

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query={obj_1.name[4:]}').content)
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


@pytest.mark.django_db(transaction=True)
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


def test_delete(u1_s1, u1_s2, obj_1, obj_1_1, obj_1_1_1):
    with scopes_disabled():
        assert Food.objects.count() == 3

    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404
    with scopes_disabled():
        assert Food.objects.count() == 3

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Food.objects.count() == 1
        assert Food.find_problems() == ([], [], [], [], [])


def test_integrity(u1_s1, recipe_1_s1):
    with scopes_disabled():
        assert Food.objects.count() == 10
        assert Ingredient.objects.count() == 10
        f_1 = Food.objects.first()

    # deleting food will fail because food is part of recipe
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={f_1.id}
        )
    )
    assert r.status_code == 403

    with scopes_disabled():
        i_1 = f_1.ingredient_set.first()
        # remove Ingredient that references Food from recipe step
        i_1.step_set.first().ingredients.remove(i_1)
        assert Food.objects.count() == 10
        assert Ingredient.objects.count() == 10
    
    # deleting food will succeed because its not part of recipe and delete will cascade to Ingredient
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={f_1.id}
        )
    )
    assert r.status_code == 204

    with scopes_disabled():
        assert Food.objects.count() == 9
        assert Ingredient.objects.count() == 9


def test_move(u1_s1, obj_1, obj_1_1, obj_1_1_1, obj_2, obj_3, space_1):
    url = reverse(MOVE_URL, args=[obj_1_1.id, obj_2.id])
    with scopes_disabled():
        assert obj_1.get_num_children() == 1
        assert obj_1.get_descendant_count() == 2
        assert Food.get_root_nodes().filter(space=space_1).count() == 2

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
        obj_1 = Food.objects.get(pk=obj_1.id)
        obj_2 = Food.objects.get(pk=obj_2.id)
        assert obj_1.get_num_children() == 0
        assert obj_1.get_descendant_count() == 0
        assert obj_2.get_num_children() == 1
        assert obj_2.get_descendant_count() == 2

    # move child to root
    r = u1_s1.put(reverse(MOVE_URL, args=[obj_1_1.id, 0]))
    assert r.status_code == 200
    with scopes_disabled():
        assert Food.get_root_nodes().filter(space=space_1).count() == 3

    # attempt to move to non-existent parent
    r = u1_s1.put(
        reverse(MOVE_URL, args=[obj_1.id, 9999])
    )
    assert r.status_code == 404

    # attempt to move to wrong space
    r = u1_s1.put(
        reverse(MOVE_URL, args=[obj_1_1.id, obj_3.id])
    )
    assert r.status_code == 404

    # run diagnostic to find problems - none should be found
    with scopes_disabled():
        assert Food.find_problems() == ([], [], [], [], [])


def test_merge(
    u1_s1,
    obj_1, obj_1_1, obj_1_1_1, obj_2, obj_3,
    ing_1_s1, ing_2_s1, ing_3_s2, ing_1_1_s1,
    sle_1_s1, sle_2_s1, sle_3_s2, sle_1_1_s1,
    space_1
):
    with scopes_disabled():
        assert obj_1.get_num_children() == 1
        assert obj_1.get_descendant_count() == 2
        assert Food.get_root_nodes().filter(space=space_1).count() == 2
        assert Food.objects.filter(space=space_1).count() == 4
        assert obj_1.ingredient_set.count() == 1
        assert obj_2.ingredient_set.count() == 1
        assert obj_3.ingredient_set.count() == 1
        assert obj_1_1.ingredient_set.count() == 1
        assert obj_1_1_1.ingredient_set.count() == 0
        assert obj_1.shoppinglistentry_set.count() == 1
        assert obj_2.shoppinglistentry_set.count() == 1
        assert obj_3.shoppinglistentry_set.count() == 1
        assert obj_1_1.shoppinglistentry_set.count() == 1
        assert obj_1_1_1.shoppinglistentry_set.count() == 0

    # merge food with no children and no ingredient/shopping list entry with another food, only HTTP put method should work
    url = reverse(MERGE_URL, args=[obj_1_1_1.id, obj_2.id])
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
        obj_1 = Food.objects.get(pk=obj_1.id)
        obj_2 = Food.objects.get(pk=obj_2.id)
        assert Food.objects.filter(pk=obj_1_1_1.id).count() == 0
        assert obj_1.get_num_children() == 1
        assert obj_1.get_descendant_count() == 1
        assert obj_2.get_num_children() == 0
        assert obj_2.get_descendant_count() == 0
        assert obj_1.ingredient_set.count() == 1
        assert obj_2.ingredient_set.count() == 1
        assert obj_3.ingredient_set.count() == 1
        assert obj_1_1.ingredient_set.count() == 1
        assert obj_1.shoppinglistentry_set.count() == 1
        assert obj_2.shoppinglistentry_set.count() == 1
        assert obj_3.shoppinglistentry_set.count() == 1
        assert obj_1_1.shoppinglistentry_set.count() == 1

    # merge food (with connected ingredient/shoppinglistentry) with children to another food
    r = u1_s1.put(reverse(MERGE_URL, args=[obj_1.id, obj_2.id]))
    assert r.status_code == 200
    with scopes_disabled():
        # django-treebeard bypasses django ORM so object needs retrieved again
        obj_2 = Food.objects.get(pk=obj_2.id)
        assert Food.objects.filter(pk=obj_1.id).count() == 0
        assert obj_2.get_num_children() == 1
        assert obj_2.get_descendant_count() == 1
        assert obj_2.ingredient_set.count() == 2
        assert obj_3.ingredient_set.count() == 1
        assert obj_1_1.ingredient_set.count() == 1
        assert obj_2.shoppinglistentry_set.count() == 2
        assert obj_3.shoppinglistentry_set.count() == 1
        assert obj_1_1.shoppinglistentry_set.count() == 1

    # attempt to merge with non-existent parent
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_1_1.id, 9999])
    )
    assert r.status_code == 404

    # attempt to move to wrong space
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, obj_3.id])
    )
    assert r.status_code == 404

    # attempt to merge with child
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, obj_1_1.id])
    )
    assert r.status_code == 403

    # attempt to merge with self
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, obj_2.id])
    )
    assert r.status_code == 403

    # run diagnostic to find problems - none should be found
    with scopes_disabled():
        assert Food.find_problems() == ([], [], [], [], [])


def test_root_filter(obj_1, obj_1_1, obj_1_1_1, obj_2, obj_3, u1_s1):
    # should return root objects in the space (obj_1, obj_2), ignoring query filters
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?root=0').content)
    assert len(response['results']) == 2

    with scopes_disabled():
        obj_2.move(obj_1, 'sorted-child')
    # should return direct children of obj_1 (obj_1_1, obj_2), ignoring query filters
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?root={obj_1.id}').content)
    assert response['count'] == 2
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?root={obj_1.id}&query={obj_2.name[4:]}').content)
    assert response['count'] == 2


def test_tree_filter(obj_1, obj_1_1, obj_1_1_1, obj_2, obj_3, u1_s1):
    with scopes_disabled():
        obj_2.move(obj_1, 'sorted-child')
    # should return full tree starting at obj_1 (obj_1_1_1, obj_2), ignoring query filters
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?tree={obj_1.id}').content)
    assert response['count'] == 4
    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?tree={obj_1.id}&query={obj_2.name[4:]}').content)
    assert response['count'] == 4
