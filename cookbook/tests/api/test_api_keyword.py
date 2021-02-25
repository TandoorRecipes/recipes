import json

from cookbook.models import Keyword
from cookbook.tests.views.test_views import TestViews
from django.urls import reverse

class TestApiKeyword(TestViews):

    def setUp(self):
        super(TestApiKeyword, self).setUp()
        self.keyword_1 = Keyword.objects.create(
            name='meat'
        )
        self.keyword_2 = Keyword.objects.create(
            name='veggies'
        )

    def test_keyword_list(self):
        # verify view permissions are applied accordingly
        self.batch_requests(
            [
                (self.anonymous_client, 403),
                (self.guest_client_1, 403),
                (self.user_client_1, 200),
                (self.admin_client_1, 200),
                (self.superuser_client, 200)
            ],
            reverse('api:keyword-list')
        )

        # verify storage is returned
        r = self.user_client_1.get(reverse('api:keyword-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 2)
        self.assertEqual(response[0]['name'], self.keyword_1.name)

        r = self.user_client_1.get(f'{reverse("api:keyword-list")}?limit=1')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

        r = self.user_client_1.get(
            f'{reverse("api:keyword-list")}?query=chicken'
        )
        response = json.loads(r.content)
        self.assertEqual(len(response), 0)

        r = self.user_client_1.get(f'{reverse("api:keyword-list")}?query=MEAT')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

    def test_keyword_update(self):
        r = self.user_client_1.patch(
            reverse(
                'api:keyword-detail',
                args={self.keyword_1.id}
            ),
            {'name': 'new'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['name'], 'new')

    def test_keyword_add(self):
        r = self.user_client_1.post(
            reverse('api:keyword-list'),
            {'name': 'test'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(response['name'], 'test')

    def test_keyword_add_duplicate(self):
        r = self.user_client_1.post(
            reverse('api:keyword-list'),
            {'name': self.keyword_1.name},
            content_type='application/json'
        )
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(response['name'], self.keyword_1.name)

    def test_keyword_delete(self):
        r = self.user_client_1.delete(
            reverse(
                'api:keyword-detail',
                args={self.keyword_1.id}
            )
        )
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Keyword.objects.count(), 1)
