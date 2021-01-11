import uuid

from cookbook.helper.permission_helper import share_link_valid
from cookbook.models import Recipe, ShareLink
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestViewsGeneral(TestViews):

    def test_share(self):
        internal_recipe = Recipe.objects.create(
            name='Test',
            internal=True,
            created_by=auth.get_user(self.user_client_1)
        )

        url = reverse('view_recipe', kwargs={'pk': internal_recipe.pk})
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

        url = reverse('new_share_link', kwargs={'pk': internal_recipe.pk})
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 302)
        share = ShareLink.objects.filter(recipe=internal_recipe).first()
        self.assertIsNotNone(share)
        self.assertTrue(share_link_valid(internal_recipe, share.uuid))

        url = reverse(
            'view_recipe',
            kwargs={'pk': internal_recipe.pk, 'share': share.uuid}
        )
        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 200)

        url = reverse(
            'view_recipe',
            kwargs={'pk': (internal_recipe.pk + 1), 'share': share.uuid}
        )
        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 404)

        url = reverse(
            'view_recipe',
            kwargs={'pk': internal_recipe.pk, 'share': uuid.uuid4()}
        )
        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)
