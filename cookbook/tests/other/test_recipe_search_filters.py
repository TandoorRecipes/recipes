"""Direct tests for RecipeSearch filter methods.

Tests RecipeSearch by calling it directly (no HTTP layer).
Uses SearchScenario fixtures from conftest.py.
"""
from datetime import timedelta

from django.contrib import auth
from django.utils import timezone
from django_scopes import scope, scopes_disabled

from cookbook.models import Food, Keyword, Recipe
from cookbook.tests.factories import (
    CookLogFactory,
    FoodFactory,
    IngredientFactory,
    RecipeBookEntryFactory,
    RecipeFactory,
    ViewLogFactory,
)
from cookbook.tests.other.conftest import _make_recipe_with_step, do_search

# ========================== FOOD FILTERS ==========================


class TestFoodFilters:
    """OR/AND/NOT combinations for food-based filtering."""

    def test_food_or_single(self, with_foods, u1_s1, space_1, make_search_request):
        """Single food OR filter returns recipes containing that food."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r3.id in ids
        assert s.r2.id not in ids
        assert len(ids) == 2

    def test_food_or_multiple(self, with_foods, u1_s1, space_1, make_search_request):
        """Multiple foods OR returns recipes containing any of the foods."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert {s.r1.id, s.r2.id, s.r3.id} == ids

    def test_food_and_both(self, with_foods, u1_s1, space_1, make_search_request):
        """AND filter returns only recipes with ALL specified foods."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_and=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r3.id}

    def test_food_or_not(self, with_foods, u1_s1, space_1, make_search_request):
        """OR NOT excludes recipes containing any of the specified foods."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or_not=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r3.id not in ids
        assert s.r2.id in ids
        assert len(ids) == 11

    def test_food_and_not(self, with_foods, u1_s1, space_1, make_search_request):
        """AND NOT excludes recipes containing ALL specified foods."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_and_not=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id not in ids
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert len(ids) == 12

    def test_food_or_not_both(self, with_foods, u1_s1, space_1, make_search_request):
        """OR NOT with both foods excludes recipes containing either food."""
        s = with_foods
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or_not=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r2.id not in ids
        assert s.r3.id not in ids
        assert len(ids) == 10


# ========================== KEYWORD FILTERS ==========================


class TestKeywordFilters:
    """OR/AND/NOT combinations for keyword-based filtering."""

    def test_keyword_or_single(self, with_keywords, u1_s1, space_1, make_search_request):
        s = with_keywords
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id, s.r3.id}

    def test_keyword_or_multiple(self, with_keywords, u1_s1, space_1, make_search_request):
        s = with_keywords
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert {s.r1.id, s.r2.id, s.r3.id} == ids

    def test_keyword_and_both(self, with_keywords, u1_s1, space_1, make_search_request):
        s = with_keywords
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_and=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r3.id}

    def test_keyword_or_not(self, with_keywords, u1_s1, space_1, make_search_request):
        s = with_keywords
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or_not=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r3.id not in ids
        assert len(ids) == 11

    def test_keyword_and_not(self, with_keywords, u1_s1, space_1, make_search_request):
        s = with_keywords
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_and_not=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id not in ids
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert len(ids) == 12


# ========================== BOOK FILTERS ==========================


class TestBookFilters:
    """OR/AND/NOT combinations for book-based filtering."""

    def test_book_or_single(self, with_books, u1_s1, space_1, make_search_request):
        s = with_books
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_or=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id, s.r3.id}

    def test_book_or_multiple(self, with_books, u1_s1, space_1, make_search_request):
        s = with_books
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_or=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert {s.r1.id, s.r2.id, s.r3.id} == ids

    def test_book_and_both(self, with_books, u1_s1, space_1, make_search_request):
        s = with_books
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_and=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r3.id}

    def test_book_or_not(self, with_books, u1_s1, space_1, make_search_request):
        s = with_books
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_or_not=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r3.id not in ids
        assert len(ids) == 11

    def test_book_and_not(self, with_books, u1_s1, space_1, make_search_request):
        s = with_books
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_and_not=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id not in ids
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert len(ids) == 12


# ========================== UNIT FILTERS ==========================


class TestUnitFilters:

    def test_unit_single(self, with_units, u1_s1, space_1, make_search_request):
        s = with_units
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, units=[s.obj1.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id, s.r3.id}

    def test_unit_other(self, with_units, u1_s1, space_1, make_search_request):
        s = with_units
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, units=[s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r2.id, s.r3.id}

    def test_unit_both(self, with_units, u1_s1, space_1, make_search_request):
        s = with_units
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, units=[s.obj1.id, s.obj2.id])
        ids = set(results.values_list('id', flat=True))
        assert {s.r1.id, s.r2.id, s.r3.id} == ids


# ========================== DATE FILTERS ==========================


class TestViewedOnFilter:

    def test_viewedon_gte(self, with_viewdates, u1_s1, space_1, make_search_request):
        s = with_viewdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, viewedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_viewedon_lte(self, with_viewdates, u1_s1, space_1, make_search_request):
        s = with_viewdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, viewedon_lte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids
        assert s.r1.id not in ids

    def test_viewedon_user_scoped(self, with_viewdates, u2_s1, space_1, make_search_request):
        """viewedon is user-scoped: user2 only sees their own view logs."""
        s = with_viewdates
        req = make_search_request(u2_s1)
        # user2 viewed r3 at days_15; use days_30 as cutoff to ensure it matches
        cutoff = s.dates['days_30'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, viewedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id in ids
        # user2 has no view logs for r1/r2 so they should be excluded
        assert s.r1.id not in ids
        assert s.r2.id not in ids


class TestCookedOnFilter:

    def test_cookedon_gte(self, with_cookdates, u1_s1, space_1, make_search_request):
        s = with_cookdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, cookedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_cookedon_lte(self, with_cookdates, u1_s1, space_1, make_search_request):
        s = with_cookdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, cookedon_lte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids
        assert s.r1.id not in ids

    def test_cookedon_user_scoped(self, with_cookdates, u2_s1, space_1, make_search_request):
        """cookedon is user-scoped."""
        s = with_cookdates
        req = make_search_request(u2_s1)
        cutoff = s.dates['days_30'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, cookedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id in ids
        assert s.r1.id not in ids
        assert s.r2.id not in ids


class TestCreatedOnFilter:

    def test_createdon_gte(self, with_createdates, u1_s1, space_1, make_search_request):
        s = with_createdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, createdon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # 3 days ago
        assert s.r3.id in ids  # 15 days ago (boundary)
        assert s.r2.id not in ids  # 30 days ago

    def test_createdon_lte(self, with_createdates, u1_s1, space_1, make_search_request):
        s = with_createdates
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, createdon_lte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids  # 30 days ago
        assert s.r3.id in ids  # 15 days ago (boundary)
        assert s.r1.id not in ids  # 3 days ago

    def test_createdon_exact(self, with_createdates, u1_s1, space_1, make_search_request):
        s = with_createdates
        req = make_search_request(u1_s1)
        exact_date = s.dates['days_3'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, createdon=exact_date)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids

    def test_createdon_not_user_scoped(self, with_createdates, u2_s1, space_1, make_search_request):
        """createdon is NOT user-scoped: all users see the same results."""
        s = with_createdates
        req = make_search_request(u2_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, createdon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r3.id in ids


class TestUpdatedOnFilter:

    def test_updatedon_gte(self, with_createdates, u1_s1, space_1, make_search_request):
        s = with_createdates
        # Force updated_at = created_at for predictable test
        with scope(space=space_1):
            for recipe in Recipe.objects.all():
                Recipe.objects.filter(id=recipe.id).update(updated_at=recipe.created_at)
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, updatedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_updatedon_lte(self, with_createdates, u1_s1, space_1, make_search_request):
        s = with_createdates
        with scope(space=space_1):
            for recipe in Recipe.objects.all():
                Recipe.objects.filter(id=recipe.id).update(updated_at=recipe.created_at)
        req = make_search_request(u1_s1)
        cutoff = s.dates['days_15'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, updatedon_lte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids
        assert s.r1.id not in ids


# ========================== RANGE QUERIES (gte + lte) ==========================


class TestRangeQueries:
    """Verify gte + lte can be applied simultaneously on all filter methods."""

    def test_createdon_range(self, with_createdates, u1_s1, space_1, make_search_request):
        """createdon_gte + createdon_lte: only _lte applies due to elif, so gte is dropped.
        We prove the defect by checking that r1 (3 days ago, above lte) is excluded by lte
        but r2 (30 days ago, below gte) is wrongly INCLUDED because gte was never applied."""
        s = with_createdates
        req = make_search_request(u1_s1)
        # Window: 15 days ago to 3 days ago — should include r1 and r3
        gte = s.dates['days_15'].strftime('%Y-%m-%d')
        lte = s.dates['days_3'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, createdon_gte=gte, createdon_lte=lte)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # 3 days ago — in window
        assert s.r3.id in ids  # 15 days ago — on boundary
        assert s.r2.id not in ids  # 30 days ago — BELOW gte, should be excluded

    def test_updatedon_range(self, with_createdates, u1_s1, space_1, make_search_request):
        """updatedon_gte + updatedon_lte simultaneously."""
        s = with_createdates
        with scope(space=space_1):
            for recipe in Recipe.objects.all():
                Recipe.objects.filter(id=recipe.id).update(updated_at=recipe.created_at)
        req = make_search_request(u1_s1)
        gte = s.dates['days_15'].strftime('%Y-%m-%d')
        lte = s.dates['days_3'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, updatedon_gte=gte, updatedon_lte=lte)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # 3 days ago
        assert s.r3.id in ids  # 15 days ago — boundary
        assert s.r2.id not in ids  # 30 days ago — below gte

    def test_cookedon_range(self, with_cookdates, u1_s1, space_1, make_search_request):
        """cookedon_gte + cookedon_lte simultaneously.
        Window: 15-3 days ago. r1 (3d) in, r2 (30d) out, r3 (user2) out."""
        s = with_cookdates
        req = make_search_request(u1_s1)
        gte = s.dates['days_15'].strftime('%Y-%m-%d')
        lte = s.dates['days_3'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, cookedon_gte=gte, cookedon_lte=lte)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # cooked 3 days ago — in window
        assert s.r2.id not in ids  # cooked 30 days ago — below gte
        assert s.r3.id not in ids  # cooked by user2, not user1

    def test_viewedon_range(self, with_viewdates, u1_s1, space_1, make_search_request):
        """viewedon_gte + viewedon_lte simultaneously.
        Window: 15-3 days ago. r1 (3d) in, r2 (30d) out, r3 (user2) out."""
        s = with_viewdates
        req = make_search_request(u1_s1)
        gte = s.dates['days_15'].strftime('%Y-%m-%d')
        lte = s.dates['days_3'].strftime('%Y-%m-%d')
        results = do_search(req, space_1, viewedon_gte=gte, viewedon_lte=lte)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # viewed 3 days ago — in window
        assert s.r2.id not in ids  # viewed 30 days ago — below gte
        assert s.r3.id not in ids  # viewed by user2, not user1

    def test_rating_range(self, with_ratings, u1_s1, space_1, make_search_request):
        """rating_gte + rating_lte: both must apply.
        r1=5 (above lte=4), r2=1 (below gte=2). Only r3 is in range but
        r3 is rated by user2 not user1, so no match for user1.
        With elif bug, lte is skipped so gte alone returns r1(5) which is wrong."""
        s = with_ratings
        req = make_search_request(u1_s1)
        # Window: 2-4. r1=5 (out, above lte), r2=1 (out, below gte)
        results = do_search(req, space_1, rating_gte='2', rating_lte='4')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids  # rating 5 — above lte
        assert s.r2.id not in ids  # rating 1 — below gte

    def test_timescooked_range(self, with_timescooked, u1_s1, space_1, make_search_request):
        """timescooked_gte + timescooked_lte: both must apply.
        r1=5 (above lte=3), r2=1 (in range). With elif bug, gte is skipped
        so lte alone excludes r1 but doesn't require gte."""
        s = with_timescooked
        req = make_search_request(u1_s1)
        # Window: 2-3. r1=5 (out), r2=1 (out, below gte)
        results = do_search(req, space_1, timescooked_gte='2', timescooked_lte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id not in ids  # cooked 1 time — below gte
        assert s.r1.id not in ids  # cooked 5 times — above lte


# ========================== RATING FILTERS ==========================


class TestRatingFilter:

    def test_rating_exact(self, with_ratings, u1_s1, space_1, make_search_request):
        s = with_ratings
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating='5')
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id}

    def test_rating_gte(self, with_ratings, u1_s1, space_1, make_search_request):
        s = with_ratings
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_rating_lte(self, with_ratings, u1_s1, space_1, make_search_request):
        s = with_ratings
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating_lte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids
        assert s.r1.id not in ids

    def test_rating_zero_returns_unrated(self, with_ratings, u1_s1, space_1, make_search_request):
        """Rating=0 should return recipes the user has not rated."""
        s = with_ratings
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating='0')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r2.id not in ids
        assert s.r3.id in ids
        assert len(ids) == 11

    def test_rating_user_scoped(self, with_ratings, u2_s1, space_1, make_search_request):
        """Ratings are user-scoped."""
        s = with_ratings
        req = make_search_request(u2_s1)
        results = do_search(req, space_1, rating_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id in ids

    def test_rating_null_counted_as_unrated(self, with_ratings_null, u1_s1, space_1, make_search_request):
        """Regression test for #1939: CookLog with rating=None treated as unrated."""
        s = with_ratings_null
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating='0')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r2.id in ids
        assert s.r3.id in ids

    def test_rated_excludes_null(self, with_ratings_null, u1_s1, space_1, make_search_request):
        """Null ratings should not affect average calculation."""
        s = with_ratings_null
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating_gte='5')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_rating_avg_ignores_other_users(self, search_recipes, u1_s1, u2_s1, space_1, make_search_request):
        """Rating annotation must only average the current user's ratings.

        With Avg(Case(When(...), default=0)), other users' CookLog rows
        contribute 0 to the average, diluting the result.
        e.g. user1 rates 5, user2 rates 1 → Avg(Case) = (5+0)/2 = 2 for user1.
        Expected: user1's rating should be 5.
        """
        s = search_recipes
        user1 = auth.get_user(u1_s1)
        user2 = auth.get_user(u2_s1)
        CookLogFactory.create(recipe=s.r1, created_by=user1, rating=5.0, space=space_1)
        CookLogFactory.create(recipe=s.r1, created_by=user2, rating=1.0, space=space_1)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating_gte='5')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids  # user1's rating is 5, should match gte=5


