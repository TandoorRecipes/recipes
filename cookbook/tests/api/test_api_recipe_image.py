import json
from unittest.mock import patch

import pytest
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Recipe
from cookbook.tests.conftest import get_random_recipe

FROM_URL = 'api:recipeimage-from-url'


@pytest.fixture
def recipe_in_space_2(space_2, u1_s2):
    return get_random_recipe(space_2, u1_s2)


def test_from_url_requires_recipe_and_image_url(u1_s1):
    r = u1_s1.post(reverse(FROM_URL), {}, content_type='application/json')
    assert r.status_code == 400


def test_from_url_rejects_cross_space_recipe(u1_s1, recipe_in_space_2):
    # u1_s1 is in space 1. recipe_in_space_2 is in space 2.
    # Posting to from_url with a recipe_id from another space must not attach an image.
    payload = {'recipe': recipe_in_space_2.id, 'image_url': 'https://example.com/x.jpg'}
    r = u1_s1.post(reverse(FROM_URL), payload, content_type='application/json')
    # Must not return 201 (success). Space validation should yield 404.
    assert r.status_code == 404, f'expected 404, got {r.status_code}: {r.content}'

    with scopes_disabled():
        from cookbook.models import RecipeImage
        # No RecipeImage row should have been written for the cross-space recipe.
        assert not RecipeImage.objects.filter(recipe_id=recipe_in_space_2.id).exists()
