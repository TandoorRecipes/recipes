import base64
from io import BytesIO
from unittest.mock import patch

import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope
from PIL import Image

from cookbook.integration.recipesage import RecipeSage


@pytest.fixture
def recipesage_importer(u1_s1, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    request = RequestFactory().get('/')
    request.user = auth.get_user(u1_s1)
    request.space = request.user.userspace_set.first().space
    with scope(space=request.space):
        yield RecipeSage(request, 'RecipeSage')


def recipe_data(images):
    return {
        'name': 'Recipe with a photo',
        'recipeYield': '2',
        'recipeInstructions': [{
            'text': 'Mix the ingredients.'
        }],
        'recipeIngredient': [],
        'image': images,
    }


def image_bytes(image_format):
    data = BytesIO()
    mode = 'RGBA' if image_format == 'PNG' else 'RGB'
    Image.new(mode, (8, 8)).save(data, image_format)
    return data.getvalue()


@pytest.mark.parametrize('image_format, mime_subtype', [('JPEG', 'jpeg'), ('PNG', 'png'), ('GIF', 'gif'), ('WEBP', 'webp'), ('JPEG', 'jpg')])
def test_import_embedded_image(recipesage_importer, image_format, mime_subtype):
    encoded = base64.b64encode(image_bytes(image_format)).decode('ascii')
    url = f'data:image/{mime_subtype};base64,{encoded}'

    with patch('cookbook.integration.recipesage.safe_request') as request:
        recipe = recipesage_importer.get_recipe_from_file(recipe_data([url]))

    request.assert_not_called()
    recipe.refresh_from_db()
    assert recipe.image
    with recipe.image.open() as image_file, Image.open(image_file) as image:
        assert image.format == image_format
        assert image.size == (8, 8)


def test_import_remote_image(recipesage_importer):
    url = 'https://example.com/recipe.jpg'
    with patch('cookbook.integration.recipesage.safe_request') as request:
        request.return_value.content = image_bytes('JPEG')
        recipe = recipesage_importer.get_recipe_from_file(recipe_data([url]))

    request.assert_called_once_with('GET', url)
    recipe.refresh_from_db()
    assert recipe.image
    with recipe.image.open() as image_file, Image.open(image_file) as image:
        assert image.format == 'JPEG'


@pytest.mark.parametrize('images', [[], ['data:image/png;base64,invalid!'], ['data:image/unsupported;base64,' + base64.b64encode(image_bytes('JPEG')).decode('ascii')]])
def test_import_without_usable_image(recipesage_importer, images):
    with patch('cookbook.integration.recipesage.safe_request') as request:
        recipe = recipesage_importer.get_recipe_from_file(recipe_data(images))

    request.assert_not_called()
    recipe.refresh_from_db()
    assert not recipe.image
    assert recipe.name == 'Recipe with a photo'
    assert recipe.steps.get().instruction == 'Mix the ingredients.'
