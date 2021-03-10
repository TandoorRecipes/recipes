import json

import pytest
from django_scopes import scopes_disabled

from cookbook.models import Keyword
from cookbook.tests.views.test_views import TestViews
from django.urls import reverse


@pytest.fixture()
def obj_1(space_1):
    return Keyword.objects.get_or_create(name='test_1', space=space_1)[0]


@pytest.fixture
def obj_2(space_1):
    return Keyword.objects.get_or_create(name='test_2', space=space_1)[0]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('api:keyword-list')).status_code == arg[1]


def test_list_filter(obj_1, obj_2, u1_s1):
    # verify storage is returned
    r = u1_s1.get(reverse('api:keyword-list'))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert len(response) == 2
    assert response[0]['name'] == obj_1.name

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?limit=1').content)
    assert len(response) == 1

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?query=chicken').content)
    assert len(response) == 0

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?query={obj_1.name[4:]}').content)
    assert len(response) == 1


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
            'api:keyword-detail',
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
def test_keyword_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse('api:keyword-list'),
        {'name': 'test'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['name'] == 'test'
        r = c.get(reverse('api:keyword-detail', args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse('api:keyword-detail', args={response['id']}))
        assert r.status_code == 404


def test_add_duplicate(u1_s1, u1_s2, obj_1):
    r = u1_s1.post(
        reverse('api:keyword-list'),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] == obj_1.id

    r = u1_s2.post(
        reverse('api:keyword-list'),
        {'name': obj_1.name},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['id'] != obj_1.id


def test_keyword_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(
        reverse(
            'api:keyword-detail',
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            'api:keyword-detail',
            args={obj_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Keyword.objects.count() == 0
