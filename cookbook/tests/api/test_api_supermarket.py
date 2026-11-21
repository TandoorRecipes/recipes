import json

import pytest
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Supermarket

LIST_URL = 'api:supermarket-list'
DETAIL_URL = 'api:supermarket-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    return Supermarket.objects.get_or_create(name='test_1', space=space_1)[0]


@pytest.fixture
def obj_2(space_1, u1_s1):
    return Supermarket.objects.get_or_create(name='test_2', space=space_1)[0]


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
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0

    obj_1.space = space_2
    obj_1.save()

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 1


def test_list_filter(obj_1, obj_2, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert response['count'] == 2

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=1').content)
    assert response['count'] == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query=chicken').content)
    assert response['count'] == 0

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?query={obj_1.name[4:]}').content)
    assert response['count'] == 1


def test_list_random_false_is_not_shuffled(space_1, u1_s1):
    # https://github.com/TandoorRecipes/recipes/issues/4931
    # `random=false` (and `random=0` / `random=no`) must return the normal
    # sorted list, not a shuffled one.
    for i in range(10):
        Supermarket.objects.create(name=f'market-{i:02d}', space=space_1)

    def names(query):
        response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?limit=10{query}').content)
        assert response['count'] == 10
        return [x['name'] for x in response['results']]

    baseline = names('')
    assert baseline == sorted(baseline)
    for value in ['false', '0', 'no']:
        assert names(f'&random={value}') == baseline
    # `random=true` must still return the same items, in any order
    assert sorted(names('&random=true')) == baseline


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
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    c = request.getfixturevalue(arg[0])
    r = c.post(
        reverse(LIST_URL),
        {'name': 'test'},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['name'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )
    assert r.status_code == 404

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args={obj_1.id}
        )
    )

    assert r.status_code == 204
    with scopes_disabled():
        assert Supermarket.objects.count() == 0
