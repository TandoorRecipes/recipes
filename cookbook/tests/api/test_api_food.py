import json

from cookbook.models import Food
from cookbook.tests.views.test_views import TestViews
from django.urls import reverse


class TestApiUnit(TestViews):

    def setUp(self):
        super(TestApiUnit, self).setUp()
        self.food_1 = Food.objects.create(
            name='Beef'
        )
        self.food_2 = Food.objects.create(
            name='Chicken'
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
            reverse('api:food-list')
        )

        # verify storage is returned
        r = self.user_client_1.get(reverse('api:food-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 2)
        self.assertEqual(response[0]['name'], self.food_1.name)

        r = self.user_client_1.get(f'{reverse("api:food-list")}?limit=1')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

        r = self.user_client_1.get(f'{reverse("api:food-list")}?query=Pork')
        response = json.loads(r.content)
        self.assertEqual(len(response), 0)

        r = self.user_client_1.get(f'{reverse("api:food-list")}?query=Beef')
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)

    def test_keyword_update(self):
        r = self.user_client_1.patch(
            reverse(
                'api:food-detail',
                args={self.food_1.id}
            ),
            {'name': 'new'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['name'], 'new')

    def test_keyword_delete(self):
        r = self.user_client_1.delete(
            reverse('api:food-detail', args={self.food_1.id})
        )
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Food.objects.count(), 1)
