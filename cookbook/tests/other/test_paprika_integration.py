import gzip
import json
from io import BytesIO

import pytest
from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.integration.integration import Integration
from cookbook.integration.paprika import Paprika


@pytest.fixture
def paprika_importer(u1_s1, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    request = RequestFactory().get('/')
    request.user = auth.get_user(u1_s1)
    request.space = request.user.userspace_set.first().space
    with scope(space=request.space):
        yield Paprika(request, 'Paprika')


def make_gzipped_data(content: bytes) -> BytesIO:
    buf = BytesIO()
    with gzip.GzipFile(fileobj=buf, mode='wb') as gz:
        gz.write(content)
    buf.seek(0)
    return buf


def test_safe_gzip_read_success(paprika_importer):
    raw_data = b"Hello, world! This is a test string."
    gz_buf = make_gzipped_data(raw_data)
    result = paprika_importer.safe_gzip_read(gz_buf)
    assert result == raw_data


def test_safe_gzip_read_from_raw_bytes(paprika_importer):
    raw_data = b"Hello, world from raw bytes."
    gz_bytes = make_gzipped_data(raw_data).getvalue()
    result = paprika_importer.safe_gzip_read(gz_bytes)
    assert result == raw_data


def test_safe_gzip_read_exceeds_max_size(paprika_importer):
    raw_data = b"A" * 100
    gz_buf = make_gzipped_data(raw_data)
    with pytest.raises(Exception) as exc_info:
        paprika_importer.safe_gzip_read(gz_buf, max_size=50)
    assert 'maximum allowed file size' in str(exc_info.value)


def test_paprika_import_recipe_success(paprika_importer):
    recipe_dict = {
        'name': 'Goulash',
        'description': 'Hearty beef goulash',
        'servings': '4 servings',
        'cook_time': '60 mins',
        'prep_time': '20 mins',
        'directions': 'Brown beef, add spices, simmer.',
        'notes': 'Best served with bread.',
        'nutritional_info': '450 kcal',
        'source': 'Grandma',
        'source_url': 'https://example.com/goulash',
        'categories': ['Dinner', 'Hungarian'],
        'ingredients': '500g beef\n2 onions\n1 tbsp paprika',
    }
    raw_json = json.dumps(recipe_dict).encode('utf-8')
    gz_file = make_gzipped_data(raw_json)

    recipe = paprika_importer.get_recipe_from_file(gz_file)
    assert recipe.name == 'Goulash'
    assert recipe.description == 'Hearty beef goulash'
    assert recipe.servings == 4
    assert recipe.steps.count() == 1
    assert recipe.keywords.count() == 2


def test_paprika_import_gzip_bomb_safety(paprika_importer):
    # Simulate a gzip bomb with high compression ratio
    large_uncompressed = b"0" * (1024 * 1024 * 2)  # 2MB
    gz_buf = make_gzipped_data(large_uncompressed)

    with pytest.raises(Exception) as exc_info:
        paprika_importer.safe_gzip_read(gz_buf, max_size=1024 * 1024)  # 1MB limit
    assert 'maximum allowed file size' in str(exc_info.value)
