import json

import pytest
from django.contrib import auth
from django.urls import reverse

from cookbook.models import Automation

LIST_URL = 'api:automation-list'
STATS_URL = 'api:automation-stats'


def get_stats(client):
    """Helper to GET the dedicated automation stats endpoint and return parsed results."""
    r = client.get(reverse(STATS_URL))
    assert r.status_code == 200
    return json.loads(r.content)


def test_stats_endpoint_returns_counts(u1_s1, space_1):
    stats = get_stats(u1_s1)
    assert isinstance(stats['total'], int)
    assert isinstance(stats['enabled'], int)
    assert isinstance(stats['disabled'], int)


def test_stats_enabled_disabled_counts(u1_s1, space_1):
    """enabled/disabled split the automations by the disabled flag; total counts all."""
    user = auth.get_user(u1_s1)
    baseline = get_stats(u1_s1)
    Automation.objects.create(name='a_on', type=Automation.FOOD_ALIAS, disabled=False, created_by=user, space=space_1)
    Automation.objects.create(name='a_off', type=Automation.FOOD_ALIAS, disabled=True, created_by=user, space=space_1)

    stats = get_stats(u1_s1)
    assert stats['total'] == baseline['total'] + 2
    assert stats['enabled'] == baseline['enabled'] + 1
    assert stats['disabled'] == baseline['disabled'] + 1


def test_ordering_name(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    Automation.objects.create(name='zzz_auto', type=Automation.FOOD_ALIAS, created_by=user, space=space_1)
    Automation.objects.create(name='aaa_auto', type=Automation.FOOD_ALIAS, created_by=user, space=space_1)

    asc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=name').content)
    assert asc['results'][0]['name'] == 'aaa_auto'

    desc = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?ordering=-name').content)
    assert desc['results'][0]['name'] == 'zzz_auto'
