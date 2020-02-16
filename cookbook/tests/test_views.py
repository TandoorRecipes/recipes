from django.contrib import auth
from django.contrib.auth.models import User
from django.test import TestCase, Client
from django.urls import reverse

from cookbook.models import Recipe, RecipeIngredient


class TestViews(TestCase):

    def setUp(self):
        self.client = Client()
        self.anonymous_client = Client()
        self.client.force_login(User.objects.get_or_create(username='test')[0])
        user = auth.get_user(self.client)
        self.assertTrue(user.is_authenticated)

    def test_index(self):
        r = self.client.get(reverse('index'))
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(reverse('index'))
        self.assertEqual(r.status_code, 200)

    def test_books(self):
        url = reverse('view_books')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

    def test_plan(self):
        url = reverse('view_plan')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

    def test_shopping(self):
        url = reverse('view_shopping')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

    def test_internal_recipe_update(self):
        recipe = Recipe.objects.create(
            name='Test',
            created_by=auth.get_user(self.client)
        )

        url = reverse('edit_internal_recipe', args=[recipe.pk])

        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.client.post(url, {'name': 'Changed', 'working_time': 15, 'waiting_time': 15, 'ingredients': '[]'})
        self.assertEqual(r.status_code, 200)

        recipe = Recipe.objects.get(pk=recipe.pk)
        self.assertEqual('Changed', recipe.name)

        r = self.client.post(url,
                             {'name': 'Changed', 'working_time': 15, 'waiting_time': 15,
                              'ingredients': '[{"ingredient__name":"Tomato","unit__name":"g","amount":100,"delete":false},{"ingredient__name":"Egg","unit__name":"Piece","amount":2,"delete":false}]'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(2, RecipeIngredient.objects.filter(recipe=recipe).count())
