import json
import pytest

from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Recipe
from cookbook.tests.conftest import get_random_json_recipe, validate_recipe

LIST_URL = 'api:recipe-list'
DETAIL_URL = 'api:recipe-detail'


# TODO need to add extensive tests against recipe search to go through all of the combinations of parameters
# probably needs to include a far more extensive set of initial recipes to effectively test results
# and to ensure that all parts of the code are exercised.
# TODO should probably consider adding code coverage plugin to the test suite
@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(recipe_1_s1, u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)['results']) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)['results']) == 0

    with scopes_disabled():
        recipe_1_s1.space = space_2
        recipe_1_s1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)['results']) == 0
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)['results']) == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, recipe_1_s1):
    with scopes_disabled():
        c = request.getfixturevalue(arg[0])
        j = get_random_json_recipe()
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={recipe_1_s1.id}
            ),
            j,
            content_type='application/json'
        )
        response = json.loads(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            validate_recipe(j, json.loads(r.content))


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2):
    x = 0
    while x < 2:
        c = request.getfixturevalue(arg[0])
        j = get_random_json_recipe()
        r = c.post(
            reverse(LIST_URL), j, content_type='application/json'
        )
        response = json.loads(r.content)
        print(r.content)
        assert r.status_code == arg[1]
        if r.status_code == 201:
            # id can change when running multiple tests, changed to validate name
            validate_recipe(j, json.loads(r.content))
            r = c.get(reverse(DETAIL_URL, args={response['id']}))
            assert r.status_code == 200
            r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
            assert r.status_code == 404
        x += 1


def test_delete(u1_s1, u1_s2, recipe_1_s1):
    with scopes_disabled():
        r = u1_s2.delete(
            reverse(
                DETAIL_URL,
                args={recipe_1_s1.id}
            )
        )
        assert r.status_code == 404

        r = u1_s1.delete(
            reverse(
                DETAIL_URL,
                args={recipe_1_s1.id}
            )
        )

        assert r.status_code == 204
        assert not Recipe.objects.filter(pk=recipe_1_s1.id).exists()
