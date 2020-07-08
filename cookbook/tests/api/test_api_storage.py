import json

from django.contrib import auth
from django.db.models import ProtectedError
from django.urls import reverse

from cookbook.models import Storage, Sync
from cookbook.tests.views.test_views import TestViews


class TestApiStorage(TestViews):

    def setUp(self):
        super(TestApiStorage, self).setUp()
        self.storage = Storage.objects.create(
            name='Test Storage',
            username='test',
            password='password',
            token='token',
            url='url',
            created_by=auth.get_user(self.admin_client_1)
        )

    def test_storage_list(self):
        # verify view permissions are applied accordingly
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 403), (self.user_client_1, 403), (self.admin_client_1, 200), (self.superuser_client, 200)],
                            reverse('api:storage-list'))

        # verify storage is returned
        r = self.admin_client_1.get(reverse('api:storage-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)
        storage_response = response[0]
        self.assertEqual(storage_response['name'], self.storage.name)
        self.assertFalse('password' in storage_response)
        self.assertFalse('token' in storage_response)

    def test_storage_update(self):
        # can update storage as admin
        r = self.admin_client_1.patch(reverse('api:storage-detail', args={self.storage.id}), {'name': 'new', 'password': 'new_password'}, content_type='application/json')
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['name'], 'new')

        # verify password was updated (write only field)
        self.storage.refresh_from_db()
        self.assertEqual(self.storage.password, 'new_password')

    def test_storage_delete(self):
        # can delete storage as admin
        r = self.admin_client_1.delete(reverse('api:storage-detail', args={self.storage.id}))
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Storage.objects.count(), 0)

        self.storage = Storage.objects.create(created_by=auth.get_user(self.admin_client_1), name='test protect')
        Sync.objects.create(storage=self.storage, )

        # test if deleting a storage with existing sync fails (as sync protects storage)
        with self.assertRaises(ProtectedError):
            self.admin_client_1.delete(reverse('api:storage-detail', args={self.storage.id}))
