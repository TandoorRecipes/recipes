import datetime
import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled

from cookbook.models import Food, Recipe, ShareLink, Step, Unit
from cookbook.tests.conftest import get_random_json_recipe, validate_recipe
from cookbook.tests.factories import CookLogFactory, RecipeFactory, UserFileFactory

LIST_URL = 'api:recipe-list'
DETAIL_URL = 'api:recipe-detail'
STATS_URL = 'api:recipe-stats'


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

    # test for space filter
    with scopes_disabled():
        recipe_1_s1.space = space_2
        recipe_1_s1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)['results']) == 0
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)['results']) == 1

    # test for private recipe filter
    with scopes_disabled():
        recipe_1_s1.created_by = auth.get_user(u1_s1)
        recipe_1_s1.private = True
        recipe_1_s1.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)['results']) == 0
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)['results']) == 0

    with scopes_disabled():
        recipe_1_s1.created_by = auth.get_user(u1_s2)
        recipe_1_s1.save()

    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)['results']) == 1


def test_share_permission(recipe_1_s1, u1_s1, u1_s2, u2_s1, a_u, space_1):
    # Same space user can access
    assert u1_s1.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk])).status_code == 200
    # Different space user cannot access without share link
    assert u1_s2.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk])).status_code == 404

    with scopes_disabled():
        # Create share link via API
        r = u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk]))
        assert r.status_code == 200
        share = ShareLink.objects.filter(recipe=recipe_1_s1).first()

    # Anonymous can access with share link
    assert a_u.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200
    # Same space can access with share link
    assert u1_s1.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200
    # CORE FIX: Different space can access with share link (issue #1238)
    assert u1_s2.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200

    # Test private recipe scenarios
    with scopes_disabled():
        recipe_1_s1.created_by = auth.get_user(u1_s1)
        recipe_1_s1.private = True
        recipe_1_s1.save()

    # Private recipe still accessible with share link
    assert a_u.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200
    assert u1_s1.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200
    assert u2_s1.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={share.uuid}').status_code == 200
    # Private recipe NOT accessible without share link (non-owner)
    assert u2_s1.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk])).status_code == 403


def test_share_permission_invalid(recipe_1_s1, u1_s2):
    """Test that invalid share links are properly rejected with 404 to avoid leaking existence."""
    import uuid
    # Invalid UUID format - cross-space user should get 404 (not 403, to avoid leaking existence)
    r = u1_s2.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + '?share=invalid-uuid')
    assert r.status_code == 404

    # Valid UUID but non-existent share link - also 404
    r = u1_s2.get(reverse(DETAIL_URL, args=[recipe_1_s1.pk]) + f'?share={uuid.uuid4()}')
    assert r.status_code == 404


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
        assert r.status_code == arg[1]
        if r.status_code == 200:
            validate_recipe(j, json.loads(r.content))


def test_update_share(u1_s1, u2_s1, u1_s2, recipe_1_s1):
    # with scopes_disabled():
    r = u1_s1.patch(
        reverse(
            DETAIL_URL,
            args={recipe_1_s1.id}
        ),
        {'shared': [{'id': auth.get_user(u1_s2).pk, 'username': auth.get_user(u1_s2).username}, {'id': auth.get_user(u2_s1).pk, 'username': auth.get_user(u2_s1).username}]},
        content_type='application/json'
    )
    response = json.loads(r.content)
    assert r.status_code == 200
    assert len(response['shared']) == 1
    assert response['shared'][0]['id'] == auth.get_user(u2_s1).pk


def test_update_private_recipe(u1_s1, u2_s1, recipe_1_s1):
    r = u1_s1.patch(reverse(DETAIL_URL, args={recipe_1_s1.id}), {'name': 'test1'}, content_type='application/json')
    assert r.status_code == 200

    with scopes_disabled():
        recipe_1_s1.private = True
        recipe_1_s1.created_by = auth.get_user(u1_s1)
        recipe_1_s1.save()

    r = u1_s1.patch(reverse(DETAIL_URL, args={recipe_1_s1.id}), {'name': 'test2'}, content_type='application/json')
    assert r.status_code == 200

    r = u2_s1.patch(reverse(DETAIL_URL, args={recipe_1_s1.id}), {'name': 'test3'}, content_type='application/json')
    assert r.status_code == 403


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
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


def test_delete(u1_s1, u1_s2, u2_s1, recipe_1_s1, recipe_2_s1):
    with scopes_disabled():
        r = u1_s2.delete(reverse(DETAIL_URL, args={recipe_1_s1.id}))
        assert r.status_code == 404

        r = u1_s1.delete(reverse(DETAIL_URL, args={recipe_1_s1.id}))

        assert r.status_code == 204
        assert not Recipe.objects.filter(pk=recipe_1_s1.id).exists()

        recipe_2_s1.created_by = auth.get_user(u1_s1)
        recipe_2_s1.private = True
        recipe_2_s1.save()

        r = u2_s1.delete(reverse(DETAIL_URL, args={recipe_2_s1.id}))
        assert r.status_code == 403

        r = u1_s1.delete(reverse(DETAIL_URL, args={recipe_2_s1.id}))
        assert r.status_code == 204


