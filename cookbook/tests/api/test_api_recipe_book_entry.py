import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import RecipeBook, RecipeBookEntry

LIST_URL = 'api:recipebookentry-list'
DETAIL_URL = 'api:recipebookentry-detail'


@pytest.fixture
def obj_1(space_1, u1_s1, recipe_1_s1):
    b = RecipeBook.objects.create(name='test_1', created_by=auth.get_user(u1_s1), space=space_1)

    return RecipeBookEntry.objects.create(book=b, recipe=recipe_1_s1)


@pytest.fixture
def obj_2(space_1, u1_s1, recipe_1_s1):
    b = RecipeBook.objects.create(name='test_1', created_by=auth.get_user(u1_s1), space=space_1)
    return RecipeBookEntry.objects.create(book=b, recipe=recipe_1_s1)


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
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    obj_1.book.space = space_2
    obj_1.book.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, obj_1, recipe_2_s1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        ),
        {'recipe': recipe_2_s1.pk},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['recipe'] == recipe_2_s1.pk


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 201],
    ['a1_s1', 404],
])
def test_add(arg, request, u1_s2, obj_1, recipe_2_s1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'book': obj_1.book.pk, 'recipe': recipe_2_s1.pk},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['recipe'] == recipe_2_s1.pk
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_add_duplicate(u1_s1, obj_1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'book': obj_1.book.pk, 'recipe': obj_1.recipe.pk},
        content_type='application/json'
    )
    assert r.status_code == 400


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
        assert RecipeBookEntry.objects.count() == 0
