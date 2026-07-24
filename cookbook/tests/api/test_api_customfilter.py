import json

import pytest
from django.contrib import auth
from django.urls import reverse

from cookbook.models import CustomFilter

LIST_URL = 'api:customfilter-list'


def test_ordering_name(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    CustomFilter.objects.create(name='zzz_filter', type=CustomFilter.RECIPE, search='{}', created_by=user, space=space_1)
    CustomFilter.objects.create(name='aaa_filter', type=CustomFilter.RECIPE, search='{}', created_by=user, space=space_1)

    asc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=name').content)
    assert asc['results'][0]['name'] == 'aaa_filter'

    desc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=-name').content)
    assert desc['results'][0]['name'] == 'zzz_filter'
