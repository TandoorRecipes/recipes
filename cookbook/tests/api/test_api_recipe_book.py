import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Household, RecipeBook, RecipeBookEntry, UserFile, UserSpace
from cookbook.tests.factories import UserFileFactory

LIST_URL = 'api:recipebook-list'
DETAIL_URL = 'api:recipebook-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    return RecipeBook.objects.get_or_create(name='test_1',
                                            created_by=auth.get_user(u1_s1),
                                            space=space_1)[0]


@pytest.fixture
def obj_2(space_1, u1_s1):
    return RecipeBook.objects.get_or_create(name='test_2',
                                            created_by=auth.get_user(u1_s1),
                                            space=space_1)[0]


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

    obj_1.space = space_2
    obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0


def test_list_filter(obj_1, obj_2, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert response['count'] == 2

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=1').content)
    assert response['count'] == 1

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?query=chicken').content)
    assert response['count'] == 0

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?query={obj_1.name[4:]}').content)
    assert response['count'] == 1
    assert response['results'][0]['name'] == obj_1.name


def test_list_ordering(space_1, u1_s1):
    book1 = RecipeBook.objects.create(name='+3 book1', created_by=auth.get_user(u1_s1), space=space_1, order=3)
    book2 = RecipeBook.objects.create(name='+1 book2', created_by=auth.get_user(u1_s1), space=space_1, order=1)
    book3 = RecipeBook.objects.create(name='+2 book3', created_by=auth.get_user(u1_s1), space=space_1, order=2)
    book4 = RecipeBook.objects.create(name='+0 book4', created_by=auth.get_user(u1_s1), space=space_1, order=0)
    book5 = RecipeBook.objects.create(name='-1 book5', created_by=auth.get_user(u1_s1), space=space_1, order=-1)
    book6 = RecipeBook.objects.create(name='+0 book6', created_by=auth.get_user(u1_s1), space=space_1, order=0)

    response = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    assert response['count'] == 6
    assert response['results'][0]['name'] == '-1 book5'
    assert response['results'][1]['name'] == '+0 book4'
    assert response['results'][2]['name'] == '+0 book6'
    assert response['results'][3]['name'] == '+1 book2'
    assert response['results'][4]['name'] == '+2 book3'
    assert response['results'][5]['name'] == '+3 book1'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(reverse(DETAIL_URL, args={obj_1.id}), {'name': 'new'}, content_type='application/json')
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['name'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(reverse(LIST_URL), {
        'name': 'test',
        'shared': []
    },
               content_type='application/json')
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['name'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(reverse(DETAIL_URL, args={obj_1.id}))
    assert r.status_code == 404

    r = u1_s1.delete(reverse(DETAIL_URL, args={obj_1.id}))

    assert r.status_code == 204
    with scopes_disabled():
        assert RecipeBook.objects.count() == 0


def test_household_visibility(obj_1, u1_s1, u2_s1, space_1):
    """Household members should NOT see each other's recipe books"""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)

    # user2 can't see user1's book
    assert json.loads(u2_s1.get(reverse(LIST_URL)).content)['count'] == 0
    assert u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 404

    # put both users in the same household
    with scopes_disabled():
        household = Household.objects.create(name='test', space=space_1)
        UserSpace.objects.filter(user__in=[user1, user2], space=space_1).update(household=household)

    # user2 still should NOT see user1's book (books are private)
    assert json.loads(u2_s1.get(reverse(LIST_URL)).content)['count'] == 0
    assert u2_s1.get(reverse(DETAIL_URL, args={obj_1.id})).status_code == 404


def test_book_image(obj_1, u1_s1, space_1):
    with scopes_disabled():
        user = auth.get_user(u1_s1)
        user_file = UserFileFactory(space=space_1, created_by=user)

    # assign image via nested object (WritableNestedModelSerializer pattern)
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.id]),
        json.dumps({'image': {'id': user_file.id}}),
        content_type='application/json',
    )
    assert r.status_code == 200
    data = json.loads(r.content)
    assert data['image']['id'] == user_file.id

    # detail also returns image
    r = u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id]))
    assert json.loads(r.content)['image']['id'] == user_file.id

    # clear image
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.id]),
        json.dumps({'image': None}),
        content_type='application/json',
    )
    assert r.status_code == 200
    assert json.loads(r.content)['image'] is None


# ---- fallback_image (random recipe image when book has no cover) ----

@pytest.mark.parametrize("has_cover, has_entry, recipe_has_image, expected_fallback_set", [
    (True,  False, False, False),  # book has its own cover → never compute fallback
    (False, False, False, False),  # no cover, no entries → null
    (False, True,  True,  True),   # no cover, entry with recipe image → fallback set
    (False, True,  False, False),  # no cover, entry but recipe has no image → null
])
def test_fallback_image(obj_1, u1_s1, space_1, recipe_1_s1,
                       has_cover, has_entry, recipe_has_image, expected_fallback_set):
    if has_cover:
        with scopes_disabled():
            user_file = UserFileFactory(space=space_1, created_by=auth.get_user(u1_s1))
        u1_s1.patch(
            reverse(DETAIL_URL, args=[obj_1.id]),
            json.dumps({'image': {'id': user_file.id}}),
            content_type='application/json',
        )

    if has_entry:
        with scopes_disabled():
            recipe_1_s1.image = 'recipes/test-fallback.jpg' if recipe_has_image else ''
            recipe_1_s1.save()
            RecipeBookEntry.objects.create(book=obj_1, recipe=recipe_1_s1)

    r = u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id]))
    data = json.loads(r.content)
    assert (data['image'] is not None) == has_cover
    if expected_fallback_set:
        assert data.get('fallback_image')
        assert 'test-fallback.jpg' in data['fallback_image']
    else:
        assert data.get('fallback_image') is None
