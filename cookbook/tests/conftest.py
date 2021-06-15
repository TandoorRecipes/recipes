import copy
import inspect
import uuid

import pytest
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django_scopes import scopes_disabled

from cookbook.models import Space, Recipe, Step, Ingredient, Food, Unit, Storage


# hack from https://github.com/raphaelm/django-scopes to disable scopes for all fixtures
# does not work on yield fixtures as only one yield can be used per fixture (i think)
@pytest.hookimpl(hookwrapper=True)
def pytest_fixture_setup(fixturedef, request):
    if inspect.isgeneratorfunction(fixturedef.func):
        yield
    else:
        with scopes_disabled():
            yield


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


@pytest.fixture()
def space_1():
    with scopes_disabled():
        return Space.objects.get_or_create(name='space_1')[0]


@pytest.fixture()
def space_2():
    with scopes_disabled():
        return Space.objects.get_or_create(name='space_2')[0]


# ---------------------- OBJECT FIXTURES ---------------------

def get_random_recipe(space_1, u1_s1):
    r = Recipe.objects.create(
        name=uuid.uuid4(),
        waiting_time=20,
        working_time=20,
        servings=4,
        created_by=auth.get_user(u1_s1),
        space=space_1,
        internal=True,
    )

    s1 = Step.objects.create(name=uuid.uuid4(), instruction=uuid.uuid4(), space=space_1, )
    s2 = Step.objects.create(name=uuid.uuid4(), instruction=uuid.uuid4(), space=space_1, )

    r.steps.add(s1)
    r.steps.add(s2)

    for x in range(5):
        s1.ingredients.add(
            Ingredient.objects.create(
                amount=1,
                food=Food.objects.create(name=uuid.uuid4(), space=space_1, ),
                unit=Unit.objects.create(name=uuid.uuid4(), space=space_1, ),
                note=uuid.uuid4(),
                space=space_1,
            )
        )

        s2.ingredients.add(
            Ingredient.objects.create(
                amount=1,
                food=Food.objects.create(name=uuid.uuid4(), space=space_1, ),
                unit=Unit.objects.create(name=uuid.uuid4(), space=space_1, ),
                note=uuid.uuid4(),
                space=space_1,
            )
        )

    return r


@pytest.fixture
def recipe_1_s1(space_1, u1_s1):
    return get_random_recipe(space_1, u1_s1)


@pytest.fixture
def recipe_2_s1(space_1, u1_s1):
    return get_random_recipe(space_1, u1_s1)


@pytest.fixture
def ext_recipe_1_s1(space_1, u1_s1):
    r = get_random_recipe(space_1, u1_s1)
    r.internal = False
    r.link = 'test'
    r.save()
    return r


# ---------------------- USER FIXTURES -----------------------
# maybe better with factories but this is very explict so ...

def create_user(client, space, **kwargs):
    c = copy.deepcopy(client)
    with scopes_disabled():
        group = kwargs.pop('group', None)
        username = kwargs.pop('username', uuid.uuid4())

        user = User.objects.create(username=username, **kwargs)
        if group:
            user.groups.add(Group.objects.get(name=group))

        user.userpreference.space = space
        user.userpreference.save()
        c.force_login(user)
        return c


# anonymous user
@pytest.fixture()
def a_u(client):
    return copy.deepcopy(client)


# users without any group
@pytest.fixture()
def ng1_s1(client, space_1):
    return create_user(client, space_1)


@pytest.fixture()
def ng1_s2(client, space_2):
    return create_user(client, space_2)


# guests
@pytest.fixture()
def g1_s1(client, space_1):
    return create_user(client, space_1, group='guest')


@pytest.fixture()
def g2_s1(client, space_1):
    return create_user(client, space_1, group='guest')


@pytest.fixture()
def g1_s2(client, space_2):
    return create_user(client, space_2, group='guest')


@pytest.fixture()
def g2_s2(client, space_2):
    return create_user(client, space_2, group='guest')


# users
@pytest.fixture()
def u1_s1(client, space_1):
    return create_user(client, space_1, group='user')


@pytest.fixture()
def u2_s1(client, space_1):
    return create_user(client, space_1, group='user')


@pytest.fixture()
def u1_s2(client, space_2):
    return create_user(client, space_2, group='user')


@pytest.fixture()
def u2_s2(client, space_2):
    return create_user(client, space_2, group='user')


# admins
@pytest.fixture()
def a1_s1(client, space_1):
    return create_user(client, space_1, group='admin')


@pytest.fixture()
def a2_s1(client, space_1):
    return create_user(client, space_1, group='admin')


@pytest.fixture()
def a1_s2(client, space_2):
    return create_user(client, space_2, group='admin')


@pytest.fixture()
def a2_s2(client, space_2):
    return create_user(client, space_2, group='admin')
