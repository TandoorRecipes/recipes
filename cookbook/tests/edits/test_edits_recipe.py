from django.contrib import auth
from django.urls import reverse

from cookbook.models import Recipe, RecipeIngredient, Ingredient, Unit, Storage
from cookbook.tests.views.test_views import TestViews


class TestEditsRecipe(TestViews):

    def test_switch_recipe(self):
        internal_recipe = Recipe.objects.create(
            name='Test',
            internal=True,
            created_by=auth.get_user(self.user_client_1)
        )

        external_recipe = Recipe.objects.create(
            name='Test',
            internal=False,
            created_by=auth.get_user(self.user_client_1)
        )

        url = reverse('edit_recipe', args=[internal_recipe.pk])
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.get(r.url)
        self.assertTemplateUsed(r, 'forms/edit_internal_recipe.html')

        url = reverse('edit_recipe', args=[external_recipe.pk])
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.get(r.url)
        self.assertTemplateUsed(r, 'generic/edit_template.html')

    def test_convert_recipe(self):
        url = reverse('edit_convert_recipe', args=[42])
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 404)

        external_recipe = Recipe.objects.create(
            name='Test',
            internal=False,
            created_by=auth.get_user(self.user_client_1)
        )

        url = reverse('edit_convert_recipe', args=[external_recipe.pk])
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 302)

        recipe = Recipe.objects.get(pk=external_recipe.pk)
        self.assertTrue(recipe.internal)

        url = reverse('edit_convert_recipe', args=[recipe.pk])
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 302)

    def test_internal_recipe_update(self):
        recipe = Recipe.objects.create(
            name='Test',
            created_by=auth.get_user(self.user_client_1)
        )

        url = reverse('edit_internal_recipe', args=[recipe.pk])

        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.post(url, {'name': 'Changed', 'working_time': 15, 'waiting_time': 15, 'ingredients': '[]'})
        self.assertEqual(r.status_code, 200)

        recipe = Recipe.objects.get(pk=recipe.pk)
        self.assertEqual('Changed', recipe.name)

        Ingredient.objects.create(name='Egg')
        Unit.objects.create(name='g')

        r = self.user_client_1.post(url,
                             {'name': 'Changed', 'working_time': 15, 'waiting_time': 15,
                              'ingredients': '[{"ingredient__name":"Tomato","unit__name":"g","amount":100,"delete":false},{"ingredient__name":"Egg","unit__name":"Piece","amount":"2,5","delete":false}]'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(2, RecipeIngredient.objects.filter(recipe=recipe).count())

        r = self.user_client_1.post(url,
                             {'name': "Test", 'working_time': "Test", 'waiting_time': 15,
                              'ingredients': '[{"ingredient__name":"Tomato","unit__name":"g","amount":100,"delete":false},{"ingredient__name":"Egg","unit__name":"Piece","amount":"2,5","delete":false}]'})
        self.assertEqual(r.status_code, 403)

        with open('cookbook/tests/resources/image.jpg', 'rb') as file:
            r = self.user_client_1.post(url, {'name': "Changed", 'working_time': 15, 'waiting_time': 15, 'image': file})
            self.assertEqual(r.status_code, 200)

        with open('cookbook/tests/resources/image.png', 'rb') as file:
            r = self.user_client_1.post(url, {'name': "Changed", 'working_time': 15, 'waiting_time': 15, 'image': file})
            self.assertEqual(r.status_code, 200)

    def test_external_recipe_update(self):
        storage = Storage.objects.create(
            name='TestStorage',
            method=Storage.DROPBOX,
            created_by=auth.get_user(self.user_client_1),
            token='test',
            username='test',
            password='test',
        )

        recipe = Recipe.objects.create(
            name='Test',
            created_by=auth.get_user(self.user_client_1),
            storage=storage,
        )

        url = reverse('edit_external_recipe', args=[recipe.pk])

        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

        r = self.user_client_1.post(url, {'name': 'Test', 'working_time': 15, 'waiting_time': 15, })
        recipe.refresh_from_db()
        self.assertEqual(recipe.working_time, 15)
        self.assertEqual(recipe.waiting_time, 15)
