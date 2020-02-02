from django.contrib import auth
from django.contrib.auth.models import User
from django.test import TestCase, Client
from django.urls import reverse


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
