import itertools
import json
from datetime import timedelta, datetime

import pytest
import pytz
from django.conf import settings
from django.contrib import auth
from django.urls import reverse
from django.utils import timezone
from django_scopes import scope

from cookbook.models import Recipe, SearchFields
from cookbook.tests.conftest import transpose
from cookbook.tests.factories import (CookLogFactory, FoodFactory, IngredientFactory,
                                      KeywordFactory, RecipeBookEntryFactory, RecipeFactory,
                                      UnitFactory, ViewLogFactory)

# TODO test combining any/all of the above
# TODO test sort_by
# TODO test sort_by new X number of recipes are new within last Y days
# TODO test loading custom filter
# TODO test loading custom filter with overrided params
# TODO makenow with above filters
# TODO test search food/keywords including/excluding children
LIST_URL = 'api:recipe-list'
sqlite = settings.DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql'


@pytest.fixture
def accent():
    return "àbçđêf ğĦìĵķĽmñ öPqŕşŧ úvŵxyž"


@pytest.fixture
def unaccent():
    return "abcdef ghijklmn opqrst uvwxyz"


@pytest.fixture
def user1(request, space_1, u1_s1, unaccent):
    user = auth.get_user(u1_s1)
    try:
        params = {x[0]: x[1] for x in request.param}
    except AttributeError:
        params = {}
    result = 1
    misspelled_result = 0
    search_term = unaccent

    if params.get('fuzzy_lookups', False):
        user.searchpreference.lookup = True
        misspelled_result = 1
    else:
        user.searchpreference.lookup = False

    if params.get('fuzzy_search', False):
        user.searchpreference.trigram.set(SearchFields.objects.all())
        misspelled_result = 1
    else:
        user.searchpreference.trigram.set([])

    if params.get('icontains', False):
        user.searchpreference.icontains.set(SearchFields.objects.all())
        search_term = 'ghijklmn'
    else:
        user.searchpreference.icontains.set([])

    if params.get('istartswith', False):
        user.searchpreference.istartswith.set(SearchFields.objects.all())
        search_term = 'abcdef'
    else:
        user.searchpreference.istartswith.set([])

    if params.get('unaccent', False):
        user.searchpreference.unaccent.set(SearchFields.objects.all())
        misspelled_result *= 2
        result *= 2
    else:
        user.searchpreference.unaccent.set([])

    # full text vectors are hard coded to use unaccent - put this after unaccent to override result
    if params.get('fulltext', False):
        user.searchpreference.fulltext.set(SearchFields.objects.all())
        # user.searchpreference.search = 'websearch'
        search_term = 'ghijklmn uvwxyz'
        result = 2
    else:
        user.searchpreference.fulltext.set([])

    user.searchpreference.save()
    misspelled_term = transpose(search_term, number=3)
    return (u1_s1, result, misspelled_result, search_term, misspelled_term, params)


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def found_recipe(request, space_1, accent, unaccent, u1_s1, u2_s1):
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    days_3 = timezone.now() - timedelta(days=3)
    days_15 = timezone.now() - timedelta(days=15)
    days_30 = timezone.now() - timedelta(days=30)
    if request.param.get('createdon', None):
        recipe1 = RecipeFactory.create(space=space_1, created_at=days_3)
        recipe2 = RecipeFactory.create(space=space_1, created_at=days_30)
        recipe3 = RecipeFactory.create(space=space_1, created_at=days_15)

    else:
        recipe1 = RecipeFactory.create(space=space_1)
        recipe2 = RecipeFactory.create(space=space_1)
        recipe3 = RecipeFactory.create(space=space_1)
    obj1 = None
    obj2 = None

    if request.param.get('food', None):
        obj1 = FoodFactory.create(name=unaccent, space=space_1)
        obj2 = FoodFactory.create(name=accent, space=space_1)
        recipe1.steps.first().ingredients.add(IngredientFactory.create(food=obj1))
        recipe2.steps.first().ingredients.add(IngredientFactory.create(food=obj2))
        recipe3.steps.first().ingredients.add(IngredientFactory.create(
            food=obj1), IngredientFactory.create(food=obj2))
    if request.param.get('keyword', None):
        obj1 = KeywordFactory.create(name=unaccent, space=space_1)
        obj2 = KeywordFactory.create(name=accent, space=space_1)
        recipe1.keywords.add(obj1)
        recipe2.keywords.add(obj2)
        recipe3.keywords.add(obj1, obj2)
        recipe1.name = unaccent
        recipe2.name = accent
        recipe1.save()
        recipe2.save()
    if request.param.get('book', None):
        obj1 = RecipeBookEntryFactory.create(recipe=recipe1).book
        obj2 = RecipeBookEntryFactory.create(recipe=recipe2).book
        RecipeBookEntryFactory.create(recipe=recipe3, book=obj1)
        RecipeBookEntryFactory.create(recipe=recipe3, book=obj2)
    if request.param.get('unit', None):
        obj1 = UnitFactory.create(name=unaccent, space=space_1)
        obj2 = UnitFactory.create(name=accent, space=space_1)
        recipe1.steps.first().ingredients.add(IngredientFactory.create(unit=obj1))
        recipe2.steps.first().ingredients.add(IngredientFactory.create(unit=obj2))
        recipe3.steps.first().ingredients.add(IngredientFactory.create(
            unit=obj1), IngredientFactory.create(unit=obj2))
    if request.param.get('name', None):
        recipe1.name = unaccent
        recipe2.name = accent
        recipe1.save()
        recipe2.save()
    if request.param.get('description', None):
        recipe1.description = unaccent
        recipe2.description = accent
        recipe1.save()
        recipe2.save()
    if request.param.get('instruction', None):
        i1 = recipe1.steps.first()
        i2 = recipe2.steps.first()
        i1.instruction = unaccent
        i2.instruction = accent
        i1.save()
        i2.save()

    if request.param.get('viewedon', None):
        ViewLogFactory.create(recipe=recipe1, created_by=user1,
                              created_at=days_3, space=space_1)
        ViewLogFactory.create(recipe=recipe2, created_by=user1,
                              created_at=days_30, space=space_1)
        ViewLogFactory.create(recipe=recipe3, created_by=user2,
                              created_at=days_15, space=space_1)
    if request.param.get('cookedon', None):
        CookLogFactory.create(recipe=recipe1, created_by=user1,
                              created_at=days_3, space=space_1)
        CookLogFactory.create(recipe=recipe2, created_by=user1,
                              created_at=days_30, space=space_1)
        CookLogFactory.create(recipe=recipe3, created_by=user2,
                              created_at=days_15, space=space_1)
    if request.param.get('timescooked', None):
        CookLogFactory.create_batch(
            5, recipe=recipe1, created_by=user1, space=space_1)
        CookLogFactory.create(recipe=recipe2, created_by=user1, space=space_1)
        CookLogFactory.create_batch(
            3, recipe=recipe3, created_by=user2, space=space_1)
    if request.param.get('rating', None):
        CookLogFactory.create(
            recipe=recipe1, created_by=user1, rating=5.0, space=space_1)
        CookLogFactory.create(
            recipe=recipe2, created_by=user1, rating=1.0, space=space_1)
        CookLogFactory.create(
            recipe=recipe3, created_by=user2, rating=3.0, space=space_1)

    return (recipe1, recipe2, recipe3, obj1, obj2, request.param)


