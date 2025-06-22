import pytest
from django.contrib import auth
from django.contrib import messages
from django.contrib.messages import get_messages
from django.urls import reverse

from cookbook.models import Storage


@pytest.fixture
def storage_obj(a1_s1, space_1):
    return Storage.objects.create(
        name='TestStorage',
        method=Storage.DROPBOX,
        created_by=auth.get_user(a1_s1),
        token='test',
        username='test',
        password='test',
        space=space_1,
    )


def test_edit_storage(storage_obj, a1_s1, a1_s2):
    r = a1_s1.post(
        reverse('edit_storage', args={storage_obj.pk}),
        {
            'name': 'NewStorage',
            'password': '1234_pw',
            'token': '1234_token',
            'method': Storage.DROPBOX
        }
    )
    storage_obj.refresh_from_db()
    assert r.status_code == 302
    #r_messages = [m for m in get_messages(r.wsgi_request)]
    #assert not any(m.level > messages.SUCCESS for m in r_messages)

    #assert storage_obj.password == '1234_pw'
    #assert storage_obj.token == '1234_token'

    r = a1_s2.post(
        reverse('edit_storage', args={storage_obj.pk}),
        {
            'name': 'NewStorage',
            'password': '1234_pw',
            'token': '1234_token',
            'method': Storage.DROPBOX
        }
    )
    assert r.status_code == 404


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 302],
    ['a1_s1', 302],
    ['g1_s2', 302],
    ['u1_s2', 302],
    ['a1_s2', 404],
])
def test_view_permission(arg, request, storage_obj):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('edit_storage', args={storage_obj.pk})).status_code == arg[1]
