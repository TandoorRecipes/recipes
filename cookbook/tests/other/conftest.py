"""Shared fixtures for recipe search tests.

Provides SearchScenario dataclass and composable builder fixtures
for testing RecipeSearch directly (without HTTP layer).
"""
from dataclasses import dataclass, field
from datetime import timedelta

import pytest
from django.conf import settings
from django.contrib import auth
from django.utils import timezone
from django.utils.timezone import localtime
from django_scopes import scope

from cookbook.helper.recipe_search import RecipeSearch
from cookbook.models import Food, Recipe, UserSpace
from cookbook.tests.factories import (
    CookLogFactory,
    FoodFactory,
    IngredientFactory,
    KeywordFactory,
    RecipeBookEntryFactory,
    RecipeFactory,
    StepFactory,
    UnitFactory,
    ViewLogFactory,
)

_postgres = settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'
requires_postgres = pytest.mark.skipif(not _postgres, reason='requires PostgreSQL')

if Food.node_order_by:
    _node_pos = 'sorted-child'
else:
    _node_pos = 'last-child'


@dataclass
class SearchScenario:
    """Container for search test data.

    recipes: [r1, r2, r3] — the three recipes under test
    obj1, obj2: filter objects (Food, Keyword, Book, Unit, etc.)
    background: noise recipes that should NOT match filters
    dates: optional dict of reference dates used in fixture setup
    """
    recipes: list
    obj1: object = None
    obj2: object = None
    background: list = field(default_factory=list)
    dates: dict = field(default_factory=dict)

    @property
    def r1(self):
        return self.recipes[0]

    @property
    def r2(self):
        return self.recipes[1]

    @property
    def r3(self):
        return self.recipes[2]


def _make_recipe_with_step(space):
    """Helper to create a recipe with one empty step for ingredient attachment."""
    r = RecipeFactory.create(space=space, steps__count=0, keywords__count=0)
    step = StepFactory.create(space=space, ingredients__count=0)
    r.steps.add(step)
    return r


@pytest.fixture
def search_recipes(space_1):
    """Create 3 test recipes + 10 background recipes with no random ingredients."""
    r1, r2, r3 = [_make_recipe_with_step(space_1) for _ in range(3)]
    bg = RecipeFactory.create_batch(10, space=space_1, steps__count=0, keywords__count=0)
    return SearchScenario(recipes=[r1, r2, r3], background=bg)


@pytest.fixture
def with_foods(search_recipes, space_1):
    """Attach foods: r1 has food1, r2 has food2, r3 has both."""
    food1 = FoodFactory.create(space=space_1)
    food2 = FoodFactory.create(space=space_1)
    search_recipes.r1.steps.first().ingredients.add(IngredientFactory.create(food=food1, space=space_1))
    search_recipes.r2.steps.first().ingredients.add(IngredientFactory.create(food=food2, space=space_1))
    search_recipes.r3.steps.first().ingredients.add(
        IngredientFactory.create(food=food1, space=space_1),
        IngredientFactory.create(food=food2, space=space_1),
    )
    search_recipes.obj1 = food1
    search_recipes.obj2 = food2
    return search_recipes


@pytest.fixture
def with_keywords(search_recipes, space_1):
    """Attach keywords: r1 has kw1, r2 has kw2, r3 has both."""
    kw1 = KeywordFactory.create(space=space_1)
    kw2 = KeywordFactory.create(space=space_1)
    search_recipes.r1.keywords.add(kw1)
    search_recipes.r2.keywords.add(kw2)
    search_recipes.r3.keywords.add(kw1, kw2)
    search_recipes.obj1 = kw1
    search_recipes.obj2 = kw2
    return search_recipes


@pytest.fixture
def with_books(search_recipes, space_1):
    """Attach books: r1 in book1, r2 in book2, r3 in both."""
    book1 = RecipeBookEntryFactory.create(recipe=search_recipes.r1).book
    book2 = RecipeBookEntryFactory.create(recipe=search_recipes.r2).book
    RecipeBookEntryFactory.create(recipe=search_recipes.r3, book=book1)
    RecipeBookEntryFactory.create(recipe=search_recipes.r3, book=book2)
    search_recipes.obj1 = book1
    search_recipes.obj2 = book2
    return search_recipes


@pytest.fixture
def with_units(search_recipes, space_1):
    """Attach units: r1 has unit1, r2 has unit2, r3 has both."""
    unit1 = UnitFactory.create(space=space_1)
    unit2 = UnitFactory.create(space=space_1)
    search_recipes.r1.steps.first().ingredients.add(IngredientFactory.create(unit=unit1, space=space_1))
    search_recipes.r2.steps.first().ingredients.add(IngredientFactory.create(unit=unit2, space=space_1))
    search_recipes.r3.steps.first().ingredients.add(
        IngredientFactory.create(unit=unit1, space=space_1),
        IngredientFactory.create(unit=unit2, space=space_1),
    )
    search_recipes.obj1 = unit1
    search_recipes.obj2 = unit2
    return search_recipes