@pytest.mark.parametrize("found_recipe, param_type", [
    ({'food': True}, 'foods'),
    ({'keyword': True}, 'keywords'),
    ({'book': True}, 'books'),
], indirect=['found_recipe'])
@pytest.mark.parametrize('operator', [('_or', 3, 0), ('_and', 1, 2), ])
def test_search_or_and_not(found_recipe, param_type, operator, recipes, u1_s1, space_1):
    with scope(space=space_1):
        param1 = f"{param_type}{operator[0]}={found_recipe[3].id}"
        param2 = f"{param_type}{operator[0]}={found_recipe[4].id}"
        param1_not = f"{param_type}{operator[0]}_not={found_recipe[3].id}"
        param2_not = f"{param_type}{operator[0]}_not={found_recipe[4].id}"

        # testing include searches
        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1}').content)
        assert r['count'] == 2
        assert found_recipe[0].id in [x['id'] for x in r['results']]
        assert found_recipe[2].id in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param2}').content)
        assert r['count'] == 2
        assert found_recipe[1].id in [x['id'] for x in r['results']]
        assert found_recipe[2].id in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) +
                       f'?{param1}&{param2}').content)
        assert r['count'] == operator[1]
        assert found_recipe[2].id in [x['id'] for x in r['results']]

        # testing _not searches
        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1_not}').content)
        assert r['count'] == 11
        assert found_recipe[0].id not in [x['id'] for x in r['results']]
        assert found_recipe[2].id not in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param2_not}').content)
        assert r['count'] == 11
        assert found_recipe[1].id not in [x['id'] for x in r['results']]
        assert found_recipe[2].id not in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) +
                       f'?{param1_not}&{param2_not}').content)
        assert r['count'] == 10 + operator[2]
        assert found_recipe[2].id not in [x['id'] for x in r['results']]


