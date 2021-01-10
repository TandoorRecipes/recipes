from cookbook.models import Storage
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestEditsRecipe(TestViews):

    def setUp(self):
        super(TestEditsRecipe, self).setUp()

        self.storage = Storage.objects.create(
            name='TestStorage',
            method=Storage.DROPBOX,
            created_by=auth.get_user(self.admin_client_1),
            token='test',
            username='test',
            password='test',
        )
        self.url = reverse('edit_storage', args=[self.storage.pk])

    def test_edit_storage(self):
        r = self.admin_client_1.post(
            self.url,
            {
                'name': 'NewStorage',
                'password': '1234_pw',
                'token': '1234_token',
                'method': Storage.DROPBOX
            }
        )
        self.storage.refresh_from_db()
        self.assertEqual(self.storage.password, '1234_pw')
        self.assertEqual(self.storage.token, '1234_token')

        r = self.admin_client_1.post(
            self.url,
            {
                'name': 'NewStorage',
                'password': '1234_pw',
                'token': '1234_token',
                'method': 'not_a_valid_method'
            }
        )
        self.assertFormError(
            r,
            'form',
            'method',
            [
                'Select a valid choice. not_a_valid_method is not one of the available choices.'  # noqa: E501
            ]
        )

    def test_edit_storage_permissions(self):
        r = self.anonymous_client.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.guest_client_1.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.admin_client_1.get(self.url)
        self.assertEqual(r.status_code, 200)

        r = self.superuser_client.get(self.url)
        self.assertEqual(r.status_code, 200)
