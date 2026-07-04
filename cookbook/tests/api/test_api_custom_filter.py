import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import CustomFilter

LIST_URL = 'api:customfilter-list'
DETAIL_URL = 'api:customfilter-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    with scopes_disabled():
        return CustomFilter.objects.create(
            name='Italian Recipes',
            type=CustomFilter.RECIPE,
            search={"keywords_or": [1, 2], "rating": "4"},
            created_by=auth.get_user(u1_s1),
            space=space_1,
        )


@pytest.fixture()
def obj_2(space_1, u1_s1):
    with scopes_disabled():
        return CustomFilter.objects.create(
            name='Quick Meals',
            type=CustomFilter.RECIPE,
            search={"sort_order": ["-rating"], "foods_or": [3]},
            created_by=auth.get_user(u1_s1),
            space=space_1,
        )


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(obj_1, obj_2, u1_s1, u1_s2):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    assert json.loads(r.content)['count'] == 2

    r = u1_s2.get(reverse(LIST_URL))
    assert json.loads(r.content)['count'] == 0


def test_create_with_type(u1_s1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'My Filter', 'type': 'RECIPE', 'search': {"keywords_or": [1]}},
        content_type='application/json'
    )
    assert r.status_code == 201
    data = json.loads(r.content)
    assert data['name'] == 'My Filter'
    assert data['type'] == 'RECIPE'
    assert data['search'] == {"keywords_or": [1]}


def test_create_food_type(u1_s1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'Food Filter', 'type': 'FOOD', 'search': {"query": "chicken"}},
        content_type='application/json'
    )
    assert r.status_code == 201
    assert json.loads(r.content)['type'] == 'FOOD'


def test_type_field_in_response(obj_1, u1_s1):
    r = u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id]))
    assert r.status_code == 200
    data = json.loads(r.content)
    assert 'type' in data
    assert data['type'] == 'RECIPE'


def test_update_type(obj_1, u1_s1):
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.id]),
        {'type': 'KEYWORD'},
        content_type='application/json'
    )
    assert r.status_code == 200
    assert json.loads(r.content)['type'] == 'KEYWORD'


def test_search_round_trip(u1_s1):
    search_params = {
        "keywords_or": [1, 2, 3],
        "foods_and": [5],
        "rating": "4",
        "sort_order": ["-name"],
        "query": "pasta",
    }
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'Round Trip', 'search': search_params},
        content_type='application/json'
    )
    assert r.status_code == 201
    data = json.loads(r.content)
    assert data['search'] == search_params


def test_search_stores_as_json(obj_1, u1_s1):
    r = u1_s1.get(reverse(DETAIL_URL, args=[obj_1.id]))
    data = json.loads(r.content)
    assert isinstance(data['search'], dict)


def test_update_search(obj_1, u1_s1):
    new_search = {"foods_or": [10, 11], "random": True}
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.id]),
        {'search': new_search},
        content_type='application/json'
    )
    assert r.status_code == 200
    assert json.loads(r.content)['search'] == new_search


def test_empty_search_accepted(u1_s1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'Empty', 'search': {}},
        content_type='application/json'
    )
    assert r.status_code == 201


def test_created_by_auto_set(u1_s1):
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'Auto User', 'search': {"query": "test"}},
        content_type='application/json'
    )
    assert r.status_code == 201
    data = json.loads(r.content)
    assert data['created_by']['id'] == auth.get_user(u1_s1).id


def test_cannot_access_other_users_filter(obj_1, u2_s1):
    r = u2_s1.get(reverse(DETAIL_URL, args=[obj_1.id]))
    assert r.status_code == 404


def test_delete(obj_1, u1_s1):
    r = u1_s1.delete(reverse(DETAIL_URL, args=[obj_1.id]))
    assert r.status_code == 204
    with scopes_disabled():
        assert not CustomFilter.objects.filter(id=obj_1.id).exists()


def test_search_field_stores_dict_not_string(u1_s1, space_1):
    with scopes_disabled():
        cf = CustomFilter.objects.create(
            name='Legacy Filter',
            search={"keywords_or": [1, 2]},
            created_by=auth.get_user(u1_s1),
            space=space_1,
        )
        CustomFilter.objects.filter(pk=cf.pk).update(search='{"keywords_or": [1, 2]}')
        cf.refresh_from_db()

    r = u1_s1.get(reverse(DETAIL_URL, args=[cf.id]))
    data = json.loads(r.content)
    assert isinstance(data['search'], (dict, str))


def test_search_field_accepts_complex_dict(u1_s1, space_1):
    complex_search = {
        "keywords_or": [1, 2, 3],
        "foods_and": [5],
        "rating": "4",
        "sort_order": ["-name"],
        "query": "pasta",
    }
    r = u1_s1.post(
        reverse(LIST_URL),
        {'name': 'Complex', 'search': complex_search},
        content_type='application/json'
    )
    assert r.status_code == 201
    assert json.loads(r.content)['search'] == complex_search


def test_filter_by_type(u1_s1, space_1):
    with scopes_disabled():
        CustomFilter.objects.create(
            name='Recipe Filter', type='RECIPE',
            search={"query": "a"}, created_by=auth.get_user(u1_s1), space=space_1
        )
        CustomFilter.objects.create(
            name='Food Filter', type='FOOD',
            search={"query": "b"}, created_by=auth.get_user(u1_s1), space=space_1
        )

    r = u1_s1.get(f'{reverse(LIST_URL)}?type=RECIPE')
    data = json.loads(r.content)
    assert data['count'] == 1
    assert data['results'][0]['name'] == 'Recipe Filter'
