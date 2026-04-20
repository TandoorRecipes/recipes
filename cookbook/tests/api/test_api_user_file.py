import json

import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import UserFile
from cookbook.tests.factories import UserFileFactory

LIST_URL = 'api:userfile-list'
DETAIL_URL = 'api:userfile-detail'


@pytest.fixture
def obj_1(space_1, u1_s1):
    with scopes_disabled():
        user = User.objects.filter(userspace__space=space_1).first()
        return UserFileFactory(space=space_1, created_by=user)


@pytest.fixture
def obj_2(space_1):
    with scopes_disabled():
        user = User.objects.filter(userspace__space=space_1).first()
        return UserFileFactory(space=space_1, created_by=user)


@pytest.fixture
def obj_3(space_2, u1_s2):
    with scopes_disabled():
        user = User.objects.filter(userspace__space=space_2).first()
        return UserFileFactory(space=space_2, created_by=user)


# ---- Permission tests ----

@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_detail_permission(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(DETAIL_URL, args=[obj_1.pk])).status_code == arg[1]


# ---- Space isolation ----

def test_list_space_isolation(obj_1, obj_3, u1_s1, u1_s2):
    r1 = u1_s1.get(reverse(LIST_URL))
    ids = [x['id'] for x in json.loads(r1.content)['results']]
    assert obj_1.pk in ids
    assert obj_3.pk not in ids


# ---- crop_data round-trip ----

def test_create_with_crop_data(u1_s1):
    crop = {'x': 10, 'y': 20, 'width': 80, 'height': 60, 'rotate': 0}
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {
        'name': 'cropped',
        'file': f,
        'crop_data': json.dumps(crop),
    })
    assert r.status_code == 201
    data = json.loads(r.content)
    assert data['crop_data'] == crop


def test_create_without_crop_data(u1_s1):
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {'name': 'no-crop', 'file': f})
    assert r.status_code == 201
    assert json.loads(r.content)['crop_data'] is None


def test_update_crop_data(u1_s1, obj_1):
    crop = {'x': 5, 'y': 5, 'width': 90, 'height': 90, 'rotate': 90}
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.pk]),
        json.dumps({'crop_data': crop}),
        content_type='application/json',
    )
    assert r.status_code == 200
    with scopes_disabled():
        obj_1.refresh_from_db()
    assert obj_1.crop_data == crop


def test_clear_crop_data(u1_s1, obj_1):
    with scopes_disabled():
        obj_1.crop_data = {'x': 10, 'y': 10, 'width': 80, 'height': 80, 'rotate': 0}
        obj_1.save()
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.pk]),
        json.dumps({'crop_data': None}),
        content_type='application/json',
    )
    assert r.status_code == 200
    with scopes_disabled():
        obj_1.refresh_from_db()
    assert obj_1.crop_data is None


# ---- crop_data validation ----

def test_crop_data_invalid_type(u1_s1):
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {
        'name': 'bad',
        'file': f,
        'crop_data': json.dumps('not-an-object'),
    })
    assert r.status_code == 400


def test_crop_data_unknown_field(u1_s1):
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {
        'name': 'bad',
        'file': f,
        'crop_data': json.dumps({'x': 10, 'y': 20, 'width': 80, 'height': 60, 'bogus': 1}),
    })
    assert r.status_code == 400


def test_crop_data_out_of_range(u1_s1):
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {
        'name': 'bad',
        'file': f,
        'crop_data': json.dumps({'x': 150, 'y': 20, 'width': 80, 'height': 60}),
    })
    assert r.status_code == 400


def test_crop_data_invalid_rotate(u1_s1):
    f = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n' + b'\x00' * 100, content_type='image/png')
    r = u1_s1.post(reverse(LIST_URL), {
        'name': 'bad',
        'file': f,
        'crop_data': json.dumps({'rotate': 45}),
    })
    assert r.status_code == 400


# ---- crop_data in detail response ----

def test_detail_includes_crop_data(u1_s1, obj_1):
    with scopes_disabled():
        obj_1.crop_data = {'x': 0, 'y': 0, 'width': 100, 'height': 100, 'rotate': 0}
        obj_1.save()
    r = u1_s1.get(reverse(DETAIL_URL, args=[obj_1.pk]))
    assert r.status_code == 200
    assert json.loads(r.content)['crop_data'] == obj_1.crop_data


# ---- JSON PATCH for crop_data (regression: 415 fix) ----

def test_json_patch_crop_data_does_not_415(u1_s1, obj_1):
    """PATCH with application/json content-type for crop_data must not return 415.
    Regression for the avatar re-crop bug where UserFileViewSet only accepted
    multipart parser."""
    crop = {'x': 1, 'y': 2, 'width': 50, 'height': 50, 'rotate': 0}
    r = u1_s1.patch(
        reverse(DETAIL_URL, args=[obj_1.pk]),
        json.dumps({'crop_data': crop}),
        content_type='application/json',
    )
    assert r.status_code != 415, "got 415 — JSONParser missing on UserFileViewSet"
    assert r.status_code == 200
    with scopes_disabled():
        obj_1.refresh_from_db()
    assert obj_1.crop_data == crop
