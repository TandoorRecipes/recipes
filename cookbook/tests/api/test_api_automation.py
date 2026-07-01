import json

import pytest
from django.contrib import auth
from django.urls import reverse

from cookbook.models import Automation

LIST_URL = 'api:automation-list'


def test_ordering_name(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    Automation.objects.create(name='zzz_auto', type=Automation.FOOD_ALIAS, created_by=user, space=space_1)
    Automation.objects.create(name='aaa_auto', type=Automation.FOOD_ALIAS, created_by=user, space=space_1)

    asc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=name').content)
    assert asc['results'][0]['name'] == 'aaa_auto'

    desc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=-name').content)
    assert desc['results'][0]['name'] == 'zzz_auto'
