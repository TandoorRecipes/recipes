import json

from django.contrib import auth
from django.db.models import ProtectedError
from django.urls import reverse

from cookbook.models import Storage, Sync, Keyword, ShoppingList, Recipe
from cookbook.tests.views.test_views import TestViews


class TestApiShopping(TestViews):

    def setUp(self):
        super(TestApiShopping, self).setUp()
        self.internal_recipe = Recipe.objects.create(
            name='Test',
            internal=True,
            created_by=auth.get_user(self.user_client_1)
        )

    def test_shopping_view_permissions(self):
        self.batch_requests([(self.anonymous_client, 403), (self.guest_client_1, 200), (self.user_client_1, 200),
                             (self.user_client_2, 200), (self.admin_client_1, 200), (self.superuser_client, 200)],
                            reverse('api:recipe-detail', args={self.internal_recipe.id}))

    # TODO add tests for editing
