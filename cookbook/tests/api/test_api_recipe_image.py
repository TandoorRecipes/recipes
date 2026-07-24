import io
import json

import pytest
from django.contrib import auth
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction
from django.db.utils import IntegrityError
from django.urls import reverse
from django_scopes import scopes_disabled
from PIL import Image

from cookbook.models import RecipeImage


def _jpeg_bytes():
    buf = io.BytesIO()
    Image.new('RGB', (2, 2), 'red').save(buf, 'JPEG')
    return buf.getvalue()

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


def test_only_one_primary_image_per_recipe(u1_s1, space_1, recipe_1_s1):
    """The DB constraint forbids two is_primary images on a single recipe."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/a.jpg', is_primary=True,
            order=0, created_by=user, space=space_1,
        )
        with pytest.raises(IntegrityError):
            with transaction.atomic():
                RecipeImage.objects.create(
                    recipe=recipe_1_s1, file='recipes/b.jpg', is_primary=True,
                    order=1, created_by=user, space=space_1,
                )


def test_primary_image_fallback_determinism(u1_s1, space_1, recipe_1_s1):
    """With no image flagged primary, the serializer falls back to the first
    image by (order, pk) — deterministically, regardless of insertion order."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        recipe_1_s1.image = ''
        recipe_1_s1.save()
        # create higher-order first so pk order != desired order
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/second.jpg', is_primary=False,
            order=5, created_by=user, space=space_1,
        )
        RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/first.jpg', is_primary=False,
            order=1, created_by=user, space=space_1,
        )
    body = json.loads(u1_s1.get(reverse('api:recipe-detail', args=[recipe_1_s1.id])).content)
    assert 'first.jpg' in (body['image'] or '')


def test_api_patch_second_primary_demotes_first(u1_s1, space_1, recipe_1_s1, img_1):
    """PATCH-ing a second image primary must demote the first (perform_update
    reorder) rather than violate the constraint with a transient two-primaries."""
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        img2 = RecipeImage.objects.create(
            recipe=recipe_1_s1, file='recipes/b.jpg', is_primary=False,
            order=1, created_by=user, space=space_1,
        )
    r = u1_s1.patch(reverse(DETAIL_URL, args=[img2.id]), {'is_primary': True}, content_type='application/json')
    assert r.status_code == 200
    with scopes_disabled():
        primaries = list(RecipeImage.objects.filter(recipe=recipe_1_s1, is_primary=True))
        assert len(primaries) == 1
        assert primaries[0].id == img2.id


def test_api_create_second_primary_demotes_first(u1_s1, space_1, recipe_1_s1, img_1):
    """POST-ing a new primary image must demote the existing primary
    (perform_create reorder) rather than 500 on the constraint."""
    upload = SimpleUploadedFile('new.jpg', _jpeg_bytes(), content_type='image/jpeg')
    r = u1_s1.post(reverse(LIST_URL), {'recipe': recipe_1_s1.id, 'file': upload, 'is_primary': True})
    assert r.status_code == 201
    with scopes_disabled():
        assert RecipeImage.objects.filter(recipe=recipe_1_s1, is_primary=True).count() == 1


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


def _make_private(recipe):
    with scopes_disabled():
        recipe.private = True
        recipe.save()


def test_private_recipe_images_hidden_from_other_space_member(u1_s1, u2_s1, img_1, recipe_1_s1):
    # A different member of the SAME space who is neither owner nor shared must
    # not see the images of a private recipe.
    _make_private(recipe_1_s1)

    listed = json.loads(u2_s1.get(reverse(LIST_URL), {'recipe': recipe_1_s1.id}).content)
    assert img_1.id not in [i['id'] for i in listed['results']]

    assert u2_s1.get(reverse(DETAIL_URL, args=[img_1.id])).status_code == 404


def test_owner_still_sees_own_private_recipe_images(u1_s1, img_1, recipe_1_s1):
    # Positive control: the owner keeps access after the recipe goes private.
    _make_private(recipe_1_s1)

    listed = json.loads(u1_s1.get(reverse(LIST_URL), {'recipe': recipe_1_s1.id}).content)
    assert img_1.id in [i['id'] for i in listed['results']]
    assert u1_s1.get(reverse(DETAIL_URL, args=[img_1.id])).status_code == 200


def test_shared_user_sees_private_recipe_images(u1_s1, u2_s1, img_1, recipe_1_s1):
    # A user the recipe is explicitly shared with keeps access.
    with scopes_disabled():
        recipe_1_s1.private = True
        recipe_1_s1.shared.add(auth.get_user(u2_s1))
        recipe_1_s1.save()

    assert u2_s1.get(reverse(DETAIL_URL, args=[img_1.id])).status_code == 200


def test_from_url_forbidden_on_inaccessible_private_recipe(u2_s1, img_1, recipe_1_s1):
    # from_url must not let a non-owner attach an image to a private recipe.
    _make_private(recipe_1_s1)
    r = u2_s1.post(
        reverse('api:recipeimage-from-url'),
        {'recipe': recipe_1_s1.id, 'image_url': 'http://example.com/x.jpg'},
        content_type='application/json',
    )
    assert r.status_code == 404




# --- crop_data: a square crop of a non-square image legitimately extends past the edges ---

def test_crop_data_allows_out_of_bounds_square_crop(u1_s1, img_1):
    """Negative offsets and sizes >100% are valid (square crop of a wide image needs the full
    width -> the square extends above/below the image). Must be accepted, not 400'd."""
    crop = {'x': -50, 'y': -150, 'width': 100, 'height': 400}
    r = u1_s1.patch(reverse(DETAIL_URL, args=[img_1.id]),
                    {'crop_data': crop}, content_type='application/json')
    assert r.status_code == 200, r.content
    assert json.loads(r.content)['crop_data'] == crop


def test_crop_data_rejects_zero_or_negative_size(u1_s1, img_1):
    for bad in ({'width': 0, 'height': 50}, {'width': 50, 'height': -10}):
        r = u1_s1.patch(reverse(DETAIL_URL, args=[img_1.id]),
                        {'crop_data': bad}, content_type='application/json')
        assert r.status_code == 400, (bad, r.content)


def test_crop_data_rejects_non_number(u1_s1, img_1):
    r = u1_s1.patch(reverse(DETAIL_URL, args=[img_1.id]),
                    {'crop_data': {'x': 'left', 'width': 50, 'height': 50}},
                    content_type='application/json')
    assert r.status_code == 400, r.content


def test_crop_data_clamps_abuse_magnitude(u1_s1, img_1):
    r = u1_s1.patch(reverse(DETAIL_URL, args=[img_1.id]),
                    {'crop_data': {'x': 999999, 'width': 50, 'height': 50}},
                    content_type='application/json')
    assert r.status_code == 200, r.content
    assert json.loads(r.content)['crop_data']['x'] == 1000  # clamped to the abuse-guard cap
