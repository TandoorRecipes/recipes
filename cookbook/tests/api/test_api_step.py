import json

import pytest
from django.db.models import OuterRef, Subquery
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Ingredient, Step

LIST_URL = 'api:step-list'
DETAIL_URL = 'api:step-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(recipe_1_s1, u1_s1, u1_s2, space_2):
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 2
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0

    with scopes_disabled():
        recipe_1_s1.space = space_2
        recipe_1_s1.save()
        Step.objects.update(space=Subquery(Step.objects.filter(pk=OuterRef('pk')).values('recipe__space')[:1]))
        Ingredient.objects.update(space=Subquery(Ingredient.objects.filter(pk=OuterRef('pk')).values('step__recipe__space')[:1]))

    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 0
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 2


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['g1_s2', 403],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, recipe_1_s1):
    with scopes_disabled():
        s = recipe_1_s1.steps.first()
        c = request.getfixturevalue(arg[0])
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={s.id}
            ),
            {'instruction': 'new'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['instruction'] == 'new'


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
        {'instruction': 'test', 'ingredients': []},
        content_type='application/json'
    )
    response = json.loads(r.content)
    print(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        # ids can change when running multiple tests - changed assert to instruction
        assert response['instruction'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404  # ingredient is not linked to a recipe and therefore cannot be accessed
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_delete(u1_s1, u1_s2, recipe_1_s1):
    with scopes_disabled():
        s = recipe_1_s1.steps.first()
        r = u1_s2.delete(
            reverse(
                DETAIL_URL,
                args={s.id}
            )
        )
        assert r.status_code == 404

        r = u1_s1.delete(
            reverse(
                DETAIL_URL,
                args={s.id}
            )
        )

        assert r.status_code == 204
        assert not Step.objects.filter(pk=s.id).exists()