def test_food_properties_skipped_on_create(u1_s1, space_1):
    """
    Issue #4356: food_properties skipped on CREATE, returned on GET.

    CREATE skips expensive food_properties computation (returns {}) to avoid
    N+1 query timeouts. GET returns full computed values.
    """
    from cookbook.models import PropertyType, Property

    with scopes_disabled():
        unit = Unit.objects.create(name='gram', base_unit='g', space=space_1)
        prop_type = PropertyType.objects.create(name='Calories', unit='kcal', space=space_1)
        food = Food.objects.create(name='Test Food', space=space_1, properties_food_amount=100, properties_food_unit=unit)
        Property.objects.create(food=food, property_type=prop_type, property_amount=50, space=space_1)

    recipe_data = {
        "name": "Test Recipe",
        "steps": [{"instruction": "Mix", "ingredients": [{"food": {"name": "Test Food"}, "unit": {"name": "gram"}, "amount": 100}]}]
    }

    # CREATE returns empty food_properties
    r = u1_s1.post(reverse(LIST_URL), recipe_data, content_type='application/json')
    assert r.status_code == 201
    response = json.loads(r.content)
    assert response['food_properties'] == {}

    # GET returns computed food_properties
    r = u1_s1.get(reverse(DETAIL_URL, args=[response['id']]))
    assert r.status_code == 200
    get_response = json.loads(r.content)
    assert len(get_response['food_properties']) > 0


# --- recipe stats (E-1) ---

def _get_stats(client):
    r = client.get(reverse(STATS_URL))
    assert r.status_code == 200
    return json.loads(r.content)


def test_recipe_stats_empty_space(u1_s1, space_1):
    """With no recipes visible, all counts are zero."""
    stats = _get_stats(u1_s1)
    assert stats == {'total': 0, 'makenow_ready': 0, 'new': 0, 'unrated': 0, 'never_cooked': 0, 'private': 0}


def test_recipe_stats_total_and_never_cooked(u1_s1, space_1):
    """Total counts all visible recipes; never_cooked counts recipes with no CookLog
    for the caller."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        r1 = RecipeFactory.create(space=space_1)
        r2 = RecipeFactory.create(space=space_1)
        CookLogFactory.create(recipe=r1, space=space_1, created_by=user, rating=None)

    stats = _get_stats(u1_s1)
    assert stats['total'] == 2
    assert stats['never_cooked'] == 1  # r2 only


def test_recipe_stats_unrated(u1_s1, space_1):
    """unrated counts recipes without a positive rating from the caller. A
    CookLog with rating=None or 0 does NOT count as rated."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        rated = RecipeFactory.create(space=space_1)
        unrated = RecipeFactory.create(space=space_1)
        CookLogFactory.create(recipe=rated, space=space_1, created_by=user, rating=4)
        CookLogFactory.create(recipe=unrated, space=space_1, created_by=user, rating=None)

    stats = _get_stats(u1_s1)
    assert stats['unrated'] == 1
    assert stats['never_cooked'] == 0


def test_recipe_stats_new_counts_last_7_days(u1_s1, space_1):
    """new counts recipes created in the last 7 days."""
    with scopes_disabled():
        recent = RecipeFactory.create(space=space_1, created_at=timezone.now())
        old = RecipeFactory.create(space=space_1, created_at=timezone.now() - datetime.timedelta(days=30))

    stats = _get_stats(u1_s1)
    assert stats['total'] == 2
    assert stats['new'] == 1


