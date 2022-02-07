import json

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.models import Food, FoodInheritField, Ingredient, ShoppingList, ShoppingListEntry
from cookbook.tests.factories import (FoodFactory, IngredientFactory, ShoppingListEntryFactory,
                                      SupermarketCategoryFactory)

# TODO food/keyword/book test or, and, or_not, and_not search
# TODO recipe name/description/instructions/keyword/book/food test search with icontains, istarts with/ full text(?? probably when word changes based on conjugation??), trigram, unaccent

# TODO fuzzy lookup on units, keywords, food when not configured in main search settings

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
