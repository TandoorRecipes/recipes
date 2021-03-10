import copy
import inspect
import uuid

import pytest
from django.contrib.auth.models import User, Group
from django_scopes import scopes_disabled

from cookbook.models import Space


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


@pytest.fixture
def test_password():
    return 'strong-test-pass'


@pytest.fixture
def create_user(db, django_user_model, test_password):
    def make_user(**kwargs):
        kwargs['password'] = test_password
        if 'username' not in kwargs:
            kwargs['username'] = str(uuid.uuid4())
        return django_user_model.objects.create_user(**kwargs)

    return make_user


@pytest.fixture
def space_1():
    with scopes_disabled():
        return Space.objects.get_or_create(name='space_1')[0]


@pytest.fixture
def space_2():
    with scopes_disabled():
        return Space.objects.get_or_create(name='space_2')[0]


@pytest.fixture
def user_1(client, space_1):
    c = copy.deepcopy(client)
    with scopes_disabled():
        print(f'creating user 1 with space {space_1}')
        user = User.objects.create(username='user_1')
        user.groups.add(Group.objects.get(name='user'))
        user.userpreference.space = space_1
        user.userpreference.save()
        c.force_login(user)
        return c


@pytest.fixture
def user_2(client, space_2):
    c = copy.deepcopy(client)
    with scopes_disabled():
        print(f'creating user 2 with space {space_2}')
        user = User.objects.create(username='user_2')
        user.groups.add(Group.objects.get(name='user'))
        user.userpreference.space = space_2
        user.userpreference.save()
        c.force_login(user)
        return c
