import json

from django.contrib import auth
from django.db.models import ProtectedError
from django.urls import reverse

from cookbook.models import Storage, Sync
from cookbook.tests.views.test_views import TestViews


class TestApiSync(TestViews):

    def setUp(self):
        super(TestApiSync, self).setUp()
        self.storage = Storage.objects.create(
            name='Test Storage',
            username='test',
            password='password',
            token='token',
            url='url',
            created_by=auth.get_user(self.admin_client_1)
        )

        self.sync = Sync.objects.create(
            storage=self.storage,
            path='path'
        )

    def test_sync_list(self):
        # verify view permissions are applied accordingly
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 403), (self.user_client_1, 403), (self.admin_client_1, 200), (self.superuser_client, 200)],
                            reverse('api:sync-list'))

        # verify sync is returned
        r = self.admin_client_1.get(reverse('api:sync-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)
        storage_response = response[0]
        self.assertEqual(storage_response['path'], self.sync.path)

    def test_sync_update(self):
        # can update sync as admin
        r = self.admin_client_1.patch(reverse('api:sync-detail', args={self.sync.id}), {'path': 'new'}, content_type='application/json')
        response = json.loads(r.content)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(response['path'], 'new')

    def test_storage_delete(self):
        # can delete sync as admin
        r = self.admin_client_1.delete(reverse('api:sync-detail', args={self.sync.id}))
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Sync.objects.count(), 0)
