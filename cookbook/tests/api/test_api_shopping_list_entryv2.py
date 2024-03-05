import json
from datetime import timedelta

import pytest
from django.contrib import auth
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled

from cookbook.models import ShoppingListEntry
from cookbook.tests.factories import ShoppingListEntryFactory

LIST_URL = 'api:shoppinglistentry-list'
DETAIL_URL = 'api:shoppinglistentry-detail'


@pytest.fixture
def sle(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    return ShoppingListEntryFactory.create_batch(10, space=space_1, created_by=user)


@pytest.fixture
def sle_2(request):
    try:
        params = request.param  # request.param is a magic variable
    except AttributeError:
        params = {}
    u = request.getfixturevalue(params.get('user', 'u1_s1'))
    user = auth.get_user(u)
    count = params.get('count', 10)
    return ShoppingListEntryFactory.create_batch(count, space=user.userspace_set.filter(active=1).first().space, created_by=user)


@ pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(sle, u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    with scopes_disabled():
        e = ShoppingListEntry.objects.first()
        e.space = space_2
        e.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 9
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0


def test_get_detail(u1_s1, sle):
    r = u1_s1.get(reverse(
        DETAIL_URL,
        args={sle[0].id}
    ))
    assert json.loads(r.content)['id'] == sle[0].id


@ pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, sle):
    c = request.getfixturevalue(arg[0])
    new_val = float(sle[0].amount + 1)
    r = c.patch(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        ),
        {'amount': new_val},
        content_type='application/json'
    )
    assert r.status_code == arg[1]
    if r.status_code == 200:
        response = json.loads(r.content)
        assert response['amount'] == new_val


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, sle):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'food': {
            'id': sle[0].food.__dict__['id'],
            'name': sle[0].food.__dict__['name'],
        }, 'amount': 1},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['food']['id'] == sle[0].food.pk


def test_delete(u1_s1, u1_s2, sle):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={sle[0].id}
        )
    )

    assert r.status_code == 204


@pytest.mark.parametrize("shared, count, sle_2", [
    ('g1_s1', 20, {'user': 'g1_s1'}),
    ('g1_s2', 10, {'user': 'g1_s2'}),
    ('u2_s1', 20, {'user': 'u2_s1'}),
    ('u1_s2', 10, {'user': 'u1_s2'}),
    ('a1_s1', 20, {'user': 'a1_s1'}),
    ('a1_s2', 10, {'user': 'a1_s2'}),
], indirect=['sle_2'])
def test_sharing(request, shared, count, sle_2, sle, u1_s1):
    user = auth.get_user(u1_s1)
    shared_client = request.getfixturevalue(shared)
    shared_user = auth.get_user(shared_client)

    # confirm shared user can't access shopping list items created by u1_s1
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    assert len(json.loads(shared_client.get(reverse(LIST_URL)).content)) == 10

    user.userpreference.shopping_share.add(shared_user)
    # confirm sharing user only sees their shopping list
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 10
    r = shared_client.get(reverse(LIST_URL))
    # confirm shared user sees their list and the list that's shared with them
    assert len(json.loads(r.content)) == count

    # test shared user can mark complete
    x = shared_client.patch(
        reverse(DETAIL_URL, args={sle[0].id}),
        {'checked': True},
        content_type='application/json'
    )
    r = json.loads(shared_client.get(reverse(LIST_URL)).content)
    assert len(r) == count
    # count unchecked entries
    if not x.status_code == 404:
        count = count - 1
    assert [x['checked'] for x in r].count(False) == count
    # test shared user can delete
    x = shared_client.delete(
        reverse(
            DETAIL_URL,
            args={sle[1].id}
        )
    )
    r = json.loads(shared_client.get(reverse(LIST_URL)).content)
    assert len(r) == count
    # count unchecked entries
    if not x.status_code == 404:
        count = count - 1
    assert [x['checked'] for x in r].count(False) == count


def test_completed(sle, u1_s1):
    # check 1 entry
    u1_s1.patch(
        reverse(DETAIL_URL, args={sle[0].id}),
        {'checked': True},
        content_type='application/json'
    )
    r = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    assert len(r) == 10
    # count unchecked entries
    assert [x['checked'] for x in r].count(False) == 9
    # confirm completed_at is populated
    assert [(x['completed_at'] is not None) for x in r if x['checked']].count(True) == 1

    assert len(json.loads(u1_s1.get(f'{reverse(LIST_URL)}?checked=0').content)) == 9
    assert len(json.loads(u1_s1.get(f'{reverse(LIST_URL)}?checked=1').content)) == 1

    # uncheck entry
    u1_s1.patch(
        reverse(DETAIL_URL, args={sle[0].id}),
        {'checked': False},
        content_type='application/json'
    )
    r = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    assert [x['checked'] for x in r].count(False) == 10
    # confirm completed_at value cleared
    assert [(x['completed_at'] is not None) for x in r if x['checked']].count(True) == 0


def test_recent(sle, u1_s1):
    user = auth.get_user(u1_s1)
    user.userpreference.shopping_recent_days = 7  # hardcoded API limit 14 days
    user.userpreference.save()

    today_start = timezone.now().replace(hour=0, minute=0, second=0)

    # past_date within recent_days threshold
    past_date = today_start - timedelta(days=user.userpreference.shopping_recent_days - 1)
    sle[0].checked = True
    sle[0].completed_at = past_date
    sle[0].save()

    r = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?recent=1').content)
    assert len(r) == 10
    assert [x['checked'] for x in r].count(False) == 9

    # past_date outside recent_days threshold
    past_date = today_start - timedelta(days=user.userpreference.shopping_recent_days + 2)
    sle[0].completed_at = past_date
    sle[0].save()

    r = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?recent=1').content)
    assert len(r) == 9
    assert [x['checked'] for x in r].count(False) == 9

    # user preference moved to include entry again
    user.userpreference.shopping_recent_days = user.userpreference.shopping_recent_days + 4
    user.userpreference.save()

    r = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?recent=1').content)
    assert len(r) == 10
    assert [x['checked'] for x in r].count(False) == 9


# TODO test auto onhand
