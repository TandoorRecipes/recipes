import json

from django.contrib import auth
from django.urls import reverse

from cookbook.models import UserPreference
from cookbook.tests.views.test_views import TestViews


class TestApiUsername(TestViews):

    def setUp(self):
        super(TestApiUsername, self).setUp()

    def test_forbidden_methods(self):
        r = self.user_client_1.post(reverse('api:username-list'))
        self.assertEqual(r.status_code, 405)

        r = self.user_client_1.put(reverse('api:username-detail', args=[auth.get_user(self.user_client_1).pk]))
        self.assertEqual(r.status_code, 405)

        r = self.user_client_1.delete(reverse('api:username-detail', args=[auth.get_user(self.user_client_1).pk]))
        self.assertEqual(r.status_code, 405)

    def test_username_list(self):
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 200), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)],
                            reverse('api:username-list'))