# ========================== TIMES COOKED FILTERS ==========================


class TestTimesCookedFilter:

    def test_timescooked_exact(self, with_timescooked, u1_s1, space_1, make_search_request):
        s = with_timescooked
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, timescooked='5')
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id}

    def test_timescooked_gte(self, with_timescooked, u1_s1, space_1, make_search_request):
        s = with_timescooked
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, timescooked_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_timescooked_lte(self, with_timescooked, u1_s1, space_1, make_search_request):
        s = with_timescooked
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, timescooked_lte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r2.id in ids
        assert s.r1.id not in ids

    def test_timescooked_zero_returns_uncooked(self, with_timescooked, u1_s1, space_1, make_search_request):
        s = with_timescooked
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, timescooked='0')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids
        assert s.r2.id not in ids
        assert s.r3.id in ids

    def test_timescooked_user_scoped(self, with_timescooked, u2_s1, space_1, make_search_request):
        """Times cooked is user-scoped."""
        s = with_timescooked
        req = make_search_request(u2_s1)
        results = do_search(req, space_1, timescooked_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r3.id in ids


# ========================== INTERNAL FILTER ==========================


class TestInternalFilter:

    def test_internal_true(self, search_recipes, u1_s1, space_1, make_search_request):
        s = search_recipes
        s.r1.internal = True
        s.r1.save()
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, internal='true')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_internal_not_set(self, search_recipes, u1_s1, space_1, make_search_request):
        """No internal filter returns all recipes."""
        req = make_search_request(u1_s1)
        results = do_search(req, space_1)
        assert results.count() == 13


