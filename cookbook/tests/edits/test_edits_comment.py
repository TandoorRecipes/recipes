from cookbook.models import Comment, Recipe
from cookbook.tests.views.test_views import TestViews
from django.contrib import auth
from django.urls import reverse


class TestEditsComment(TestViews):

    def setUp(self):
        super(TestEditsComment, self).setUp()

        self.recipe = Recipe.objects.create(
            internal=True,
            working_time=1,
            waiting_time=1,
            created_by=auth.get_user(self.user_client_1)
        )

        self.comment = Comment.objects.create(
            text='TestStorage',
            created_by=auth.get_user(self.guest_client_1),
            recipe=self.recipe
        )
        self.url = reverse('edit_comment', args=[self.comment.pk])

    def test_new_comment(self):
        r = self.user_client_1.post(
            reverse(
                'view_recipe',
                args=[self.recipe.pk]
            ),
            {
                'comment-text': 'Test Comment Text',
                'comment-recipe': self.recipe.pk
            }
        )

        self.assertEqual(r.status_code, 200)

    def test_edit_comment_permissions(self):
        r = self.anonymous_client.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.guest_client_1.get(self.url)
        self.assertEqual(r.status_code, 200)

        r = self.guest_client_2.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.admin_client_1.get(self.url)
        self.assertEqual(r.status_code, 302)

        r = self.superuser_client.get(self.url)
        self.assertEqual(r.status_code, 200)
