"""Tests for cookbook.helper.image_processing utilities."""
import pytest

from cookbook.helper.image_processing import is_file_type_allowed


@pytest.mark.parametrize("filename, image_only, expected", [
    # images — allowed in both modes
    ('photo.png',  False, True),
    ('photo.jpg',  False, True),
    ('photo.jpeg', False, True),
    ('photo.gif',  False, True),
    ('photo.webp', False, True),
    ('photo.png',  True,  True),
    # documents — allowed only in non-image mode
    ('doc.pdf',    False, True),
    ('sheet.xlsx', False, True),
    ('letter.docx', False, True),
    ('video.mp4',  False, True),
    ('video.mov',  False, True),
    ('style.css',  False, True),
    ('doc.pdf',    True,  False),
    # markdown / text — added for step file gallery
    ('notes.md',   False, True),
    ('recipe.txt', False, True),
    ('NOTES.MD',   False, True),
    ('RECIPE.TXT', False, True),
    ('notes.md',   True,  False),
    # disallowed extensions
    ('script.exe',  False, False),
    ('archive.zip', False, False),
    ('app.js',      False, False),
    ('payload.html', False, False),
])
def test_is_file_type_allowed(filename, image_only, expected):
    assert is_file_type_allowed(filename, image_only=image_only) is expected
