from django.contrib import auth
from django.urls import reverse

from cookbook.models import Storage
from cookbook.tests.views.test_views import TestViews


class TestEditsRecipe(TestViews):

    def test_edit_storage(self):
        storage = Storage.objects.create(
            name='TestStorage',
            method=Storage.DROPBOX,
            created_by=auth.get_user(self.client),
            token='test',
            username='test',
            password='test',
        )

        url = reverse('edit_storage', args=[storage.pk])
        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.another_client.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.superuser_client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.client.post(url, {'name': 'NewStorage', 'password': '1234_pw', 'token': '1234_token', 'method': Storage.DROPBOX})
        storage.refresh_from_db()
        self.assertEqual(storage.password, '1234_pw')
        self.assertEqual(storage.token, '1234_token')

        r = self.client.post(url, {'name': 'NewStorage', 'password': '1234_pw', 'token': '1234_token', 'method': 'not_a_valid_method'})
        self.assertFormError(r, 'form', 'method', ['Select a valid choice. not_a_valid_method is not one of the available choices.'])
