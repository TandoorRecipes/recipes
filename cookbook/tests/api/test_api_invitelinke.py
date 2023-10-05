import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import InviteLink

LIST_URL = 'api:invitelink-list'
DETAIL_URL = 'api:invitelink-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403, 0],
    ['g1_s1', 403, 0],
    ['u1_s1', 403, 0],
    ['a1_s1', 200, 1],
    ['a2_s1', 403, 0],
])
def test_list_permission(arg, request, space_1, g1_s1, u1_s1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

    c = request.getfixturevalue(arg[0])
    result = c.get(reverse(LIST_URL))
    assert result.status_code == arg[1]
    if arg[1] == 200:
        assert len(json.loads(result.content)) == arg[2]


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

        il = InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

        c = request.getfixturevalue(arg[0])
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={il.id}
            ),
            {'email': 'test@mail.de'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        print(response)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['email'] == 'test@mail.de'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 201],
    ['a2_s1', 403],
])
def test_add(arg, request, a1_s1, space_1):
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()
        c = request.getfixturevalue(arg[0])

        r = c.post(
            reverse(LIST_URL),
            {'group': {'id': 3, 'name': 'admin'}},
            content_type='application/json'
        )
        print(r.content)
        assert r.status_code == arg[1]


def test_delete(u1_s1, u1_s2, a1_s1, a2_s1, space_1):
    with scopes_disabled():
        il = InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # user cant delete
        r = u1_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 403

        # admin cant delete
        r = a2_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 403

        # owner can delete
        r = a1_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 204
