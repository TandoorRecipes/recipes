import json

from django.contrib import auth
from django.urls import reverse

from cookbook.models import UserPreference
from cookbook.tests.views.test_views import TestViews


class TestApiUserPreference(TestViews):

    def setUp(self):
        super(TestApiUserPreference, self).setUp()

    def test_preference(self):
        # can create own preference with default values
        r = self.user_client_1.post(reverse('api:userpreference-list'), {})
        self.assertEqual(r.status_code, 201)
        response = json.loads(r.content)
        self.assertEqual(response['user'], auth.get_user(self.user_client_1).id)
        self.assertEqual(response['theme'], UserPreference._meta.get_field('theme').get_default())

        # multi user test get user pref detail
        self.batch_requests([(self.guest_client_1, 404), (self.user_client_1, 200), (self.user_client_2, 404), (self.anonymous_client, 403), (self.admin_client_1, 404), (self.superuser_client, 200)],
                            reverse('api:userpreference-detail', args={auth.get_user(self.user_client_1).id}))

        # can update users preference
        r = self.user_client_1.put(reverse('api:userpreference-detail', args={auth.get_user(self.user_client_1).id}), {'theme': UserPreference.DARKLY}, content_type='application/json')
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['theme'], UserPreference.DARKLY)

        # cant set another users non existent pref
        r = self.user_client_1.put(reverse('api:userpreference-detail', args={auth.get_user(self.user_client_2).id}), {'theme': UserPreference.DARKLY}, content_type='application/json')
        self.assertEqual(r.status_code, 404)

        # cant set another users existent pref
        r = self.user_client_2.put(reverse('api:userpreference-detail', args={auth.get_user(self.user_client_1).id}), {'theme': UserPreference.FLATLY}, content_type='application/json')
        self.assertEqual(r.status_code, 404)

        # can set pref as superuser
        r = self.superuser_client.put(reverse('api:userpreference-detail', args={auth.get_user(self.user_client_1).id}), {'theme': UserPreference.FLATLY}, content_type='application/json')
        self.assertEqual(r.status_code, 200)
