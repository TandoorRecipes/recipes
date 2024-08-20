import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

LIST_URL = 'api:space-list'
DETAIL_URL = 'api:space-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403, 0],
    ['g1_s1', 200, 1],
    ['u1_s1', 200, 1],
    ['a1_s1', 200, 1],
    ['a2_s1', 200, 1],
])
def test_list_permission(arg, request, space_1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
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
    ['a1_s2', 404],
])
def test_update(arg, request, space_1, a1_s1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    with scopes_disabled():
        c = request.getfixturevalue(arg[0])
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={space_1.id}
            ),
            {'message': 'new'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['message'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 405],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'name': 'test'},
        content_type='application/json'
    )
    assert r.status_code == arg[1]


def test_delete(u1_s1, u1_s2, a1_s1, space_1):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    # user cannot delete space
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={space_1.id}
        )
    )
    assert r.status_code == 403

    # event the space owner cannot delete his space over the api (this might change later but for now it's only available in the UI)
    r = a1_s1.delete(
        reverse(
            DETAIL_URL,
            args={space_1.id}
        )
    )
    assert r.status_code == 405