def test_recipe_stats_private_count(u1_s1, space_1):
    """private counts caller-owned recipes flagged private."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        r1 = RecipeFactory.create(space=space_1)
        r2 = RecipeFactory.create(space=space_1, created_by=user, private=True)

    stats = _get_stats(u1_s1)
    assert stats['total'] == 2
    assert stats['private'] == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
])
def test_recipe_stats_permission(arg, request):
    """Stats is a read action — anonymous blocked, authenticated allowed."""
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(STATS_URL)).status_code == arg[1]


# ---- Step files M2M (drag-order, persistence, cross-space safety) ----

@pytest.fixture
def step_files_recipe(space_1, u1_s1):
    """A recipe with one step and three UserFiles linked to it in order [1, 2, 3]."""
    with scopes_disabled():
        user = auth.get_user(u1_s1)
        f1 = UserFileFactory(space=space_1, created_by=user, name='one')
        f2 = UserFileFactory(space=space_1, created_by=user, name='two')
        f3 = UserFileFactory(space=space_1, created_by=user, name='three')

        recipe = Recipe.objects.create(name='step files', space=space_1, created_by=user)
        step = Step.objects.create(space=space_1)
        recipe.steps.add(step)
        step.files.add(f1, f2, f3)
    return recipe, step, [f1, f2, f3]


def _get_step_files(client, recipe_id):
    r = client.get(reverse(DETAIL_URL, args=[recipe_id]))
    assert r.status_code == 200
    return json.loads(r.content)['steps'][0]['files']


def _put_recipe(client, recipe_id, recipe_data):
    return client.put(
        reverse(DETAIL_URL, args=[recipe_id]),
        json.dumps(recipe_data),
        content_type='application/json',
    )


@pytest.mark.parametrize("transform, expected_index_order", [
    # round trip — no change
    (lambda files: files,                                            [0, 1, 2]),
    # full reverse
    (lambda files: list(reversed(files)),                            [2, 1, 0]),
    # partial subset (drop middle)
    (lambda files: [f for i, f in enumerate(files) if i != 1],       [0, 2]),
    # empty
    (lambda files: [],                                               []),
], ids=['round_trip', 'reversed', 'partial_subset', 'empty'])
def test_step_files_put_persists_order(step_files_recipe, u1_s1, transform, expected_index_order):
    """PUT with step.files in any subset/order persists exactly that order on re-fetch."""
    recipe, step, files = step_files_recipe
    expected_pks = [files[i].pk for i in expected_index_order]

    r = u1_s1.get(reverse(DETAIL_URL, args=[recipe.pk]))
    recipe_data = json.loads(r.content)
    recipe_data['steps'][0]['files'] = transform(recipe_data['steps'][0]['files'])

    r = _put_recipe(u1_s1, recipe.pk, recipe_data)
    assert r.status_code == 200, r.content

    # Response shape and DB persistence both reflect the new order
    response_pks = [f['id'] for f in json.loads(r.content)['steps'][0]['files']]
    assert response_pks == expected_pks
    assert [f['id'] for f in _get_step_files(u1_s1, recipe.pk)] == expected_pks


def test_step_files_cross_space_id_is_not_linked(step_files_recipe, u1_s1, space_2, u1_s2):
    """A file ID that exists in another space must NOT be linkable to a step in space_1."""
    recipe, step, files = step_files_recipe
    [f1, f2, f3] = files

    with scopes_disabled():
        other_user = auth.get_user(u1_s2)
        cross_space_file = UserFileFactory(space=space_2, created_by=other_user, name='leak')

    r = u1_s1.get(reverse(DETAIL_URL, args=[recipe.pk]))
    recipe_data = json.loads(r.content)
    recipe_data['steps'][0]['files'] = [{'id': cross_space_file.pk}]

    r = _put_recipe(u1_s1, recipe.pk, recipe_data)
    assert r.status_code == 200  # cross-space ids are silently dropped, not errored

    after = _get_step_files(u1_s1, recipe.pk)
    assert cross_space_file.pk not in [f['id'] for f in after], \
        "cross-space file leaked into another space's step.files"


def test_step_files_partial_invalid_keeps_valid_subset(step_files_recipe, u1_s1):
    """If the request mixes valid and invalid ids, the valid ones are saved
    in order and the invalid ones are silently dropped — partial success is
    preferable to rejecting the whole update (e.g. cross-space race conditions
    or stale frontend state shouldn't cost the user their other edits)."""
    from django.db.models import Max
    from cookbook.models import UserFile

    recipe, step, files = step_files_recipe
    [f1, f2, f3] = files

    with scopes_disabled():
        max_id = UserFile.objects.aggregate(m=Max('id'))['m'] or 0
    bad_id = max_id + 10000

    r = u1_s1.get(reverse(DETAIL_URL, args=[recipe.pk]))
    recipe_data = json.loads(r.content)
    # Send f1, the bad id, then f3 — expect [f1, f3] saved (bad dropped, order preserved)
    recipe_data['steps'][0]['files'] = [{'id': f1.pk}, {'id': bad_id}, {'id': f3.pk}]

    r = _put_recipe(u1_s1, recipe.pk, recipe_data)
    assert r.status_code == 200, r.content
    assert [f['id'] for f in _get_step_files(u1_s1, recipe.pk)] == [f1.pk, f3.pk]


def test_step_files_response_shape(step_files_recipe, u1_s1):
    """Each step.files item must expose every UserFileView field the frontend reads,
    and file_url must be the direct media URL (not the zip-wrapped download endpoint)
    so the gallery non-image tiles can open files inline in a new tab."""
    recipe, step, files = step_files_recipe
    expected_keys = {'id', 'name', 'file_download', 'file_url', 'preview',
                     'file_size_kb', 'crop_data', 'created_by', 'created_at'}

    response_files = _get_step_files(u1_s1, recipe.pk)
    assert response_files
    for f in response_files:
        assert expected_keys <= set(f.keys()), \
            f"step.files item missing fields: {expected_keys - set(f.keys())}"
        assert f['file_url']
        assert '/api/download-file/' not in f['file_url'], \
            "file_url should be direct media URL, not zip-wrapped download endpoint"
