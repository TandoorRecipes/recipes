from django.contrib import auth
from django.contrib.auth.models import Group, User
from django.test import Client, TestCase

from cookbook.models import Space


class TestBase(TestCase):
    superuser_client = None
    anonymous_client = None

    guest_client_1 = None
    guest_client_2 = None
    user_client_1 = None
    user_client_2 = None
    admin_client_1 = None
    admin_client_2 = None

    s2_guest_client_1 = None
    s2_user_client_1 = None
    s2_admin_client_1 = None
    s2_superuser_client = None

    def create_login_user(self, name, group, space, superuser=False):
        client = Client()
        setattr(self, name, client)
        client.force_login(User.objects.get_or_create(username=name)[0])
        user = auth.get_user(getattr(self, name))
        user.groups.add(Group.objects.get(name=group))
        self.assertTrue(user.is_authenticated)
        if superuser:
            user.is_superuser = True

        user.userpreference.space = space
        user.save()
        return user

    def setUp(self):
        # users for space 1
        space_1 = Space.objects.create(name='space 1')

        self.create_login_user('admin_client_1', 'admin', space_1)
        self.create_login_user('admin_client_2', 'admin', space_1)

        self.create_login_user('user_client_1', 'user', space_1)
        self.create_login_user('user_client_2', 'user', space_1)

        self.create_login_user('guest_client_1', 'guest', space_1)
        self.create_login_user('guest_client_2', 'guest', space_1)

        self.anonymous_client = Client()

        self.create_login_user('superuser_client', 'admin', space_1, superuser=True)

        # users for space 2
        space_2 = Space.objects.create(name='space 2')
        self.create_login_user('s2_admin_client_1', 'admin', space_2)
        self.create_login_user('s2_user_client_1', 'user', space_2)
        self.create_login_user('s2_guest_client_1', 'guest', space_2)
        self.create_login_user('s2_superuser_client', 'admin', space_2, superuser=True)

    def batch_requests(self, clients, url, method='get', payload={}, content_type=''):
        for c in clients:
            if method == 'get':
                r = c[0].get(url)
                self.assertEqual(
                    r.status_code,
                    c[1],
                    msg=f'GET request failed for user {auth.get_user(c[0])} when testing url {url}'  # noqa: E501
                )
