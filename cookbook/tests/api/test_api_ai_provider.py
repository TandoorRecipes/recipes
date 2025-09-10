import json

import pytest
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import MealType, PropertyType, AiProvider

LIST_URL = 'api:aiprovider-list'
DETAIL_URL = 'api:aiprovider-detail'


@pytest.fixture()
def obj_1(space_1, a1_s1):
    return AiProvider.objects.get_or_create(name='test_1', space=space_1)[0]


@pytest.fixture
def obj_2(space_1, a1_s1):
    return AiProvider.objects.get_or_create(name='test_2', space=None)[0]


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
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1

    obj_1.space = space_2
    obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 2


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
    ['g1_s2', 403],
    ['u1_s2', 403],
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
    ['u1_s1', 403],
    ['a1_s1', 403],
    ['g1_s2', 403],
    ['u1_s2', 403],
    ['a1_s2', 403],
    ['s1_s1', 200],
])
def test_update_global(arg, request, obj_2):
    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={obj_2.id}
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
    ['u1_s1', 403],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'name': 'test', 'api_key': 'test', 'model_name': 'test'},
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


def test_delete(a1_s1, a1_s2, obj_1):
    # admins cannot delete foreign space providers
    r = a1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    # admins can delete their space providers
    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert AiProvider.objects.count() == 0


def test_delete_global(a1_s1, s1_s1, obj_2):
    # admins cant delete global providers
    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_2.id}
        )
    )
    assert r.status_code == 403

    # superusers can delete global providers
    r = s1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_2.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert AiProvider.objects.count() == 0
