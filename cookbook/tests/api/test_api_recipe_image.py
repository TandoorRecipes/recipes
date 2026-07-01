import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import RecipeImage

LIST_URL = 'api:recipeimage-list'
DETAIL_URL = 'api:recipeimage-detail'


@pytest.fixture()
def img_1(space_1, u1_s1, recipe_1_s1):
    return RecipeImage.objects.create(
        recipe=recipe_1_s1,
        file='recipes/test.jpg',
        is_primary=True,
        order=0,
        created_by=auth.get_user(u1_s1),
        space=space_1,
    )


def test_recipe_image_from_primary_recipeimage(u1_s1, space_1, recipe_1_s1):
    """RecipeSerializer exposes image + image_crop_data from the primary
    RecipeImage, not the legacy Recipe.image column (pattern-014 clean cut)."""
    user = auth.get_user(u1_s1)
    crop = {'x': 10, 'y': 20, 'width': 50, 'height': 50}
    with scopes_disabled():
        recipe_1_s1.image = ''   # legacy column empty; only the gallery has an image
        recipe_1_s1.save()
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/primary.jpg', is_primary=True,
            order=0, crop_data=crop, created_by=user, space=space_1,
        )
    r = u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id]))
    assert r.status_code == 200
    body = json.loads(r.content)
    assert 'primary.jpg' in (body['image'] or '')
    assert body['image_crop_data'] == crop


def test_recipe_overview_and_flat_image_from_primary(u1_s1, space_1, recipe_1_s1):
    """RecipeOverviewSerializer (list) and RecipeFlatSerializer (flat action)
    expose the primary RecipeImage via the derived image/image_crop_data keys."""
    user = auth.get_user(u1_s1)
    crop = {'x': 1, 'y': 2, 'width': 30, 'height': 40}
    with scopes_disabled():
        recipe_1_s1.image = ''
        recipe_1_s1.save()
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/overview.jpg', is_primary=True,
            order=0, crop_data=crop, created_by=user, space=space_1,
        )

    # list endpoint → RecipeOverviewSerializer
    body = json.loads(u1_s1.get(reverse('api:recipe-list')).content)
    match = next(r for r in body['results'] if r['id'] == recipe_1_s1.id)
    assert 'overview.jpg' in (match['image'] or '')
    assert match['image_crop_data'] == crop

    # flat action → RecipeFlatSerializer
    flat = json.loads(u1_s1.get(reverse('api:recipe-flat')).content)
    fmatch = next(r for r in flat if r['id'] == recipe_1_s1.id)
    assert 'overview.jpg' in (fmatch['image'] or '')
    assert fmatch['image_crop_data'] == crop


def test_multi_primary_determinism(u1_s1, space_1, recipe_1_s1):
    """Two is_primary RecipeImages on one recipe → the serializer deterministically
    picks the one with the lowest (order, pk)."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        recipe_1_s1.image = ''
        recipe_1_s1.save()
        # create higher-order first so pk order != desired order
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/second.jpg', is_primary=True,
            order=5, created_by=user, space=space_1,
        )
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/first.jpg', is_primary=True,
            order=1, created_by=user, space=space_1,
        )
    body = json.loads(u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id])).content)
    assert 'first.jpg' in (body['image'] or '')


def test_primary_flag_preferred_over_order(u1_s1, space_1, recipe_1_s1):
    """A primary image with a higher order still wins over a non-primary lower-order one."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        recipe_1_s1.image = ''
        recipe_1_s1.save()
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/nonprimary.jpg', is_primary=False,
            order=0, created_by=user, space=space_1,
        )
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/primary.jpg', is_primary=True,
            order=9, created_by=user, space=space_1,
        )
    body = json.loads(u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id])).content)
    assert 'primary.jpg' in (body['image'] or '')


def test_recipe_detail_exposes_images_gallery(u1_s1, space_1, recipe_1_s1):
    """RecipeSerializer exposes the full RecipeImage gallery as `images`, each entry
    carrying file, crop_data, is_primary and order (pattern-014 gallery)."""
    user = auth.get_user(u1_s1)
    crop = {'x': 10, 'y': 20, 'width': 50, 'height': 50}
    with scopes_disabled():
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/primary.jpg', is_primary=True,
            order=0, crop_data=crop, created_by=user, space=space_1,
        )
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/secondary.jpg', is_primary=False,
            order=1, created_by=user, space=space_1,
        )
    body = json.loads(u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id])).content)
    assert 'images' in body
    assert len(body['images']) == 2
    primary = next(i for i in body['images'] if i['is_primary'])
    assert 'primary.jpg' in primary['file']
    assert primary['crop_data'] == crop
    assert {i['is_primary'] for i in body['images']} == {True, False}


def test_recipe_detail_images_empty_when_none(u1_s1, recipe_1_s1):
    """A recipe with no RecipeImage returns an empty `images` list (not null/missing)."""
    body = json.loads(u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id])).content)
    assert body['images'] == []


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(u1_s1, u1_s2, img_1):
    assert json.loads(u1_s1.get(reverse(LIST_URL)).content)['count'] == 1
    assert json.loads(u1_s2.get(reverse(LIST_URL)).content)['count'] == 0


def test_list_filter_by_recipe(u1_s1, img_1, recipe_2_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        img2 = RecipeImage.objects.create(
            recipe=recipe_2_s1,
            file='recipes/r2.jpg',
            is_primary=True,
            order=0,
            created_by=user,
            space=space_1,
        )

    url = reverse(LIST_URL) + f'?recipe={img_1.recipe_id}'
    results = json.loads(u1_s1.get(url).content)
    assert results['count'] == 1
    assert results['results'][0]['recipe'] == img_1.recipe_id


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['u1_s2', 404],
])
def test_detail_permission(arg, request, img_1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(DETAIL_URL, args=[img_1.id])).status_code == arg[1]


def test_patch_crop_data(u1_s1, img_1):
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[img_1.id]),
        {'crop_data': {'x': 10, 'y': 20, 'width': 80, 'height': 60}},
        content_type='application/json',
    )
    assert r.status_code == 200
    assert json.loads(r.content)['crop_data'] == {'x': 10, 'y': 20, 'width': 80, 'height': 60}


def test_delete(u1_s1, img_1):
    r = u1_s1.delete(reverse(DETAIL_URL, args=[img_1.id]))
    assert r.status_code == 204
    with scopes_disabled():
        assert not RecipeImage.objects.filter(pk=img_1.id).exists()


def test_cross_space_access_rejected(u1_s2, img_1):
    r = u1_s2.get(reverse(DETAIL_URL, args=[img_1.id]))
    assert r.status_code == 404


