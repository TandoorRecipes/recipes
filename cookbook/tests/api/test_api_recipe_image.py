"""Regression coverage for RecipeImageViewSet (models and custom from_url action).

Code already shipped — these are characterization tests locking in current
behavior so a future refactor can't silently break it.
"""
import io
import json
from unittest.mock import patch

import pytest
from django.contrib import auth
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django_scopes import scopes_disabled
from PIL import Image

from cookbook.models import Recipe, RecipeImage
from cookbook.tests.conftest import get_random_recipe


def _make_jpeg_bytes():
    """Create a minimal valid JPEG that PIL.Image.verify() accepts."""
    buf = io.BytesIO()
    Image.new('RGB', (10, 10), color='red').save(buf, format='JPEG')
    return buf.getvalue()

LIST_URL = 'api:recipeimage-list'
DETAIL_URL = 'api:recipeimage-detail'
FROM_URL = 'api:recipeimage-from-url'


# ------------------------------------------------------------------ fixtures

@pytest.fixture
def recipe_in_space_2(space_2, u1_s2):
    return get_random_recipe(space_2, u1_s2)


@pytest.fixture
def recipe_image_1(recipe_1_s1, space_1, u1_s1):
    with scopes_disabled():
        return RecipeImage.objects.create(
            recipe=recipe_1_s1,
            file=SimpleUploadedFile('primary.jpg', b'fake-bytes', content_type='image/jpeg'),
            is_primary=True,
            order=0,
            created_by=auth.get_user(u1_s1),
            space=space_1,
        )


@pytest.fixture
def recipe_image_2(recipe_1_s1, space_1, u1_s1):
    with scopes_disabled():
        return RecipeImage.objects.create(
            recipe=recipe_1_s1,
            file=SimpleUploadedFile('secondary.jpg', b'fake-bytes', content_type='image/jpeg'),
            is_primary=False,
            order=1,
            created_by=auth.get_user(u1_s1),
            space=space_1,
        )


@pytest.fixture
def cross_space_recipe_image(recipe_in_space_2, space_2, u1_s2):
    with scopes_disabled():
        return RecipeImage.objects.create(
            recipe=recipe_in_space_2,
            file=SimpleUploadedFile('other-space.jpg', b'fake-bytes', content_type='image/jpeg'),
            is_primary=True,
            order=0,
            created_by=auth.get_user(u1_s2),
            space=space_2,
        )


# ------------------------------------------------------------------ permissions

@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],  # CustomIsUser blocks guests
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, recipe_image_1, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_retrieve_permission(arg, recipe_image_1, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(DETAIL_URL, args=[recipe_image_1.id])).status_code == arg[1]


# ------------------------------------------------------------------ space isolation

def test_list_hides_cross_space_images(u1_s1, recipe_image_1, cross_space_recipe_image):
    data = json.loads(u1_s1.get(reverse(LIST_URL)).content)
    ids = [item['id'] for item in data['results']]
    assert recipe_image_1.id in ids
    assert cross_space_recipe_image.id not in ids


def test_retrieve_cross_space_returns_404(u1_s1, cross_space_recipe_image):
    r = u1_s1.get(reverse(DETAIL_URL, args=[cross_space_recipe_image.id]))
    assert r.status_code == 404


# ------------------------------------------------------------------ is_primary promotion on delete

def test_delete_primary_promotes_next(u1_s1, recipe_image_1, recipe_image_2, recipe_1_s1):
    # recipe_image_1 is primary; recipe_image_2 is not. Delete the primary.
    r = u1_s1.delete(reverse(DETAIL_URL, args=[recipe_image_1.id]))
    assert r.status_code == 204
    with scopes_disabled():
        remaining = RecipeImage.objects.get(id=recipe_image_2.id)
        assert remaining.is_primary is True, "next image should be promoted to primary"


def test_delete_sole_primary_without_siblings(u1_s1, recipe_image_1):
    # Deleting the only image should succeed with no crash / no phantom promotion.
    r = u1_s1.delete(reverse(DETAIL_URL, args=[recipe_image_1.id]))
    assert r.status_code == 204
    with scopes_disabled():
        assert not RecipeImage.objects.filter(id=recipe_image_1.id).exists()


# ------------------------------------------------------------------ from_url

def test_from_url_requires_recipe_and_image_url(u1_s1):
    r = u1_s1.post(reverse(FROM_URL), {}, content_type='application/json')
    assert r.status_code == 400


def test_from_url_rejects_cross_space_recipe(u1_s1, recipe_in_space_2):
    payload = {'recipe': recipe_in_space_2.id, 'image_url': 'https://example.com/x.jpg'}
    r = u1_s1.post(reverse(FROM_URL), payload, content_type='application/json')
    assert r.status_code == 404, f'expected 404, got {r.status_code}: {r.content}'
    with scopes_disabled():
        assert not RecipeImage.objects.filter(recipe_id=recipe_in_space_2.id).exists()


def test_from_url_rejects_upstream_error(u1_s1, recipe_1_s1):
    fake_response = type('R', (), {'ok': False, 'status_code': 502, 'headers': {}, 'content': b''})()
    with patch('cookbook.views.api.safe_request', return_value=fake_response):
        r = u1_s1.post(
            reverse(FROM_URL),
            {'recipe': recipe_1_s1.id, 'image_url': 'https://example.com/x.jpg'},
            content_type='application/json',
        )
    assert r.status_code == 400
    with scopes_disabled():
        assert not RecipeImage.objects.filter(recipe=recipe_1_s1).exists()


def test_from_url_happy_path_creates_primary_by_default(u1_s1, recipe_1_s1):
    image_bytes = _make_jpeg_bytes()
    fake_response = type('R', (), {
        'ok': True,
        'status_code': 200,
        'headers': {'content-type': 'image/jpeg'},
        'content': image_bytes,
    })()
    with patch('cookbook.views.api.safe_request', return_value=fake_response):
        r = u1_s1.post(
            reverse(FROM_URL),
            {'recipe': recipe_1_s1.id, 'image_url': 'https://example.com/x.jpg'},
            content_type='application/json',
        )
    assert r.status_code == 201, f'expected 201, got {r.status_code}: {r.content}'
    with scopes_disabled():
        images = RecipeImage.objects.filter(recipe=recipe_1_s1)
        assert images.count() == 1
        first = images.first()
        assert first.is_primary is True, "first image for a recipe should become primary"
        assert first.order == 0


def test_from_url_second_image_not_primary_and_increments_order(u1_s1, recipe_image_1):
    # recipe_image_1 is already primary with order=0. A second from_url should
    # get order=1 and is_primary=False.
    image_bytes = _make_jpeg_bytes()
    fake_response = type('R', (), {
        'ok': True,
        'status_code': 200,
        'headers': {'content-type': 'image/jpeg'},
        'content': image_bytes,
    })()
    with patch('cookbook.views.api.safe_request', return_value=fake_response):
        r = u1_s1.post(
            reverse(FROM_URL),
            {'recipe': recipe_image_1.recipe_id, 'image_url': 'https://example.com/y.jpg'},
            content_type='application/json',
        )
    assert r.status_code == 201
    with scopes_disabled():
        images = list(RecipeImage.objects.filter(recipe=recipe_image_1.recipe).order_by('order'))
        assert len(images) == 2
        assert images[0].is_primary is True
        assert images[0].order == 0
        assert images[1].is_primary is False
        assert images[1].order == 1
