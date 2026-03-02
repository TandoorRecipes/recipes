"""Thin HTTP integration tests for RecipeSearch.

One test per major filter type to verify the API layer correctly
passes query params through to RecipeSearch. Detailed filter logic
is tested directly in test_recipe_search_filters.py.
"""
import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.models import Recipe, SearchFields
from cookbook.tests.factories import (
    CookLogFactory,
    FoodFactory,
    IngredientFactory,
    KeywordFactory,
    RecipeBookEntryFactory,
    RecipeFactory,
    UnitFactory,
)
from cookbook.tests.other.conftest import _make_recipe_with_step, requires_postgres

LIST_URL = 'api:recipe-list'


def _get_ids(client, params=''):
    """Helper: GET recipe list and return set of result IDs."""
    r = json.loads(client.get(reverse(LIST_URL) + f'?{params}').content)
    return {x['id'] for x in r['results']}, r['count']


@pytest.fixture
def setup_recipes(space_1):
    """Create 3 recipes with a step each + 5 background."""
    r1, r2, r3 = [_make_recipe_with_step(space_1) for _ in range(3)]
    bg = RecipeFactory.create_batch(5, space=space_1, steps__count=0, keywords__count=0)
    return r1, r2, r3, bg


class TestHTTPFoodFilter:
    def test_food_or_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        with scopes_disabled():
            food = FoodFactory.create(space=space_1)
            r1.steps.first().ingredients.add(IngredientFactory.create(food=food, space=space_1))
        ids, count = _get_ids(u1_s1, f'foods_or={food.id}')
        assert r1.id in ids
        assert count == 1


class TestHTTPKeywordFilter:
    def test_keyword_or_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        with scopes_disabled():
            kw = KeywordFactory.create(space=space_1)
            r1.keywords.add(kw)
        ids, count = _get_ids(u1_s1, f'keywords_or={kw.id}')
        assert r1.id in ids
        assert count == 1


class TestHTTPBookFilter:
    def test_book_or_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        with scopes_disabled():
            book = RecipeBookEntryFactory.create(recipe=r1).book
        ids, count = _get_ids(u1_s1, f'books_or={book.id}')
        assert r1.id in ids
        assert count == 1


class TestHTTPUnitFilter:
    def test_units_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        with scopes_disabled():
            unit = UnitFactory.create(space=space_1)
            r1.steps.first().ingredients.add(IngredientFactory.create(unit=unit, space=space_1))
        ids, count = _get_ids(u1_s1, f'units={unit.id}')
        assert r1.id in ids
        assert count == 1


class TestHTTPRatingFilter:
    def test_rating_gte_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        user = auth.get_user(u1_s1)
        CookLogFactory.create(recipe=r1, created_by=user, rating=5.0, space=space_1)
        ids, count = _get_ids(u1_s1, 'rating_gte=4')
        assert r1.id in ids
        assert r2.id not in ids


class TestHTTPTextSearch:
    def test_query_via_api(self, u1_s1, space_1):
        with scopes_disabled():
            r = RecipeFactory.create(space=space_1, name='UniqueFindableTestName123')
            user = auth.get_user(u1_s1)
            user.searchpreference.icontains.set(SearchFields.objects.all())
            user.searchpreference.save()
        ids, count = _get_ids(u1_s1, 'query=UniqueFindableTestName123')
        assert r.id in ids


class TestHTTPInternalFilter:
    def test_internal_filter_via_api(self, setup_recipes, u1_s1, space_1):
        r1, r2, r3, bg = setup_recipes
        with scope(space=space_1):
            Recipe.objects.filter(id=r1.id).update(internal=False)
        ids, count = _get_ids(u1_s1, 'internal=true')
        assert r1.id not in ids


# ========================== FUZZY LOOKUPS (list endpoints) ==========================

UNACCENTED = "abcdef ghijklmn opqrst uvwxyz"
ACCENTED = "àbçđêf ğĦìĵķĽmñ öPqŕşŧ úvŵxyž"


def _get_list_ids(client, list_url, params=''):
    """Helper: GET a model list endpoint and return set of result IDs."""
    r = json.loads(client.get(reverse(list_url) + f'?{params}').content)
    return {x['id'] for x in r['results']}


def _set_fuzzy_prefs(user, *, lookup=False, trigram=False, unaccent=False):
    pref = user.searchpreference
    pref.lookup = lookup
    if trigram:
        pref.trigram.set(SearchFields.objects.all())
    else:
        pref.trigram.set([])
    if unaccent:
        pref.unaccent.set(SearchFields.objects.all())
    else:
        pref.unaccent.set([])
    pref.save()


class TestFuzzyLookupFood:
    """Test fuzzy/trigram query on food list endpoint."""

    @requires_postgres
    def test_food_trigram_finds_match(self, u1_s1, space_1):
        with scopes_disabled():
            food = FoodFactory.create(name=UNACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True)
        ids = _get_list_ids(u1_s1, 'api:food-list', f'query={UNACCENTED}')
        assert food.id in ids

    @requires_postgres
    def test_food_trigram_with_unaccent(self, u1_s1, space_1):
        with scopes_disabled():
            food = FoodFactory.create(name=ACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True, unaccent=True)
        ids = _get_list_ids(u1_s1, 'api:food-list', f'query={UNACCENTED}')
        assert food.id in ids


class TestFuzzyLookupKeyword:
    """Test fuzzy/trigram query on keyword list endpoint."""

    @requires_postgres
    def test_keyword_trigram_finds_match(self, u1_s1, space_1):
        with scopes_disabled():
            kw = KeywordFactory.create(name=UNACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True)
        ids = _get_list_ids(u1_s1, 'api:keyword-list', f'query={UNACCENTED}')
        assert kw.id in ids

    @requires_postgres
    def test_keyword_trigram_with_unaccent(self, u1_s1, space_1):
        with scopes_disabled():
            kw = KeywordFactory.create(name=ACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True, unaccent=True)
        ids = _get_list_ids(u1_s1, 'api:keyword-list', f'query={UNACCENTED}')
        assert kw.id in ids


class TestFuzzyLookupUnit:
    """Test fuzzy/trigram query on unit list endpoint."""

    @requires_postgres
    def test_unit_trigram_finds_match(self, u1_s1, space_1):
        with scopes_disabled():
            unit = UnitFactory.create(name=UNACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True)
        ids = _get_list_ids(u1_s1, 'api:unit-list', f'query={UNACCENTED}')
        assert unit.id in ids

    @requires_postgres
    def test_unit_trigram_with_unaccent(self, u1_s1, space_1):
        with scopes_disabled():
            unit = UnitFactory.create(name=ACCENTED, space=space_1)
            user = auth.get_user(u1_s1)
            _set_fuzzy_prefs(user, trigram=True, unaccent=True)
        ids = _get_list_ids(u1_s1, 'api:unit-list', f'query={UNACCENTED}')
        assert unit.id in ids
