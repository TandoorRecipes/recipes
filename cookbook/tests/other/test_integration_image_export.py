"""pattern-014: export binary readers must source from the primary RecipeImage,
and a native export → re-import round-trip must preserve the image."""
from io import BytesIO

import pytest
from django.contrib import auth
from django.core.files.base import ContentFile
from django_scopes import scope, scopes_disabled
from PIL import Image as PILImage

from cookbook.integration.default import Default
from cookbook.models import ExportLog, Recipe, RecipeImage


def _png_bytes():
    buf = BytesIO()
    PILImage.new('RGB', (12, 12), (0, 128, 255)).save(buf, format='PNG')
    return buf.getvalue()


@pytest.fixture()
def recipe_with_primary_image(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        recipe = Recipe.objects.create(
            name='export-img', created_by=user, space=space_1, internal=True,
        )
        img = RecipeImage(
            recipe=recipe, is_primary=True, order=0, created_by=user, space=space_1,
        )
        img.file.save('export_primary.png', ContentFile(_png_bytes()), save=True)
        return recipe


def _integration(space, user):
    request = type('R', (), {})()
    request.space = space
    request.user = user
    request.COOKIES = {}
    integration = Default.__new__(Default)
    integration.request = request
    integration.ignored_recipes = []
    return integration


def test_export_reads_primary_recipeimage(space_1, u1_s1, recipe_with_primary_image):
    """Default export writes the primary RecipeImage bytes into the per-recipe
    zip (it no longer reads the legacy Recipe.image column)."""
    user = auth.get_user(u1_s1)
    integration = _integration(space_1, user)

    with scope(space=space_1):
        el = ExportLog.objects.create(type='DEFAULT', created_by=user, space=space_1)
        files = integration.get_files_from_recipes([recipe_with_primary_image], el, {})

    from zipfile import ZipFile
    outer = ZipFile(BytesIO(files[0][1]))
    inner_name = f'{recipe_with_primary_image.pk}.zip'
    inner = ZipFile(BytesIO(outer.read(inner_name)))
    image_entries = [n for n in inner.namelist() if n.startswith('image')]
    assert image_entries, 'export did not include an image from the primary RecipeImage'
    assert inner.read(image_entries[0]) == _png_bytes()


def test_export_import_roundtrip_preserves_image(space_1, u1_s1, recipe_with_primary_image):
    """Native zip export → re-import recreates a primary RecipeImage."""
    user = auth.get_user(u1_s1)
    integration = _integration(space_1, user)

    with scope(space=space_1):
        el = ExportLog.objects.create(type='DEFAULT', created_by=user, space=space_1)
        files = integration.get_files_from_recipes([recipe_with_primary_image], el, {})

    from zipfile import ZipFile
    outer = ZipFile(BytesIO(files[0][1]))
    inner_bytes = outer.read(f'{recipe_with_primary_image.pk}.zip')

    # re-import the single-recipe zip
    import_integration = _integration(space_1, user)
    with scope(space=space_1):
        new_recipe = import_integration.get_recipe_from_file(BytesIO(inner_bytes))

    with scopes_disabled():
        imgs = RecipeImage.objects.filter(recipe=new_recipe)
        assert imgs.count() == 1
        assert imgs.first().is_primary is True
        assert imgs.first().file
