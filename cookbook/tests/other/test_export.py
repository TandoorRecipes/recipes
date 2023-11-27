import pytest
from django.contrib import auth
from django.urls import reverse

from cookbook.forms import ImportExportBase
from cookbook.models import ExportLog


@pytest.fixture
def obj_1(space_1, u1_s1):
    return ExportLog.objects.create(type=ImportExportBase.DEFAULT, running=False, created_by=auth.get_user(u1_s1), space=space_1, exported_recipes=10, total_recipes=10)


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_export_file_cache(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_export_file', args=[obj_1.pk])).status_code == arg[1]
