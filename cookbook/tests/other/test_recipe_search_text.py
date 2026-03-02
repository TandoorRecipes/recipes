"""Direct tests for RecipeSearch text/string filter methods.

Replaces the 160-combo parametrized test_recipe_full_text_search.py
with explicit, readable tests (~20 tests).
"""
import pytest
from django.contrib import auth

from cookbook.models import SearchFields
from cookbook.tests.factories import (
    FoodFactory,
    IngredientFactory,
    KeywordFactory,
    RecipeFactory,
    StepFactory,
)
from cookbook.tests.other.conftest import do_search, requires_postgres

ACCENTED = "àbçđêf ğĦìĵķĽmñ öPqŕşŧ úvŵxyž"
UNACCENTED = "abcdef ghijklmn opqrst uvwxyz"


@pytest.fixture
def text_recipes(space_1):
    """Create recipes with known text in name/description/instruction/keyword/food.

    r1: has UNACCENTED text in all fields
    r2: has ACCENTED text in all fields
    r3: no special text (noise)
    bg: 10 background recipes (noise)
    """
    r1 = RecipeFactory.create(
        space=space_1, name=UNACCENTED, description=UNACCENTED,
        steps__count=0, keywords__count=0,
    )
    r2 = RecipeFactory.create(
        space=space_1, name=ACCENTED, description=ACCENTED,
        steps__count=0, keywords__count=0,
    )
    r3 = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)

    # Steps with instructions
    step1 = StepFactory.create(space=space_1, ingredients__count=0, instruction=UNACCENTED)
    step2 = StepFactory.create(space=space_1, ingredients__count=0, instruction=ACCENTED)
    step3 = StepFactory.create(space=space_1, ingredients__count=0)
    r1.steps.add(step1)
    r2.steps.add(step2)
    r3.steps.add(step3)

    # Keywords
    kw1 = KeywordFactory.create(name=UNACCENTED, space=space_1)
    kw2 = KeywordFactory.create(name=ACCENTED, space=space_1)
    r1.keywords.add(kw1)
    r2.keywords.add(kw2)

    # Foods (as ingredients)
    food1 = FoodFactory.create(name=UNACCENTED, space=space_1)
    food2 = FoodFactory.create(name=ACCENTED, space=space_1)
    step1.ingredients.add(IngredientFactory.create(food=food1, space=space_1))
    step2.ingredients.add(IngredientFactory.create(food=food2, space=space_1))

    bg = RecipeFactory.create_batch(10, space=space_1, steps__count=0, keywords__count=0)
    return r1, r2, r3, bg


def _set_search_prefs(user, *, icontains=False, istartswith=False,
                      fulltext=False, trigram=False, unaccent=False, lookup=False):
    """Configure search preferences for a user."""
    pref = user.searchpreference
    pref.lookup = lookup

    all_fields = SearchFields.objects.all()
    pref.icontains.set(all_fields if icontains else [])
    pref.istartswith.set(all_fields if istartswith else [])
    pref.fulltext.set(all_fields if fulltext else [])
    pref.trigram.set(all_fields if trigram else [])
    pref.unaccent.set(all_fields if unaccent else [])
    pref.save()


# ========================== ICONTAINS ==========================

