import itertools
import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.models import Food, Recipe, SearchFields
from cookbook.tests.factories import (FoodFactory, IngredientFactory, KeywordFactory,
                                      RecipeBookEntryFactory, RecipeFactory, UnitFactory)

# TODO recipe name/description/instructions/keyword/book/food test search with icontains, istarts with/ full text(?? probably when word changes based on conjugation??), trigram, unaccent


# TODO test combining any/all of the above
# TODO search rating as user or when another user rated
# TODO search last cooked
# TODO changing lsat_viewed ## to return on search
# TODO test sort_by
# TODO test sort_by new X number of recipes are new within last Y days
# TODO test loading custom filter
# TODO test loading custom filter with overrided params
# TODO makenow with above filters
# TODO test search for number of times cooked (self vs others)
# TODO test including children
LIST_URL = 'api:recipe-list'


@pytest.fixture
def accent():
    return "àèìòù"


@pytest.fixture
def unaccent():
    return "aeiou"


@pytest.fixture
def user1(request, space_1, u1_s1):
    user = auth.get_user(u1_s1)
    params = {x[0]: x[1] for x in request.param}
    if params.get('fuzzy_lookups', False):
        user.searchpreference.lookup = True
    if params.get('fuzzy_search', False):
        user.searchpreference.trigram.set(SearchFields.objects.all())
    if params.get('unaccent', False):
        user.searchpreference.unaccent.set(SearchFields.objects.all())
        result = 2
    else:
        result = 1

    user.userpreference.save()
    return (u1_s1, result, params)


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def found_recipe(request, space_1, accent, unaccent):
    recipe1 = RecipeFactory.create(space=space_1)
    recipe2 = RecipeFactory.create(space=space_1)
    recipe3 = RecipeFactory.create(space=space_1)

    if request.param.get('food', None):
        obj1 = FoodFactory.create(name=unaccent, space=space_1)
        obj2 = FoodFactory.create(name=accent, space=space_1)

        recipe1.steps.first().ingredients.add(IngredientFactory.create(food=obj1))
        recipe2.steps.first().ingredients.add(IngredientFactory.create(food=obj2))
        recipe3.steps.first().ingredients.add(IngredientFactory.create(food=obj1), IngredientFactory.create(food=obj2))
    if request.param.get('keyword', None):
        obj1 = KeywordFactory.create(name=unaccent, space=space_1)
        obj2 = KeywordFactory.create(name=accent, space=space_1)
        recipe1.keywords.add(obj1)
        recipe2.keywords.add(obj2)
        recipe3.keywords.add(obj1, obj2)
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
        recipe3.steps.first().ingredients.add(IngredientFactory.create(unit=obj1), IngredientFactory.create(unit=obj2))

    return (recipe1, recipe2, recipe3, obj1, obj2)


@pytest.mark.parametrize("found_recipe, param_type", [
    ({'food': True}, 'foods'),
    ({'keyword': True}, 'keywords'),
    ({'book': True}, 'books'),
], indirect=['found_recipe'])
@pytest.mark.parametrize('operator', [('_or', 3, 0), ('_and', 1, 2), ])
def test_search_or_and_not(found_recipe, param_type, operator, recipes, user1, space_1):
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

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1}&{param2}').content)
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

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1_not}&{param2_not}').content)
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

        r = json.loads(u1_s1.get(reverse(LIST_URL) + f'?{param1}&{param2}').content)
        assert r['count'] == 3
        assert found_recipe[2].id in [x['id'] for x in r['results']]


@pytest.mark.parametrize("user1",  itertools.product(
    [('fuzzy_lookups', True), ('fuzzy_lookups', False)],
    [('fuzzy_search', True), ('fuzzy_search', False)],
    [('unaccent', True), ('unaccent', False)]
), indirect=['user1'])
@pytest.mark.parametrize("found_recipe, param_type", [
    ({'unit': True}, 'unit'),
    ({'keyword': True}, 'keyword'),
    ({'food': True}, 'food'),
], indirect=['found_recipe'])
def test_fuzzy_lookup(found_recipe, recipes, param_type, user1,  space_1):
    with scope(space=space_1):
        list_url = f'api:{param_type}-list'
        param1 = "query=aeiou"
        param2 = "query=aoieu"

        # test fuzzy off - also need search settings on/off
        r = json.loads(user1[0].get(reverse(list_url) + f'?{param1}&limit=2').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [found_recipe[3].id, found_recipe[4].id]]) == user1[1]

        r = json.loads(user1[0].get(reverse(list_url) + f'?{param2}').content)
        assert len([x['id'] for x in r['results'] if x['id'] in [found_recipe[3].id, found_recipe[4].id]]) == user1[1]
