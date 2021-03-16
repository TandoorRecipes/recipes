import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import RecipeBook, Storage, Sync, SyncLog

LIST_URL = 'api:synclog-list'
DETAIL_URL = 'api:synclog-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    s = Storage.objects.create(name='Test Storage 1', username='test', password='password', token='token', url='url', created_by=auth.get_user(u1_s1), space=space_1, )
    sy = Sync.objects.create(storage=s, path='path', space=space_1, )
    return SyncLog.objects.create(sync=sy, status=1)


@pytest.fixture
def obj_2(space_1, u1_s1):
    s = Storage.objects.create(name='Test Storage 2', username='test', password='password', token='token', url='url', created_by=auth.get_user(u1_s1), space=space_1, )
    sy = Sync.objects.create(storage=s, path='path', space=space_1, )
    return SyncLog.objects.create(sync=sy, status=1)


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(obj_1, obj_2, a1_s1, a1_s2, space_2):
    assert len(json.loads(a1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(a1_s2.get(reverse(LIST_URL)).content)) == 0

    obj_1.sync.space = space_2
    obj_1.sync.save()

    assert len(json.loads(a1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(a1_s2.get(reverse(LIST_URL)).content)) == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 405],
    ['g1_s2', 403],
    ['u1_s2', 403],
    ['a1_s2', 405],
])
def test_update(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        ),
        {'msg': 'new'},
        content_type='application/json'
    )
    assert r.status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 405],
])
def test_add(arg, request, a1_s2, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'msg': 'test'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]


def test_delete(a1_s1, a1_s2, obj_1):
    r = a1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 405

    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )

    assert r.status_code == 405
