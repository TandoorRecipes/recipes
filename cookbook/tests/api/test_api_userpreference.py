import json

from cookbook.models import UserPreference
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestApiUserPreference(TestViews):

    def setUp(self):
        super(TestApiUserPreference, self).setUp()

    def test_preference_create(self):
        r = self.user_client_1.post(reverse('api:userpreference-list'))
        self.assertEqual(r.status_code, 201)
        response = json.loads(r.content)
        self.assertEqual(
            response['user'], auth.get_user(self.user_client_1).id
        )
        self.assertEqual(
            response['theme'],
            UserPreference._meta.get_field('theme').get_default()
        )

    def test_preference_list(self):
        UserPreference.objects.create(user=auth.get_user(self.user_client_1))
        UserPreference.objects.create(user=auth.get_user(self.guest_client_1))

        # users can only see own preference in list
        r = self.user_client_1.get(reverse('api:userpreference-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)
        self.assertEqual(
            response[0]['user'], auth.get_user(self.user_client_1).id
        )

        # superusers can see all user prefs in list
        r = self.superuser_client.get(reverse('api:userpreference-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 2)

    def test_preference_retrieve(self):
        UserPreference.objects.create(user=auth.get_user(self.user_client_1))
        UserPreference.objects.create(user=auth.get_user(self.guest_client_1))

        self.batch_requests(
            [
                (self.guest_client_1, 404),
                (self.user_client_1, 200),
                (self.user_client_2, 404),
                (self.anonymous_client, 403),
                (self.admin_client_1, 404),
                (self.superuser_client, 200)
            ],
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            )
        )

    def test_preference_update(self):
        UserPreference.objects.create(user=auth.get_user(self.user_client_1))
        UserPreference.objects.create(user=auth.get_user(self.guest_client_1))

        # can update users preference
        r = self.user_client_1.put(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            ),
            {'theme': UserPreference.DARKLY},
            content_type='application/json'
        )
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['theme'], UserPreference.DARKLY)

        # cant set another users non existent pref
        r = self.user_client_1.put(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_2).id}
            ),
            {'theme': UserPreference.DARKLY},
            content_type='application/json'
        )
        self.assertEqual(r.status_code, 404)

        # cant set another users existent pref
        r = self.user_client_2.put(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            ),
            {'theme': UserPreference.FLATLY},
            content_type='application/json'
        )
        self.assertEqual(r.status_code, 404)

        # can set pref as superuser
        r = self.superuser_client.put(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            ),
            {'theme': UserPreference.FLATLY},
            content_type='application/json'
        )
        self.assertEqual(r.status_code, 200)

    def test_preference_delete(self):
        UserPreference.objects.create(user=auth.get_user(self.user_client_1))

        # can delete own preference
        r = self.user_client_1.delete(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            )
        )
        self.assertEqual(r.status_code, 204)
        self.assertEqual(UserPreference.objects.count(), 0)

        UserPreference.objects.create(user=auth.get_user(self.user_client_1
                                                         )
                                      )

        # cant delete other preference
        r = self.user_client_2.delete(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            )
        )
        self.assertEqual(r.status_code, 404)
        self.assertEqual(UserPreference.objects.count(), 1)

        # superuser can delete everything
        r = self.superuser_client.delete(
            reverse(
                'api:userpreference-detail',
                args={auth.get_user(self.user_client_1).id}
            )
        )
        self.assertEqual(r.status_code, 204)
        self.assertEqual(UserPreference.objects.count(), 0)