@pytest.mark.parametrize("found_recipe", [
    ({'unit': True}),
], indirect=['found_recipe'])
def test_search_units(found_recipe, recipes, u1_s1, space_1):
    with scope(space=space_1):
        param1 = f"units={found_recipe[3].id}"
        param2 = f"units={found_recipe[4].id}"

        # testing include searches
        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1}').content)
        assert r['count'] == 2
        assert found_recipe[0].id in [x['id'] for x in r['results']]
        assert found_recipe[2].id in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param2}').content)
        assert r['count'] == 2
        assert found_recipe[1].id in [x['id'] for x in r['results']]
        assert found_recipe[2].id in [x['id'] for x in r['results']]

        r = json.loads(u1_s1.get(reverse(LIST_URL) +
                       f'?{param1}&{param2}').content)
        assert r['count'] == 3
        assert found_recipe[2].id in [x['id'] for x in r['results']]


@pytest.mark.skipif(sqlite, reason="requires PostgreSQL")
@pytest.mark.parametrize("user1", itertools.product(
    [
        ('fuzzy_search', True), ('fuzzy_search', False),
        ('fuzzy_lookups', True), ('fuzzy_lookups', False)
    ],
    [('unaccent', True), ('unaccent', False)]
), indirect=['user1'], ids=str)
@pytest.mark.parametrize("found_recipe, param_type", [
    ({'unit': True}, 'unit'),
    ({'keyword': True}, 'keyword'),
    ({'food': True}, 'food'),
], indirect=['found_recipe'], ids=str)
def test_fuzzy_lookup(found_recipe, recipes, param_type, user1, space_1):
    with scope(space=space_1):
        list_url = f'api:{param_type}-list'
        param1 = f"query={user1[3]}"
        param2 = f"query={user1[4]}"

        r = json.loads(user1[0].get(reverse(list_url) +
                       f'?{param1}&limit=2').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [
                   found_recipe[3].id, found_recipe[4].id]]) == user1[1]

        r = json.loads(user1[0].get(reverse(list_url) +
                       f'?{param2}&limit=10').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [
                   found_recipe[3].id, found_recipe[4].id]]) == user1[2]