# ========================== CREATED BY FILTER ==========================


class TestCreatedByFilter:

    def test_createdby(self, search_recipes, u1_s1, space_1, make_search_request):
        s = search_recipes
        user = auth.get_user(u1_s1)
        s.r1.created_by = user
        s.r1.save()
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, createdby=user.id)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids

    def test_createdby_no_match(self, search_recipes, u1_s1, space_1, make_search_request):
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, createdby=99999)
        assert results.count() == 0


# ========================== NEW RECIPES ==========================


class TestNewRecipes:

    def test_new_recipes_sort(self, space_1, u1_s1, make_search_request):
        """new=true sorts recently created recipes to the top."""
        with scopes_disabled():
            recent = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            old = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            Recipe.objects.filter(id=recent.id).update(created_at=timezone.now())
            Recipe.objects.filter(id=old.id).update(created_at=timezone.now() - timedelta(days=30))

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, new='true')
        ids = list(results.values_list('id', flat=True))
        # recent recipe should sort before old one
        assert ids.index(recent.id) < ids.index(old.id)


# ========================== NUM RECENT ==========================


class TestNumRecent:

    def test_num_recent(self, search_recipes, u1_s1, space_1, make_search_request):
        """num_recent floats recently viewed recipes to the top."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        ViewLogFactory.create(recipe=s.r3, created_by=user, space=space_1)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, num_recent='1')
        ids = list(results.values_list('id', flat=True))
        assert ids[0] == s.r3.id


# ========================== INCLUDE CHILDREN ==========================


class TestIncludeChildren:

    def test_keyword_include_children(self, search_recipes, u1_s1, space_1, make_search_request):
        """With include_children=True, filtering by parent keyword also finds child keywords."""
        s = search_recipes
        with scopes_disabled():
            parent_kw = Keyword.add_root(name='test_parent_kw', space=space_1)
            child_kw = parent_kw.add_child(name='test_child_kw', space=space_1)
            s.r1.keywords.add(child_kw)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[parent_kw.id], include_children='true')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids

    def test_keyword_exclude_children(self, search_recipes, u1_s1, space_1, make_search_request):
        """With include_children=False, parent keyword does NOT match child."""
        s = search_recipes
        with scopes_disabled():
            parent_kw = Keyword.add_root(name='test_parent_kw2', space=space_1)
            child_kw = parent_kw.add_child(name='test_child_kw2', space=space_1)
            s.r1.keywords.add(child_kw)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[parent_kw.id], include_children='false')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids

    def test_food_include_children(self, search_recipes, u1_s1, space_1, make_search_request):
        """With include_children=True, filtering by parent food also finds child foods."""
        s = search_recipes
        with scopes_disabled():
            parent_food = Food.add_root(name='test_parent_food', space=space_1)
            child_food = parent_food.add_child(name='test_child_food', space=space_1)
            s.r1.steps.first().ingredients.add(IngredientFactory.create(food=child_food, space=space_1))

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or=[parent_food.id], include_children='true')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids

    def test_food_exclude_children(self, search_recipes, u1_s1, space_1, make_search_request):
        """With include_children=False, parent food does NOT match child."""
        s = search_recipes
        with scopes_disabled():
            parent_food = Food.add_root(name='test_parent_food2', space=space_1)
            child_food = parent_food.add_child(name='test_child_food2', space=space_1)
            s.r1.steps.first().ingredients.add(IngredientFactory.create(food=child_food, space=space_1))

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_or=[parent_food.id], include_children='false')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id not in ids


# ========================== COMBINED FILTERS ==========================


class TestCombinedFilters:

    def test_keyword_and_food(self, search_recipes, u1_s1, space_1, make_search_request):
        """Combining keyword + food filters narrows results correctly."""
        s = search_recipes
        with scopes_disabled():
            kw = Keyword.add_root(name='combo_kw', space=space_1)
            food = FoodFactory.create(space=space_1)
            s.r1.keywords.add(kw)
            s.r2.keywords.add(kw)
            s.r1.steps.first().ingredients.add(IngredientFactory.create(food=food, space=space_1))

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[kw.id], foods_or=[food.id])
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id}

    def test_keyword_and_rating(self, search_recipes, u1_s1, space_1, make_search_request):
        """Combining keyword + rating filters."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        with scopes_disabled():
            kw = Keyword.add_root(name='combo_kw2', space=space_1)
            s.r1.keywords.add(kw)
            s.r2.keywords.add(kw)
            CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, space=space_1)
            CookLogFactory.create(recipe=s.r2, created_by=user, rating=1.0, space=space_1)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_or=[kw.id], rating_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert ids == {s.r1.id}


