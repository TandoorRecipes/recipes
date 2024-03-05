import json
import pytest
import uuid

from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Food, Ingredient, ShoppingListEntry, Unit

LIST_URL = 'api:unit-list'
DETAIL_URL = 'api:unit-detail'
MERGE_URL = 'api:unit-merge'


def random_food(space_1, u1_s1):
    return Food.objects.get_or_create(name=str(uuid.uuid4()), space=space_1)[0]


@pytest.fixture()
def obj_1(space_1):
    return Unit.objects.get_or_create(name='test_1', space=space_1)[0]


@pytest.fixture
def obj_2(space_1):
    return Unit.objects.get_or_create(name='test_2', space=space_1)[0]


@pytest.fixture
def obj_3(space_2):
    return Unit.objects.get_or_create(name='test_3', space=space_2)[0]


@pytest.fixture()
def ing_1_s1(obj_1, space_1, u1_s1):
    return Ingredient.objects.create(unit=obj_1, food=random_food(space_1, u1_s1), space=space_1)


@pytest.fixture()
def ing_2_s1(obj_2, space_1, u1_s1):
    return Ingredient.objects.create(unit=obj_2, food=random_food(space_1, u1_s1), space=space_1)


@pytest.fixture()
def ing_3_s2(obj_3, space_2, u2_s2):
    return Ingredient.objects.create(unit=obj_3, food=random_food(space_2, u2_s2), space=space_2)


@pytest.fixture()
def sle_1_s1(obj_1, u1_s1, space_1):
    e = ShoppingListEntry.objects.create(unit=obj_1, food=random_food(space_1, u1_s1), created_by=auth.get_user(u1_s1), space=space_1,)
    return e


@pytest.fixture()
def sle_2_s1(obj_2, u1_s1, space_1):
    return ShoppingListEntry.objects.create(unit=obj_2, food=random_food(space_1, u1_s1), created_by=auth.get_user(u1_s1), space=space_1,)


@pytest.fixture()
def sle_3_s2(obj_3, u2_s2, space_2):
    e = ShoppingListEntry.objects.create(unit=obj_3, food=random_food(space_2, u2_s2), created_by=auth.get_user(u2_s2), space=space_2)
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

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=1').content)
    assert response['count'] == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query=chicken').content)
    assert response['count'] == 0

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query={obj_1.name[4:]}').content)
    assert response['count'] == 1
    assert response['results'][0]['name'] == obj_1.name


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


def test_add_duplicate(u1_s1, u1_s2, obj_1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] == obj_1.id

    r = u1_s2.post(
        reverse(LIST_URL),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] != obj_1.id


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Food.objects.count() == 0


def test_merge(
    u1_s1,
    obj_1, obj_2, obj_3,
    ing_1_s1, ing_2_s1, ing_3_s2,
    sle_1_s1, sle_2_s1, sle_3_s2,
    space_1
):
    with scopes_disabled():
        assert Unit.objects.filter(space=space_1).count() == 2
        assert obj_1.ingredient_set.count() == 1
        assert obj_2.ingredient_set.count() == 1
        assert obj_3.ingredient_set.count() == 1
        assert obj_1.shoppinglistentry_set.count() == 1
        assert obj_2.shoppinglistentry_set.count() == 1
        assert obj_3.shoppinglistentry_set.count() == 1

    # merge Unit with ingredient/shopping list entry with another Unit, only HTTP put method should work
    url = reverse(MERGE_URL, args=[obj_1.id, obj_2.id])
    r = u1_s1.get(url)
    assert r.status_code == 405
    r = u1_s1.post(url)
    assert r.status_code == 405
    r = u1_s1.delete(url)
    assert r.status_code == 405
    r = u1_s1.put(url)
    assert r.status_code == 200
    with scopes_disabled():
        assert Unit.objects.filter(pk=obj_1.id).count() == 0
        assert obj_2.ingredient_set.count() == 2
        assert obj_3.ingredient_set.count() == 1

        assert obj_2.shoppinglistentry_set.count() == 2
        assert obj_3.shoppinglistentry_set.count() == 1

    # attempt to merge with non-existent parent
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, 9999])
    )
    assert r.status_code == 404

    # attempt to move to wrong space
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, obj_3.id])
    )
    assert r.status_code == 404

    # attempt to merge with self
    r = u1_s1.put(
        reverse(MERGE_URL, args=[obj_2.id, obj_2.id])
    )
    assert r.status_code == 403

    # run diagnostic to find problems - none should be found
    with scopes_disabled():
        assert Food.find_problems() == ([], [], [], [], [])