@pytest.fixture
def with_ratings(search_recipes, space_1, u1_s1, u2_s1):
    """Add ratings: r1=5 (user1), r2=1 (user1), r3=3 (user2)."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    CookLogFactory.create(recipe=search_recipes.r1, created_by=user1, rating=5.0, space=space_1)
    CookLogFactory.create(recipe=search_recipes.r2, created_by=user1, rating=1.0, space=space_1)
    CookLogFactory.create(recipe=search_recipes.r3, created_by=user2, rating=3.0, space=space_1)
    return search_recipes


@pytest.fixture
def with_ratings_null(search_recipes, space_1, u1_s1):
    """Null rating handling: r1=5.0, r2=None, r3=0."""
    from cookbook.models import CookLog
    user1 = auth.get_user(u1_s1)
    CookLogFactory.create(recipe=search_recipes.r1, created_by=user1, rating=5.0, space=space_1)
    CookLog.objects.create(recipe=search_recipes.r2, created_by=user1, rating=None, space=space_1)
    CookLog.objects.create(recipe=search_recipes.r3, created_by=user1, rating=0, space=space_1)
    return search_recipes


@pytest.fixture
def with_timescooked(search_recipes, space_1, u1_s1, u2_s1):
    """Cook counts: r1=5 (user1), r2=1 (user1), r3=3 (user2)."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    CookLogFactory.create_batch(5, recipe=search_recipes.r1, created_by=user1, space=space_1)
    CookLogFactory.create(recipe=search_recipes.r2, created_by=user1, space=space_1)
    CookLogFactory.create_batch(3, recipe=search_recipes.r3, created_by=user2, space=space_1)
    return search_recipes


@pytest.fixture
def with_viewdates(search_recipes, space_1, u1_s1, u2_s1):
    """View dates: r1=3 days ago (user1), r2=30 days ago (user1), r3=15 days ago (user2)."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    now = timezone.now()
    days_3 = now - timedelta(days=3)
    days_15 = now - timedelta(days=15)
    days_30 = now - timedelta(days=30)
    ViewLogFactory.create(recipe=search_recipes.r1, created_by=user1, created_at=days_3, space=space_1)
    ViewLogFactory.create(recipe=search_recipes.r2, created_by=user1, created_at=days_30, space=space_1)
    ViewLogFactory.create(recipe=search_recipes.r3, created_by=user2, created_at=days_15, space=space_1)
    search_recipes.dates = {'days_3': days_3, 'days_15': days_15, 'days_30': days_30}
    return search_recipes


@pytest.fixture
def with_cookdates(search_recipes, space_1, u1_s1, u2_s1):
    """Cook dates: r1=3 days ago (user1), r2=30 days ago (user1), r3=15 days ago (user2)."""
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    now = timezone.now()
    days_3 = now - timedelta(days=3)
    days_15 = now - timedelta(days=15)
    days_30 = now - timedelta(days=30)
    CookLogFactory.create(recipe=search_recipes.r1, created_by=user1, created_at=days_3, space=space_1)
    CookLogFactory.create(recipe=search_recipes.r2, created_by=user1, created_at=days_30, space=space_1)
    CookLogFactory.create(recipe=search_recipes.r3, created_by=user2, created_at=days_15, space=space_1)
    search_recipes.dates = {'days_3': days_3, 'days_15': days_15, 'days_30': days_30}
    return search_recipes


@pytest.fixture
def with_createdates(space_1):
    """Recipes with specific creation dates.

    Background recipes use factory defaults (random dates 2000-2020).
    """
    now = localtime()
    days_3 = now - timedelta(days=3)
    days_15 = now - timedelta(days=15)
    days_30 = now - timedelta(days=30)
    r1 = RecipeFactory.create(space=space_1, created_at=days_3, steps__count=0, keywords__count=0)
    r2 = RecipeFactory.create(space=space_1, created_at=days_30, steps__count=0, keywords__count=0)
    r3 = RecipeFactory.create(space=space_1, created_at=days_15, steps__count=0, keywords__count=0)
    bg = RecipeFactory.create_batch(10, space=space_1, steps__count=0, keywords__count=0)
    return SearchScenario(
        recipes=[r1, r2, r3], background=bg,
        dates={'days_3': days_3, 'days_15': days_15, 'days_30': days_30},
    )


def do_search(request, space, queryset=None, **params):
    """Execute a RecipeSearch and return the queryset result.

    The queryset is created inside a django-scopes context.
    The returned queryset can be evaluated outside the scope
    because ScopedManager only checks at initial access.
    """
    search = RecipeSearch(request, **params)
    with scope(space=space):
        if queryset is None:
            queryset = Recipe.objects.all()
        return search.get_queryset(queryset)


@pytest.fixture
def make_search_request(space_1):
    """Create a mock request object for RecipeSearch."""
    def _make(user_client):
        user = auth.get_user(user_client)
        user_space = UserSpace.objects.filter(user=user, space=space_1).first()
        return type('MockRequest', (), {'space': space_1, 'user': user, 'user_space': user_space})()
    return _make
