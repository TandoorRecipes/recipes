"""pattern-014: write paths must create a primary RecipeImage, not set the
legacy Recipe.image column."""
from io import BytesIO

import pytest
from django.contrib import auth
from django_scopes import scope, scopes_disabled
from PIL import Image as PILImage

from cookbook.integration.integration import Integration
from cookbook.models import Recipe, RecipeImage


def _png_bytes():
    buf = BytesIO()
    PILImage.new('RGB', (10, 10), (255, 0, 0)).save(buf, format='PNG')
    buf.seek(0)
    return buf


@pytest.fixture()
def recipe(space_1, u1_s1):
    with scopes_disabled():
        return Recipe.objects.create(
            name='img-write', created_by=auth.get_user(u1_s1), space=space_1,
        )


def test_import_recipe_image_creates_primary_recipeimage(space_1, u1_s1, recipe):
    """Integration.import_recipe_image creates a primary RecipeImage with the
    recipe's space/created_by (not Recipe.image)."""
    request = type('R', (), {})()
    request.space = space_1
    request.user = auth.get_user(u1_s1)

    integration = Integration.__new__(Integration)
    integration.request = request

    with scope(space=space_1):
        integration.import_recipe_image(recipe, _png_bytes(), filetype='.png')

    with scopes_disabled():
        images = list(RecipeImage.objects.filter(recipe=recipe))
        assert len(images) == 1
        img = images[0]
        assert img.is_primary is True
        assert img.space_id == space_1.id
        assert img.created_by_id == recipe.created_by_id
        assert img.file


def test_import_recipe_image_cross_space(space_1, space_2, u1_s1, u1_s2, recipe):
    """The created RecipeImage lands in the recipe's space, scoped away from
    other spaces."""
    request = type('R', (), {})()
    request.space = space_1
    request.user = auth.get_user(u1_s1)

    integration = Integration.__new__(Integration)
    integration.request = request
    with scope(space=space_1):
        integration.import_recipe_image(recipe, _png_bytes(), filetype='.png')

    with scopes_disabled():
        assert RecipeImage.objects.filter(recipe=recipe, space=space_1).count() == 1
        assert RecipeImage.objects.filter(recipe=recipe, space=space_2).count() == 0


def test_import_recipe_image_second_not_primary(space_1, u1_s1, recipe):
    """A second imported image is not marked primary (only the first)."""
    request = type('R', (), {})()
    request.space = space_1
    request.user = auth.get_user(u1_s1)

    integration = Integration.__new__(Integration)
    integration.request = request
    with scope(space=space_1):
        integration.import_recipe_image(recipe, _png_bytes(), filetype='.png')
        integration.import_recipe_image(recipe, _png_bytes(), filetype='.png')

    with scopes_disabled():
        images = RecipeImage.objects.filter(recipe=recipe)
        assert images.count() == 2
        assert images.filter(is_primary=True).count() == 1
