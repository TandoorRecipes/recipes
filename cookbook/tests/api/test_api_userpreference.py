from cookbook.models import UserPreference

import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

LIST_URL = 'api:userpreference-list'
DETAIL_URL = 'api:userpreference-detail'


def test_add(u1_s1, u2_s1):
    r = u1_s1.post(reverse(LIST_URL))
    assert r.status_code == 400

    with scopes_disabled():
        UserPreference.objects.filter(user=auth.get_user(u1_s1)).delete()

    r = u2_s1.post(reverse(LIST_URL), {'user': auth.get_user(u1_s1).id}, content_type='application/json')
    assert r.status_code == 404

    r = u1_s1.post(reverse(LIST_URL), {'user': auth.get_user(u1_s1).id}, content_type='application/json')
    assert r.status_code == 200


def test_preference_list(u1_s1, u2_s1, u1_s2):
    # users can only see own preference in list
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert len(response) == 1
    assert response[0]['user'] == auth.get_user(u1_s1).id


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
])
def test_preference_retrieve(arg, request, u1_s1):
    c = request.getfixturevalue(arg[0])

    r = c.get(
        reverse(DETAIL_URL, args={auth.get_user(u1_s1).id}),
    )
    assert r.status_code == arg[1]


def test_preference_update(u1_s1, u2_s1):
    # can update users preference
    r = u1_s1.put(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u1_s1).id}
        ),
        {'user': auth.get_user(u1_s1).id, 'theme': UserPreference.DARKLY},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 200
    assert response['theme'] == UserPreference.DARKLY

    # cant set another users non existent pref
    r = u1_s1.put(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u2_s1).id}
        ),
        {'user': auth.get_user(u1_s1).id, 'theme': UserPreference.DARKLY},
        content_type='application/json'
    )
    assert r.status_code == 404

    # cant set another users existent pref
    with scopes_disabled():
        UserPreference.objects.filter(user=auth.get_user(u2_s1)).delete()

    r = u1_s1.put(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u2_s1).id}
        ),
        {'user': auth.get_user(u1_s1).id, 'theme': UserPreference.FLATLY},
        content_type='application/json'
    )
    assert r.status_code == 404
    with scopes_disabled():
        assert not UserPreference.objects.filter(user=auth.get_user(u2_s1)).exists()


def test_preference_delete(u1_s1, u2_s1):
    # cant delete other preference
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u2_s1).id}
        )
    )
    assert r.status_code == 404

    # can delete own preference
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u1_s1).id}
        )
    )
    assert r.status_code == 204