# ========================== COOKLOG ANNOTATION SAFETY ==========================


class TestCookLogAnnotationSafety:
    """Verify CookLog annotations from different methods don't conflict."""

    def test_rating_and_timescooked_and_cookedon(self, search_recipes, u1_s1, space_1, make_search_request):
        """Three CookLog-based filters active simultaneously."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        now = timezone.now()
        for _ in range(5):
            CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, created_at=now - timedelta(days=1), space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, rating=1.0, created_at=now - timedelta(days=60), space=space_1)

        req = make_search_request(u1_s1)
        cutoff = (now - timedelta(days=30)).strftime('%Y-%m-%d')
        results = do_search(req, space_1, rating_gte='3', timescooked_gte='3', cookedon_gte=cutoff)
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_sort_by_rating_with_timescooked_filter(self, search_recipes, u1_s1, space_1, make_search_request):
        """Sort by rating while filtering by timescooked."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        for _ in range(3):
            CookLogFactory.create(recipe=s.r1, created_by=user, rating=4.0, space=space_1)
        for _ in range(5):
            CookLogFactory.create(recipe=s.r2, created_by=user, rating=2.0, space=space_1)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, timescooked_gte='3', sort_order='-rating')
        ids = list(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert ids.index(s.r1.id) < ids.index(s.r2.id)

    def test_text_search_with_rating_distinct(self, search_recipes, u1_s1, space_1, make_search_request):
        """Text search .distinct() must not break rating aggregation."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        # Give r1 a known name and a rating
        s.r1.name = 'UniqueAnnotationTest'
        s.r1.save()
        CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, rating=1.0, space=space_1)

        # Enable icontains search for this user
        from cookbook.models import SearchFields
        user.searchpreference.icontains.set(SearchFields.objects.all())
        user.searchpreference.save()

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, query='UniqueAnnotationTest', rating_gte='3')
        ids = set(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id not in ids

    def test_viewedon_filter_with_lastviewed_sort(self, search_recipes, u1_s1, space_1, make_search_request):
        """viewedon filter + lastviewed sort active simultaneously."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        now = timezone.now()
        ViewLogFactory.create(recipe=s.r1, created_by=user, created_at=now - timedelta(days=1), space=space_1)
        ViewLogFactory.create(recipe=s.r2, created_by=user, created_at=now - timedelta(days=10), space=space_1)
        ViewLogFactory.create(recipe=s.r3, created_by=user, created_at=now - timedelta(days=60), space=space_1)

        req = make_search_request(u1_s1)
        cutoff = (now - timedelta(days=30)).strftime('%Y-%m-%d')
        results = do_search(req, space_1, viewedon_gte=cutoff, sort_order='-lastviewed')
        ids = list(results.values_list('id', flat=True))
        # r1 (1 day ago) and r2 (10 days ago) pass the filter; r3 (60 days) doesn't
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert s.r3.id not in ids
        # r1 viewed more recently, should come first
        assert ids.index(s.r1.id) < ids.index(s.r2.id)

    def test_cookedon_sort_with_rating_filter(self, search_recipes, u1_s1, space_1, make_search_request):
        """Sort by lastcooked while filtering by rating."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        now = timezone.now()
        CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, created_at=now - timedelta(days=1), space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, rating=4.0, created_at=now - timedelta(days=30), space=space_1)
        CookLogFactory.create(recipe=s.r3, created_by=user, rating=1.0, created_at=now - timedelta(days=5), space=space_1)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, rating_gte='3', sort_order='-lastcooked')
        ids = list(results.values_list('id', flat=True))
        assert s.r1.id in ids
        assert s.r2.id in ids
        assert s.r3.id not in ids  # rating too low
        assert ids.index(s.r1.id) < ids.index(s.r2.id)


# ========================== CROSS-SPACE SAFETY ==========================


class TestCrossSpaceSafety:
    """Verify ScopedManager prevents cross-space leakage in AND-NOT subqueries."""

    def test_keyword_and_not_cross_space(self, space_1, space_2, u1_s1, make_search_request):
        """AND-NOT keyword queries must not return recipes from other spaces."""
        with scopes_disabled():
            kw = Keyword.add_root(name='crossspace_kw', space=space_1)
            r1_s1 = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            r1_s1.keywords.add(kw)
            r2_s1 = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            kw_s2 = Keyword.add_root(name='crossspace_kw', space=space_2)
            r1_s2 = RecipeFactory.create(space=space_2, steps__count=0, keywords__count=0)
            r1_s2.keywords.add(kw_s2)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, keywords_and_not=[kw.id])
        ids = set(results.values_list('id', flat=True))
        assert r1_s2.id not in ids  # space_2 recipe must not appear
        assert r1_s1.id not in ids  # has the keyword, should be excluded
        assert r2_s1.id in ids  # no keyword, should remain

    def test_food_and_not_cross_space(self, space_1, space_2, u1_s1, make_search_request):
        """Food AND-NOT must not return recipes from other spaces."""
        with scopes_disabled():
            food = FoodFactory.create(space=space_1)
            r1_s1 = _make_recipe_with_step(space_1)
            r1_s1.steps.first().ingredients.add(IngredientFactory.create(food=food, space=space_1))
            food_s2 = FoodFactory.create(space=space_2)
            r1_s2 = _make_recipe_with_step(space_2)
            r1_s2.steps.first().ingredients.add(IngredientFactory.create(food=food_s2, space=space_2))

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, foods_and_not=[food.id])
        ids = set(results.values_list('id', flat=True))
        assert r1_s2.id not in ids
        assert r1_s1.id not in ids

    def test_book_and_not_cross_space(self, space_1, space_2, u1_s1, make_search_request):
        """Book AND-NOT must not return recipes from other spaces."""
        with scopes_disabled():
            r1_s1 = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            book1 = RecipeBookEntryFactory.create(recipe=r1_s1).book
            r2_s1 = RecipeFactory.create(space=space_1, steps__count=0, keywords__count=0)
            r1_s2 = RecipeFactory.create(space=space_2, steps__count=0, keywords__count=0)

        req = make_search_request(u1_s1)
        results = do_search(req, space_1, books_and_not=[book1.id])
        ids = set(results.values_list('id', flat=True))
        assert r1_s2.id not in ids
        assert r1_s1.id not in ids
        assert r2_s1.id in ids


# ========================== SORT ORDERS ==========================


class TestSortOrders:

    def test_sort_name_asc(self, space_1, u1_s1, make_search_request):
        r_a = RecipeFactory.create(space=space_1, name='AAA Recipe', steps__count=0, keywords__count=0)
        r_z = RecipeFactory.create(space=space_1, name='ZZZ Recipe', steps__count=0, keywords__count=0)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='name')
        ids = list(results.values_list('id', flat=True))
        assert ids.index(r_a.id) < ids.index(r_z.id)

    def test_sort_name_desc(self, space_1, u1_s1, make_search_request):
        r_a = RecipeFactory.create(space=space_1, name='AAA Recipe', steps__count=0, keywords__count=0)
        r_z = RecipeFactory.create(space=space_1, name='ZZZ Recipe', steps__count=0, keywords__count=0)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='-name')
        ids = list(results.values_list('id', flat=True))
        assert ids.index(r_z.id) < ids.index(r_a.id)

    def test_sort_rating(self, search_recipes, u1_s1, space_1, make_search_request):
        s = search_recipes
        user = auth.get_user(u1_s1)
        CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, rating=1.0, space=space_1)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='-rating')
        ids = list(results.values_list('id', flat=True))
        assert ids.index(s.r1.id) < ids.index(s.r2.id)

    def test_sort_lastcooked(self, search_recipes, u1_s1, space_1, make_search_request):
        s = search_recipes
        user = auth.get_user(u1_s1)
        CookLogFactory.create(recipe=s.r1, created_by=user, created_at=timezone.now() - timedelta(days=1), space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, created_at=timezone.now() - timedelta(days=30), space=space_1)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='-lastcooked')
        ids = list(results.values_list('id', flat=True))
        assert ids.index(s.r1.id) < ids.index(s.r2.id)

    def test_sort_lastcooked_never_cooked_last(self, search_recipes, u1_s1, space_1, make_search_request):
        """Never-cooked recipes sort after cooked ones for both ASC and DESC."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        CookLogFactory.create(recipe=s.r1, created_by=user, created_at=timezone.now() - timedelta(days=1), space=space_1)
        # r2, r3, background: never cooked
        req = make_search_request(u1_s1)

        # DESC: most recently cooked first, never-cooked last
        results = do_search(req, space_1, sort_order='-lastcooked')
        ids = list(results.values_list('id', flat=True))
        assert ids[0] == s.r1.id

        # ASC: oldest-cooked first, never-cooked last
        results = do_search(req, space_1, sort_order='lastcooked')
        ids = list(results.values_list('id', flat=True))
        assert ids[0] == s.r1.id  # only cooked recipe → first

    def test_sort_lastviewed_never_viewed_last(self, search_recipes, u1_s1, space_1, make_search_request):
        """Never-viewed recipes sort after viewed ones for DESC."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        ViewLogFactory.create(recipe=s.r1, created_by=user, created_at=timezone.now() - timedelta(days=1), space=space_1)
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='-lastviewed')
        ids = list(results.values_list('id', flat=True))
        assert ids[0] == s.r1.id

    def test_sort_rating_unrated_last(self, search_recipes, u1_s1, space_1, make_search_request):
        """Unrated recipes sort after rated ones for DESC."""
        s = search_recipes
        user = auth.get_user(u1_s1)
        CookLogFactory.create(recipe=s.r1, created_by=user, rating=5.0, space=space_1)
        CookLogFactory.create(recipe=s.r2, created_by=user, rating=1.0, space=space_1)
        # r3, background: unrated
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='-rating')
        ids = list(results.values_list('id', flat=True))
        # Rated recipes should come before unrated
        assert ids.index(s.r1.id) < ids.index(s.r3.id)
        assert ids.index(s.r2.id) < ids.index(s.r3.id)

    def test_sort_random(self, search_recipes, u1_s1, space_1, make_search_request):
        """Random sort should return all recipes."""
        req = make_search_request(u1_s1)
        results = do_search(req, space_1, sort_order='random')
        assert results.count() == 13
