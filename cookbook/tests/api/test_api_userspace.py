import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

LIST_URL = 'api:userspace-list'
DETAIL_URL = 'api:userspace-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403, 0],
    ['g1_s1', 200, 1],  # sees only own user space
    ['u1_s1', 200, 1],
    ['a1_s1', 200, 3],  # sees user space of all users in space
    ['a2_s1', 200, 1],
])
def test_list_permission(arg, request, space_1, g1_s1, u1_s1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()

    c = request.getfixturevalue(arg[0])
    result = c.get(reverse(LIST_URL))
    assert result.status_code == arg[1]
    if arg[1] == 200:
        assert len(json.loads(result.content)['results']) == arg[2]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
    ['g1_s2', 403],
    ['u1_s2', 403],
    ['a1_s2', 403],
])
def test_update(arg, request, space_1, u1_s1, a1_s1):
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        user_space = auth.get_user(u1_s1).userspace_set.first()

        c = request.getfixturevalue(arg[0])
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={user_space.id}
            ),
            {'groups': [{'id': 3, 'name': 'admin'}]},
            content_type='application/json'
        )
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['groups'] == [{'id': 3, 'name': 'admin'}]


def test_update_space_owner(a1_s1, space_1):
    # space owners cannot modify their own permission so that they can't lock themselves out
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    r = a1_s1.patch(
        reverse(
            DETAIL_URL,
            args={auth.get_user(a1_s1).userspace_set.first().id}
        ),
        {'groups': [{'id': 2, 'name': 'user'}]},
        content_type='application/json'
    )
    assert r.status_code == 400


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 403],
])
def test_add(arg, request, u1_s1, space_1):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'user': {'id': auth.get_user(u1_s1).id, 'space': space_1.id}},
        content_type='application/json'
    )
    assert r.status_code == arg[1]


def test_delete(u1_s1, u1_s2, a1_s1, space_1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u1_s1).userspace_set.first().id}
        )
    )
    assert r.status_code == 403

    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u1_s1).userspace_set.first().id}
        )
    )
    assert r.status_code == 204
