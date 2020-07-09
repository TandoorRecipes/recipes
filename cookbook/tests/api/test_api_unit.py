import json

from django.urls import reverse

from cookbook.models import Unit
from cookbook.tests.views.test_views import TestViews


class TestApiUnit(TestViews):

    def setUp(self):
        super(TestApiUnit, self).setUp()
        self.unit_1 = Unit.objects.create(
            name='Beef'
        )
        self.unit_2 = Unit.objects.create(
            name='Chicken'
        )

    def test_keyword_list(self):
        # verify view permissions are applied accordingly
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 403), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)],
                            reverse('api:unit-list'))

        # verify storage is returned
        r = self.user_client_1.get(reverse('api:unit-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 2)
        self.assertEqual(response[0]['name'], self.unit_1.name)

        r = self.user_client_1.get(f'{reverse("api:unit-list")}?limit=1')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

        r = self.user_client_1.get(f'{reverse("api:unit-list")}?query=Pork')
        response = json.loads(r.content)
        self.assertEqual(len(response), 0)

        r = self.user_client_1.get(f'{reverse("api:unit-list")}?query=Beef')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

    def test_keyword_update(self):
        r = self.user_client_1.patch(reverse('api:unit-detail', args={self.unit_1.id}), {'name': 'new'}, content_type='application/json')
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['name'], 'new')

    def test_keyword_delete(self):
        r = self.user_client_1.delete(reverse('api:unit-detail', args={self.unit_1.id}))
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Unit.objects.count(), 1)
