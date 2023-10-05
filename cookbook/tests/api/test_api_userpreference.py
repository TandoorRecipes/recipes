import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.models import Food, UserPreference

LIST_URL = 'api:userpreference-list'
DETAIL_URL = 'api:userpreference-detail'


def test_add(u1_s1, u2_s1):
    r = u1_s1.post(reverse(LIST_URL))
    assert r.status_code == 405

    with scopes_disabled():
        UserPreference.objects.filter(user=auth.get_user(u1_s1)).delete()

    r = u2_s1.post(reverse(LIST_URL), {'user': auth.get_user(u1_s1).id, 'plan_share': []}, content_type='application/json')
    assert r.status_code == 405

    r = u1_s1.post(reverse(LIST_URL), {'user': auth.get_user(u1_s1).id, 'plan_share': []}, content_type='application/json')
    assert r.status_code == 405


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
    r = u1_s1.patch(
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

    # can't set another users non-existent pref
    r = u1_s1.patch(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u2_s1).id}
        ),
        {'user': auth.get_user(u1_s1).id, 'theme': UserPreference.DARKLY},
        content_type='application/json'
    )
    assert r.status_code == 404

    # can't set another users existent pref
    with scopes_disabled():
        UserPreference.objects.filter(user=auth.get_user(u2_s1)).delete()

    r = u1_s1.patch(
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
    # can't delete other preference
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u2_s1).id}
        )
    )
    assert r.status_code == 405

    # can't delete own preference
    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={auth.get_user(u1_s1).id}
        )
    )
    assert r.status_code == 405


def test_default_inherit_fields(u1_s1, u1_s2, space_1, space_2):
    food_inherit_fields = Food.inheritable_fields
    assert len([x.field for x in food_inherit_fields]) > 0

    # by default space food will not inherit any fields, so all of them will be ignored
    assert space_1.food_inherit.all().count() == 0
    r = u1_s1.get(
        reverse(DETAIL_URL, args={auth.get_user(u1_s1).id}),
    )

    # inherit all possible fields
    with scope(space=space_1):
        space_1.food_inherit.add(*Food.inheritable_fields.values_list('id', flat=True))

    assert space_1.food_inherit.all().count() == Food.inheritable_fields.count() > 0
    # now by default, food is inheriting all of the possible fields
    r = u1_s1.get(
        reverse(DETAIL_URL, args={auth.get_user(u1_s1).id}),
    )
    assert len([x['field'] for x in json.loads(r.content)['food_inherit_default']]) == space_1.food_inherit.all().count()

    # other spaces and users in those spaces not effected
    r = u1_s2.get(
        reverse(DETAIL_URL, args={auth.get_user(u1_s2).id}),
    )
    assert space_2.food_inherit.all().count() == 0 == len([x['field'] for x in json.loads(r.content)['food_inherit_default']])
