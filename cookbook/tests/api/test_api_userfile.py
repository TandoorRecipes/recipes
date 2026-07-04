import json

from django.contrib import auth
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from cookbook.models import Step, UserFile

LIST_URL = 'api:userfile-list'
DETAIL_URL = 'api:userfile-detail'


def _make_file(filename):
    return SimpleUploadedFile(filename, b'x', content_type='text/plain')


def test_ordering_name(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    UserFile.objects.create(name='zzz_file', file=_make_file('zzz.txt'), created_by=user, space=space_1)
    UserFile.objects.create(name='aaa_file', file=_make_file('aaa.txt'), created_by=user, space=space_1)

    asc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=name').content)
    assert asc['results'][0]['name'] == 'aaa_file'

    desc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=-name').content)
    assert desc['results'][0]['name'] == 'zzz_file'


def test_delete_userfile_referenced_by_step_is_blocked(u1_s1, space_1):
    """A user file attached to a recipe step is PROTECTed: deleting it must
    return a clean 4xx (403), not a 500, and the file must survive."""
    user = auth.get_user(u1_s1)
    uf = UserFile.objects.create(name='attached', file=_make_file('a.txt'), created_by=user, space=space_1)
    Step.objects.create(space=space_1, file=uf)

    r = u1_s1.delete(reverse(DETAIL_URL, args=[uf.id]))
    assert r.status_code == 403

    # delete was blocked (not a 500 / partial); the file is still retrievable
    assert u1_s1.get(reverse(DETAIL_URL, args=[uf.id])).status_code == 200
