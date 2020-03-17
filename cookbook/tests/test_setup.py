from django.contrib import auth
from django.contrib.auth.models import User
from django.test import TestCase, Client


class TestBase(TestCase):

    def setUp(self):
        self.anonymous_client = Client()

        self.client = Client()
        self.client.force_login(User.objects.get_or_create(username='client')[0])
        user = auth.get_user(self.client)
        self.assertTrue(user.is_authenticated)

        self.another_client = Client()
        self.another_client.force_login(User.objects.get_or_create(username='another_client')[0])
        user = auth.get_user(self.another_client)
        self.assertTrue(user.is_authenticated)

        self.superuser_client = Client()
        self.superuser_client.force_login(User.objects.get_or_create(username='superuser_client', is_superuser=True)[0])
        user = auth.get_user(self.superuser_client)
        self.assertTrue(user.is_authenticated)
