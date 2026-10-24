from unittest import mock

from django.urls import reverse

HEALTH_URL = 'api_health'


def test_health_ok_without_authentication(db, client):
    response = client.get(reverse(HEALTH_URL))
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    assert response.json()['checks']['database'] == 'ok'


def test_health_reports_database_failure(db, client):
    with mock.patch('cookbook.views.health._check_database', side_effect=Exception('boom')):
        response = client.get(reverse(HEALTH_URL))
    assert response.status_code == 503
    body = response.json()
    assert body['status'] == 'error'
    assert body['checks']['database'] == 'error'
    assert 'boom' not in response.content.decode()


def test_health_rejects_post(db, client):
    assert client.post(reverse(HEALTH_URL)).status_code == 405
