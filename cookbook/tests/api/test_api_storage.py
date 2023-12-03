import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Storage

LIST_URL = 'api:storage-list'
DETAIL_URL = 'api:storage-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    return Storage.objects.create(name='Test Storage 1', username='test', password='password', token='token', url='url', created_by=auth.get_user(u1_s1), space=space_1, )


@pytest.fixture
def obj_2(space_1, u1_s1):
    return Storage.objects.create(name='Test Storage 2', username='test', password='password', token='token', url='url', created_by=auth.get_user(u1_s1), space=space_1, )


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    r = c.get(reverse(LIST_URL))
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert 'password' not in response
        assert 'token' not in response


def test_list_space(obj_1, obj_2, a1_s1, a1_s2, space_2):
    assert len(json.loads(a1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(a1_s2.get(reverse(LIST_URL)).content)) == 0

    obj_1.space = space_2
    obj_1.save()

    assert len(json.loads(a1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(a1_s2.get(reverse(LIST_URL)).content)) == 1


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
    test_password = '1234'

    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        ),
        {'name': 'new', 'password': test_password},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['name'] == 'new'
        obj_1.refresh_from_db()
        assert obj_1.password == test_password


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 201],
])
def test_add(arg, request, a1_s2, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'name': 'test', 'method': Storage.DROPBOX},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['name'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = a1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_delete(a1_s1, a1_s2, obj_1):
    r = a1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Storage.objects.count() == 0
