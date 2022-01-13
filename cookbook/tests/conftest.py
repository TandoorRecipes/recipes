import copy
import inspect
import random
import uuid
import difflib

import pytest
from django.contrib import auth
from django.contrib.auth.models import Group, User
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import Food, Ingredient, Recipe, Space, Step, Unit
from cookbook.tests.factories import FoodFactory, SpaceFactory, UserFactory

register(SpaceFactory, 'space_1')
register(SpaceFactory, 'space_2')
# register(FoodFactory, space=LazyFixture('space_2'))
# TODO refactor clients to be factories

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


# @pytest.fixture()
# def space_1():
#     with scopes_disabled():
#         return Space.objects.get_or_create(name='space_1')[0]


# @pytest.fixture()
# def space_2():
#     with scopes_disabled():
#         return Space.objects.get_or_create(name='space_2')[0]


# ---------------------- OBJECT FIXTURES ---------------------

def get_random_recipe(space_1, u1_s1):
    r = Recipe.objects.create(
        name=str(uuid.uuid4()),
        waiting_time=20,
        working_time=20,
        servings=4,
        created_by=auth.get_user(u1_s1),
        space=space_1,
        internal=True,
    )

    s1 = Step.objects.create(name=str(uuid.uuid4()), instruction=str(uuid.uuid4()), space=space_1, )
    s2 = Step.objects.create(name=str(uuid.uuid4()), instruction=str(uuid.uuid4()), space=space_1, )

    r.steps.add(s1)
    r.steps.add(s2)

    for x in range(5):
        s1.ingredients.add(
            Ingredient.objects.create(
                amount=1,
                food=Food.objects.get_or_create(name=str(uuid.uuid4()), space=space_1)[0],
                unit=Unit.objects.create(name=str(uuid.uuid4()), space=space_1, ),
                note=str(uuid.uuid4()),
                space=space_1,
            )
        )

        s2.ingredients.add(
            Ingredient.objects.create(
                amount=1,
                food=Food.objects.get_or_create(name=str(uuid.uuid4()), space=space_1)[0],
                unit=Unit.objects.create(name=str(uuid.uuid4()), space=space_1, ),
                note=str(uuid.uuid4()),
                space=space_1,
            )
        )

    return r


def get_random_json_recipe():
    return {
        "name": str(uuid.uuid4()),
        "description": str(uuid.uuid4()),
        "keywords": [{"name": str(uuid.uuid4())}, {"name": str(uuid.uuid4())}],
        "steps": [
            {
                "instruction": str(uuid.uuid4()),
                "ingredients": [
                    {"food": {"name": str(uuid.uuid4())}, "unit": {"name": str(uuid.uuid4())}, "amount": random.randint(0, 10)},
                    {"food": {"name": str(uuid.uuid4())}, "unit": {"name": str(uuid.uuid4())}, "amount": random.randint(0, 10)},
                ],
            }
        ],
        "working_time": random.randint(0, 120),
        "waiting_time": random.randint(0, 120),
    }


def validate_recipe(expected, recipe):
    expected_lists = {}
    target_lists = {}
    # normalize line endings and special characterss
    # because this test may be executed on a different platform the it was written on
    expected['recipeInstructions'] = ''.join(e for e in expected['recipeInstructions'] if e.isalnum())
    recipe['recipeInstructions'] = ''.join(e for e in recipe['recipeInstructions'] if e.isalnum())
    # file and url are metadata not related to the recipe
    [expected.pop(k) for k in ['file', 'url'] if k in expected]
    # if a key is a list remove it to deal with later
    lists = [k for k, v in expected.items() if type(v) == list]
    for k in lists:
        expected_lists[k] = expected.pop(k)
        target_lists[k] = recipe.pop(k)

    # recipe dicts will have additional keys (IDs, default values, etc)
    # this will check for an exact match from expected key:value to a superset of key:value pairs
    print('Expected at least ', len(expected.items()), ' elements in receipt, got ', len(recipe.items()))
    assert len(expected.items()) <= len(recipe.items())
    for key, value in expected.items():
        print('Comparing attribute ', key)
        if str(expected[key]) != str(recipe[key]):
            print('Different values for key ', key, ': \n      \'', expected[key], '\'\n got: \'', recipe[key], '\'')
            if len(str(expected[key])) > 30:
                print('Detailed differences:')
                for diff in difflib.context_diff(str(expected[key]), str(recipe[key])):
                    print(diff)
            assert False

    # this is later, it may or may not work with keys that have list values
    # it also may or may not work on complex nested dicts
    for key in expected_lists:
        for k in expected_lists[key]:
            try:
                assert any([dict_compare(k, i) for i in target_lists[key]])
            except AssertionError as e:
                print(e)
                for result in [dict_compare(k, i, details=True) for i in target_lists[key]]:
                    print('Added Keys: ', result[0])
                    print('Removed Keys', result[1])
                    print('Modified Value Keys', result[2])
                    print('Modified Dictionary Keys', result[3])
                assert False


def dict_compare(d1, d2, details=False):
    d1_keys = set(d1.keys())
    d2_keys = set(d2.keys())
    shared = d1_keys.intersection(d2_keys)
    sub_dicts = [i for i, j in d1.items() if type(j) == dict]
    not_dicts = shared - set(sub_dicts)
    added = d1_keys - d2_keys
    removed = d2_keys - d1_keys
    modified = {o: (d1[o], d2[o]) for o in not_dicts if d1[o] != d2[o]}
    modified_dicts = {o: (d1[o], d2[o]) for o in sub_dicts if not d1[o].items() <= d2[o].items()}
    if details:
        return added, removed, modified, modified_dicts
    else:
        return any([not added, not removed, not modified, not modified_dicts])


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
        user = UserFactory(space=space, groups=group)

        c.force_login(user)
        return c


@pytest.fixture()
def a_u(client):
    return copy.deepcopy(client)


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
