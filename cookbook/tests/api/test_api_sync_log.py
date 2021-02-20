import json

from cookbook.models import Storage, Sync, SyncLog
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestApiSyncLog(TestViews):

    def setUp(self):
        super(TestApiSyncLog, self).setUp()
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

        self.sync_log = SyncLog.objects.create(
            sync=self.sync, status='success'
        )

    def test_sync_log_list(self):
        # verify view permissions are applied accordingly
        self.batch_requests(
            [
                (self.anonymous_client, 403),
                (self.guest_client_1, 403),
                (self.user_client_1, 403),
                (self.admin_client_1, 200),
                (self.superuser_client, 200)
            ],
            reverse('api:synclog-list')
        )

        # verify log entry is returned
        r = self.admin_client_1.get(reverse('api:synclog-list'))
        self.assertEqual(r.status_code, 200)
        response = json.loads(r.content)
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]['status'], self.sync_log.status)

    def test_sync_log_update(self):
        # read only view
        r = self.admin_client_1.patch(
            reverse(
                'api:synclog-detail',
                args={self.sync.id}
            ),
            {'path': 'new'},
            content_type='application/json'
        )
        self.assertEqual(r.status_code, 405)

    def test_sync_log_delete(self):
        # read only view
        r = self.admin_client_1.delete(
            reverse(
                'api:synclog-detail',
                args={self.sync.id})
        )
        self.assertEqual(r.status_code, 405)
