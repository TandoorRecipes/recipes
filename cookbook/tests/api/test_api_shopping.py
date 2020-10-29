import json

from django.contrib import auth
from django.db.models import ProtectedError
from django.urls import reverse

from cookbook.models import Storage, Sync, Keyword, ShoppingList
from cookbook.tests.views.test_views import TestViews


class TestApiShopping(TestViews):

    def setUp(self):
        super(TestApiShopping, self).setUp()
        self.list_1 = ShoppingList.objects.create(created_by=auth.get_user(self.user_client_1))
        self.list_2 = ShoppingList.objects.create(created_by=auth.get_user(self.user_client_2))

    def test_shopping_view_permissions(self):
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 404), (self.user_client_1, 200), (self.user_client_2, 404), (self.admin_client_1, 404), (self.superuser_client, 200)],
                            reverse('api:shoppinglist-detail', args={self.list_1.id}))

        self.list_1.shared.add(auth.get_user(self.user_client_2))

        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 404), (self.user_client_1, 200), (self.user_client_2, 200), (self.admin_client_1, 404), (self.superuser_client, 200)],
                            reverse('api:shoppinglist-detail', args={self.list_1.id}))

    # TODO add tests for editing
