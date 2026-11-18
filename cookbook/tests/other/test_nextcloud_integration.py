import json
import zipfile
from io import BytesIO

import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope
from PIL import Image

from cookbook.integration.nextcloud_cookbook import NextcloudCookbook


def sample_image():
    buf = BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buf, "JPEG")
    return buf.getvalue()


@pytest.fixture
def nextcloud_importer(u1_s1, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    request = RequestFactory().get('/')
    request.user = auth.get_user(u1_s1)
    request.space = request.user.userspace_set.first().space
    with scope(space=request.space):
        yield NextcloudCookbook(request, 'Nextcloud')


def test_nextcloud_import_with_image(nextcloud_importer):
    recipe_dict = {
        'name': 'Pancakes',
        'description': 'Delicious pancakes',
        'recipeYield': '4',
        'prepTime': 'PT10M',
        'cookTime': 'PT15M',
        'recipeIngredient': ['2 cups flour', '1 cup milk'],
        'recipeInstructions': [{'text': 'Mix all ingredients', 'name': 'Step 1'}],
    }
    recipe_json_bytes = json.dumps(recipe_dict).encode('utf-8')
    img_bytes = sample_image()

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, 'w') as zf:
        zf.writestr('Breakfast/Pancakes/recipe.json', recipe_json_bytes)
        zf.writestr('Breakfast/Pancakes/full.jpg', img_bytes)

    zip_buf.seek(0)
    nextcloud_importer.files = [{'name': 'export.zip', 'file': zip_buf}]

    recipe = nextcloud_importer.get_recipe_from_file(BytesIO(recipe_json_bytes))
    assert recipe.name == 'Pancakes'
    assert recipe.description == 'Delicious pancakes'
    assert recipe.image
    assert recipe.steps.count() == 1


def test_nextcloud_import_redos_safety(nextcloud_importer):
    # Malicious recipe name containing nested quantifiers and special regex characters
    recipe_dict = {
        'name': '(a+)+b',
        'description': 'ReDoS test',
        'recipeYield': '1',
        'recipeIngredient': [],
        'recipeInstructions': [],
    }
    recipe_json_bytes = json.dumps(recipe_dict).encode('utf-8')

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, 'w') as zf:
        zf.writestr('recipe.json', recipe_json_bytes)
        # 1000 'a' characters followed by /full.jpg without 'b'
        zf.writestr('a' * 1000 + '/full.jpg', b'')

    zip_buf.seek(0)
    nextcloud_importer.files = [{'name': 'export.zip', 'file': zip_buf}]

    # Must complete instantly without catastrophic backtracking
    recipe = nextcloud_importer.get_recipe_from_file(BytesIO(recipe_json_bytes))
    assert recipe.name == '(a+)+b'