# commenting this out for general use - it is really slow
# it should be run on occasion to ensure everything still works
@pytest.mark.skipif(sqlite and True, reason="requires PostgreSQL")
@pytest.mark.parametrize("user1", itertools.product(
    [
        ('fuzzy_search', True), ('fuzzy_search', False),
        ('fulltext', True), ('fulltext', False),
        ('icontains', True), ('icontains', False),
        ('istartswith', True), ('istartswith', False),
    ],
    [('unaccent', True), ('unaccent', False)]
), indirect=['user1'], ids=str)
@pytest.mark.parametrize("found_recipe", [
    ({'name': True}),
    ({'description': True}),
    ({'instruction': True}),
    ({'keyword': True}),
    ({'food': True}),
], indirect=['found_recipe'], ids=str)
# user array contains: user client, expected count of search, expected count of mispelled search, search string, mispelled search string, user search preferences
def test_search_string(found_recipe, recipes, user1, space_1):
    with scope(space=space_1):
        param1 = f"query={user1[3]}"
        param2 = f"query={user1[4]}"

        r = json.loads(user1[0].get(reverse(LIST_URL) + f'?{param1}').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [
                   found_recipe[0].id, found_recipe[1].id]]) == user1[1]

        r = json.loads(user1[0].get(reverse(LIST_URL) + f'?{param2}').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [
                   found_recipe[0].id, found_recipe[1].id]]) == user1[2]


@pytest.mark.parametrize("found_recipe, param_type, result", [
    ({'viewedon': True}, 'viewedon', (1, 1)),
    ({'cookedon': True}, 'cookedon', (1, 1)),
    # created dates are not filtered by user
    ({'createdon': True}, 'createdon', (2, 12)),
    # updated dates are not filtered by user
    ({'createdon': True}, 'updatedon', (2, 12)),
], indirect=['found_recipe'])
def test_search_date(found_recipe, recipes, param_type, result, u1_s1, u2_s1, space_1):
    # force updated_at to equal created_at datetime
    with scope(space=space_1):
        for recipe in Recipe.objects.all():
            Recipe.objects.filter(id=recipe.id).update(
                updated_at=recipe.created_at)

    date = (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")
    param1 = f"?{param_type}={date}"
    param2 = f"?{param_type}=-{date}"
    r = json.loads(u1_s1.get(reverse(LIST_URL) + f'{param1}').content)
    assert r['count'] == result[0]
    assert found_recipe[0].id in [x['id'] for x in r['results']]

    r = json.loads(u1_s1.get(reverse(LIST_URL) + f'{param2}').content)
    assert r['count'] == result[1]
    assert found_recipe[1].id in [x['id'] for x in r['results']]

    # test today's date returns for lte and gte searches
    r = json.loads(u2_s1.get(reverse(LIST_URL) + f'{param1}').content)
    assert r['count'] == result[0]
    assert found_recipe[2].id in [x['id'] for x in r['results']]

    r = json.loads(u2_s1.get(reverse(LIST_URL) + f'{param2}').content)
    assert r['count'] == result[1]
    assert found_recipe[2].id in [x['id'] for x in r['results']]


@pytest.mark.parametrize("found_recipe, param_type", [
    ({'rating': True}, 'rating'),
    ({'timescooked': True}, 'timescooked'),
], indirect=['found_recipe'])
def test_search_count(found_recipe, recipes, param_type, u1_s1, u2_s1, space_1):
    param1 = f'?{param_type}=3'
    param2 = f'?{param_type}=-3'
    param3 = f'?{param_type}=0'

    r = json.loads(u1_s1.get(reverse(LIST_URL) + param1).content)
    assert r['count'] == 1
    assert found_recipe[0].id in [x['id'] for x in r['results']]

    r = json.loads(u1_s1.get(reverse(LIST_URL) + param2).content)
    assert r['count'] == 1
    assert found_recipe[1].id in [x['id'] for x in r['results']]

    # test search for not rated/cooked
    r = json.loads(u1_s1.get(reverse(LIST_URL) + param3).content)
    assert r['count'] == 11
    assert (found_recipe[0].id or found_recipe[1].id) not in [
        x['id'] for x in r['results']]

    # test matched returns for lte and gte searches
    r = json.loads(u2_s1.get(reverse(LIST_URL) + param1).content)
    assert r['count'] == 1
    assert found_recipe[2].id in [x['id'] for x in r['results']]

    r = json.loads(u2_s1.get(reverse(LIST_URL) + param2).content)
    assert r['count'] == 1
    assert found_recipe[2].id in [x['id'] for x in r['results']]
