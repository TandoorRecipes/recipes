from django.contrib import auth
from django.contrib.auth.models import Group, User
from django.test import Client, TestCase


class TestBase(TestCase):
    user_client_1 = None
    user_client_2 = None
    admin_client_1 = None
    admin_client_2 = None
    guest_client_1 = None
    guest_client_2 = None
    superuser_client = None
    anonymous_client = None

    def create_login_user(self, name, group):
        client = Client()
        setattr(self, name, client)
        client.force_login(User.objects.get_or_create(username=name)[0])
        user = auth.get_user(getattr(self, name))
        user.groups.add(Group.objects.get(name=group))
        self.assertTrue(user.is_authenticated)
        return user

    def setUp(self):
        self.create_login_user('admin_client_1', 'admin')
        self.create_login_user('admin_client_2', 'admin')

        self.create_login_user('user_client_1', 'user')
        self.create_login_user('user_client_2', 'user')

        self.create_login_user('guest_client_1', 'guest')
        self.create_login_user('guest_client_2', 'guest')

        self.anonymous_client = Client()

        user = self.create_login_user('superuser_client', 'admin')
        user.is_superuser = True
        user.save()

    def batch_requests(
            self, clients, url, method='get', payload={}, content_type=''
    ):
        for c in clients:
            if method == 'get':
                r = c[0].get(url)
                self.assertEqual(
                    r.status_code,
                    c[1],
                    msg=f'GET request failed for user {auth.get_user(c[0])} when testing url {url}'  # noqa: E501
                )