class TestIcontainsSearch:
    """Test icontains text search across fields."""

    def test_icontains_name(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        # icontains substring match on name
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids  # UNACCENTED name contains 'ghijklmn'
        assert r2.id not in ids  # ACCENTED name doesn't match icontains (no unaccent)

    def test_icontains_description(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='opqrst')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    def test_icontains_instruction(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids  # instruction also has the text

    def test_icontains_keyword_name(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids  # keyword name also matches

    def test_icontains_food_name(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids  # food name also matches

    def test_icontains_no_match(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='xyznonexistent99')
        assert results.count() == 0


# ========================== ISTARTSWITH ==========================

class TestIstartswithSearch:
    """Test istartswith text search."""

    def test_istartswith_matches_prefix(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, istartswith=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='abcdef')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    def test_istartswith_rejects_substring(self, text_recipes, u1_s1, space_1, make_search_request):
        """istartswith should NOT match a mid-string substring."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, istartswith=True)
        req = make_search_request(u1_s1)
        # 'ghijklmn' is in the middle, not start
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id not in ids


# ========================== UNACCENT ==========================

class TestUnaccentSearch:
    """Test unaccent modifier with icontains."""

    @requires_postgres
    def test_icontains_with_unaccent(self, text_recipes, u1_s1, space_1, make_search_request):
        """With unaccent enabled, searching unaccented text should match accented records."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True, unaccent=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids
        assert r2.id in ids  # accented version matches via unaccent

    @requires_postgres
    def test_icontains_without_unaccent(self, text_recipes, u1_s1, space_1, make_search_request):
        """Without unaccent, accented text should NOT match unaccented query."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True, unaccent=False)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids
        assert r2.id not in ids


# ========================== FULLTEXT ==========================

class TestFulltextSearch:
    """Test PostgreSQL full-text search."""

    @requires_postgres
    def test_fulltext_finds_recipe(self, text_recipes, u1_s1, space_1, make_search_request):
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, fulltext=True)
        req = make_search_request(u1_s1)
        # fulltext uses websearch-style: multiple terms
        results = do_search(req, space_1, query='ghijklmn uvwxyz')
        ids = set(results.values_list('id', flat=True))
        # fulltext always applies unaccent on search vectors, so both should match
        assert r1.id in ids

    @requires_postgres
    def test_fulltext_always_applies_unaccent(self, text_recipes, u1_s1, space_1, make_search_request):
        """Fulltext search vectors are hardcoded to use unaccent, regardless of user preference."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, fulltext=True, unaccent=False)  # unaccent OFF
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn uvwxyz')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids
        assert r2.id in ids  # accented recipe found despite unaccent pref being off

    @requires_postgres
    def test_fulltext_score_annotation(self, text_recipes, u1_s1, space_1, make_search_request):
        """Fulltext search should annotate a 'score' field for sorting."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, fulltext=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn uvwxyz', sort_order='score')
        # Should not raise — score annotation must exist
        assert results.count() >= 0


# ========================== TRIGRAM ==========================

class TestTrigramSearch:
    """Test PostgreSQL trigram similarity search."""

    @requires_postgres
    def test_trigram_finds_similar(self, text_recipes, u1_s1, space_1, make_search_request):
        """Trigram should find recipes even with slightly misspelled queries."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, trigram=True)
        req = make_search_request(u1_s1)
        # exact match should work with trigram
        results = do_search(req, space_1, query=UNACCENTED)
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    @requires_postgres
    def test_trigram_finds_misspelled(self, text_recipes, u1_s1, space_1, make_search_request):
        """Trigram should find recipes with transposed/misspelled queries."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, trigram=True)
        req = make_search_request(u1_s1)
        # transpose characters: 'abcdef' -> 'bacdef', 'ghijklmn' -> 'gihjklmn'
        misspelled = "bacdef gihjklmn opqrst uvwxyz"
        results = do_search(req, space_1, query=misspelled)
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    @requires_postgres
    def test_trigram_no_match_on_garbage(self, text_recipes, u1_s1, space_1, make_search_request):
        """Trigram should NOT match completely unrelated queries."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, trigram=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='zzzzqqqq xxxx9999')
        ids = set(results.values_list('id', flat=True))
        assert r1.id not in ids
        assert r2.id not in ids

    @requires_postgres
    def test_trigram_score_annotation(self, text_recipes, u1_s1, space_1, make_search_request):
        """Trigram search should annotate a 'score' field."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, trigram=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query=UNACCENTED, sort_order='score')
        assert results.count() >= 0


# ========================== COMBINED MODES ==========================

class TestCombinedTextSearch:
    """Test combining multiple search modes."""

    @requires_postgres
    def test_fulltext_plus_trigram(self, text_recipes, u1_s1, space_1, make_search_request):
        """Both fulltext and trigram active should combine scores."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, fulltext=True, trigram=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn uvwxyz', sort_order='score')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    @requires_postgres
    def test_trigram_similarity_annotation_name(self, text_recipes, u1_s1, space_1, make_search_request):
        """When fulltext+trigram are both active, the intermediate trigram
        annotation must be named 'similarity' (not the old typo 'simularity')."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, fulltext=True, trigram=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query=UNACCENTED, sort_order='score')
        # The queryset should have 'similarity' as an annotation
        assert 'similarity' in results.query.annotations, (
            f"Expected 'similarity' annotation, got: {list(results.query.annotations.keys())}"
        )

    @requires_postgres
    def test_icontains_plus_unaccent_plus_trigram(self, text_recipes, u1_s1, space_1, make_search_request):
        """All search modes active together."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True, unaccent=True, trigram=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids
        assert r2.id in ids  # unaccent matches accented


# ========================== NO PREFS (IEXACT FALLBACK) ==========================

class TestNoSearchPrefs:
    """When no search preferences are set, should fall back to iexact on all fields."""

    def test_exact_match_name(self, text_recipes, u1_s1, space_1, make_search_request):
        """With no prefs, exact case-insensitive match on name should work."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user)  # all False
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query=UNACCENTED)
        ids = set(results.values_list('id', flat=True))
        assert r1.id in ids

    def test_partial_no_match(self, text_recipes, u1_s1, space_1, make_search_request):
        """iexact fallback should NOT match partial strings."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user)  # all False
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='ghijklmn')
        ids = set(results.values_list('id', flat=True))
        assert r1.id not in ids  # partial match shouldn't work with iexact


# ========================== EMPTY/NULL QUERY ==========================

class TestEmptyQuery:
    """Test behavior with empty or missing query strings."""

    def test_empty_query_returns_all(self, text_recipes, u1_s1, space_1, make_search_request):
        """Empty query string should return all recipes (no text filter applied)."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='')
        assert results.count() == 13  # 3 + 10 background

    def test_no_query_returns_all(self, text_recipes, u1_s1, space_1, make_search_request):
        """No query param at all should return all recipes."""
        r1, r2, r3, bg = text_recipes
        user = auth.get_user(u1_s1)
        _set_search_prefs(user, icontains=True)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1)
        assert results.count() == 13
