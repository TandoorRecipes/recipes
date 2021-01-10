from cookbook.models import Recipe
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestViewsApi(TestViews):

    def test_external_link_permission(self):
        recipe = Recipe.objects.create(
            internal=False,
            link='test',
            working_time=1,
            waiting_time=1,
            created_by=auth.get_user(self.user_client_1)
        )
        url = reverse('api_get_external_file_link', args=[recipe.pk])

        self.assertEqual(self.anonymous_client.get(url).status_code, 302)
        self.assertEqual(self.guest_client_1.get(url).status_code, 302)
        self.assertEqual(self.user_client_1.get(url).status_code, 200)
        self.assertEqual(self.admin_client_1.get(url).status_code, 200)
        self.assertEqual(self.superuser_client.get(url).status_code, 200)

    def test_file_permission(self):
        url = reverse('api_get_recipe_file', args=[1])

        self.assertEqual(self.anonymous_client.get(url).status_code, 302)
        self.assertEqual(self.guest_client_1.get(url).status_code, 302)

    def test_sync_permission(self):
        url = reverse('api_sync')

        self.assertEqual(self.anonymous_client.get(url).status_code, 302)
        self.assertEqual(self.guest_client_1.get(url).status_code, 302)
