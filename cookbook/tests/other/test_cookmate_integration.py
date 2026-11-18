import io
import zipfile
from unittest import mock

import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope
from lxml import etree
from PIL import Image

from cookbook.integration.cookmate import Cookmate


def request_generator(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    return space, request


def make_jpeg():
    image = Image.new('RGB', (20, 10), color='red')
    image_bytes = io.BytesIO()
    image.save(image_bytes, 'JPEG')
    return image_bytes.getvalue()


def parse_recipes(mcb_bytes):
    with zipfile.ZipFile(io.BytesIO(mcb_bytes)) as import_zip:
        xml_files = [n for n in import_zip.namelist() if n.lower().endswith('.xml')]
        recipes = []
        for name in xml_files:
            recipes += etree.parse(io.BytesIO(import_zip.read(name))).getroot().getchildren()
        return recipes


def test_cookmate_imports_local_image_from_archive(u1_s1):
    space, request = request_generator(u1_s1)
    with scope(space=space):
        cookmate = Cookmate(request, 'COOKMATE')

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zf:
            zf.writestr('Recipe.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<cookbook>
  <recipe>
    <title>Local Photo Recipe</title>
    <imagepath>images/photo.jpg</imagepath>
  </recipe>
</cookbook>
''')
            zf.writestr('images/photo.jpg', make_jpeg())

        with zipfile.ZipFile(io.BytesIO(buffer.getvalue())) as import_zip:
            cookmate.import_zip = import_zip
            recipe = cookmate.get_recipe_from_file(parse_recipes(buffer.getvalue())[0])

        assert recipe.image


def test_cookmate_falls_back_to_imageurl(u1_s1):
    space, request = request_generator(u1_s1)
    with scope(space=space):
        cookmate = Cookmate(request, 'COOKMATE')

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zf:
            zf.writestr('Recipe.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<cookbook>
  <recipe>
    <title>Remote Photo Recipe</title>
    <imageurl>https://example.com/photo.jpg</imageurl>
  </recipe>
</cookbook>
''')

        with zipfile.ZipFile(io.BytesIO(buffer.getvalue())) as import_zip:
            cookmate.import_zip = import_zip
            with mock.patch('cookbook.integration.cookmate.safe_request', return_value=mock.Mock(content=make_jpeg())) as mocked:
                recipe = cookmate.get_recipe_from_file(parse_recipes(buffer.getvalue())[0])

        assert recipe.image
        mocked.assert_called_once()


def test_cookmate_handles_empty_image_elements(u1_s1):
    space, request = request_generator(u1_s1)
    with scope(space=space):
        cookmate = Cookmate(request, 'COOKMATE')

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zf:
            zf.writestr('Recipe.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<cookbook>
  <recipe>
    <title>Empty Imagepath Recipe</title>
    <imagepath />
  </recipe>
  <recipe>
    <title>Empty Imageurl Recipe</title>
    <imageurl />
  </recipe>
</cookbook>
''')

        with zipfile.ZipFile(io.BytesIO(buffer.getvalue())) as import_zip:
            cookmate.import_zip = import_zip
            with mock.patch('cookbook.integration.cookmate.safe_request') as mocked:
                recipes = [cookmate.get_recipe_from_file(r) for r in parse_recipes(buffer.getvalue())]

        assert all(not r.image for r in recipes)
        mocked.assert_not_called()