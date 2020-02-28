from django.contrib import auth
from django.contrib.auth.models import User
from django.test import TestCase, Client


class TestBase(TestCase):

    def setUp(self):
        self.client = Client()
        self.anonymous_client = Client()
        self.client.force_login(User.objects.get_or_create(username='test')[0])
        user = auth.get_user(self.client)
        self.assertTrue(user.is_authenticated)
