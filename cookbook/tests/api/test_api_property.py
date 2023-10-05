import json

import pytest
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import MealType, Property, PropertyType

LIST_URL = 'api:property-list'
DETAIL_URL = 'api:property-detail'


@pytest.fixture()
def obj_1(space_1, u1_s1):
    pt = PropertyType.objects.get_or_create(name='test_1', space=space_1)[0]
    return Property.objects.get_or_create(property_amount=100, property_type=pt, space=space_1)[0]


@pytest.fixture
def obj_2(space_1, u1_s1):
    pt = PropertyType.objects.get_or_create(name='test_2', space=space_1)[0]
    return Property.objects.get_or_create(property_amount=100, property_type=pt, space=space_1)[0]


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
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 0

    obj_1.space = space_2
    obj_1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 1


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
        {'property_amount': 200},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['property_amount'] == 200


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2, space_1):
    with scopes_disabled():
        pt = PropertyType.objects.get_or_create(name='test_1', space=space_1)[0]
        c = request.getfixturevalue(arg[0])
        r = c.post(
            reverse(LIST_URL),
            {'property_amount': 100, 'property_type': {'id': pt.id, 'name': pt.name}},
            content_type='application/json'
        )
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 201:
            assert response['property_amount'] == 100
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
        assert MealType.objects.count() == 0
