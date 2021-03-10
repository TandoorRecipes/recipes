import json

import pytest
from django_scopes import scopes_disabled

from cookbook.models import Keyword
from cookbook.tests.views.test_views import TestViews
from django.urls import reverse


@pytest.fixture()
def keyword_1():
    return Keyword.objects.get_or_create(name='test_1')[0]


@pytest.fixture
def keyword_2():
    return Keyword.objects.get_or_create(name='test_2')[0]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('api:keyword-list')).status_code == arg[1]


def test_list_filter(keyword_1, keyword_2, u1_s1):
    # verify storage is returned
    r = u1_s1.get(reverse('api:keyword-list'))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert len(response) == 2
    assert response[0]['name'] == keyword_1.name

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?limit=1'))
    assert len(response) == 1

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?query=chicken'))
    assert len(response) == 0

    response = json.loads(u1_s1.get(f'{reverse("api:keyword-list")}?query={keyword_1.name[4:]}'))
    assert len(response) == 1

#
# def test_keyword_update(self):
#     r = self.user_client_1.patch(
#         reverse(
#             'api:keyword-detail',
#             args={self.keyword_1.id}
#         ),
#         {'name': 'new'},
#         content_type='application/json'
#     )
#     response = json.loads(r.content)
#     self.assertEqual(r.status_code, 200)
#     self.assertEqual(response['name'], 'new')
#
#
# def test_keyword_add(self):
#     r = self.user_client_1.post(
#         reverse('api:keyword-list'),
#         {'name': 'test'},
#         content_type='application/json'
#     )
#     response = json.loads(r.content)
#     self.assertEqual(r.status_code, 201)
#     self.assertEqual(response['name'], 'test')
#
#
# def test_keyword_add_duplicate(self):
#     r = self.user_client_1.post(
#         reverse('api:keyword-list'),
#         {'name': self.keyword_1.name},
#         content_type='application/json'
#     )
#     response = json.loads(r.content)
#     self.assertEqual(r.status_code, 201)
#     self.assertEqual(response['name'], self.keyword_1.name)
#
#
# def test_keyword_delete(self):
#     r = self.user_client_1.delete(
#         reverse(
#             'api:keyword-detail',
#             args={self.keyword_1.id}
#         )
#     )
#     self.assertEqual(r.status_code, 204)
#     self.assertEqual(Keyword.objects.count(), 1)
