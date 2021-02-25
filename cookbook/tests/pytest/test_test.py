import json

import pytest

from django.contrib.auth.models import User
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Keyword, Space


@pytest.mark.django_db
def test_user_create(user_1, user_2):
    r = user_1.post(reverse('api:keyword-list'), {'name': 'test', 'space': 1}, content_type='application/json')
    response = json.loads(r.content)
    assert r.status_code == 201
    assert response['name'] == 'test'

    r = user_2.get(reverse('api:keyword-detail', args={response['id']}), content_type='application/json')
    assert r.status_code == 404
