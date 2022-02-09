import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.models import Food, Recipe
from cookbook.tests.factories import FoodFactory, RecipeBookEntryFactory, RecipeFactory

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
LIST_URL = 'api:recipe-list'


@pytest.fixture
def accent():
    return "àèìòù"


@pytest.fixture
def unaccent():
    return "aeiou"


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def found_recipe(request, space_1, accent, unaccent):
    recipe1 = RecipeFactory.create(space=space_1)
    recipe2 = RecipeFactory.create(space=space_1)
    recipe3 = RecipeFactory.create(space=space_1)
    related = request.param.get('related', None)
    # name = request.getfixturevalue(request.param.get('name', "unaccent"))

    if related == 'food':
        obj1 = Food.objects.filter(ingredient__step__recipe=recipe.id).first()
        obj2 = Food.objects.filter(ingredient__step__recipe=recipe.id).last()
        obj1.name = unaccent
        obj1.save()
        obj2.name = accent
        obj2.save()
    elif related == 'keyword':
        obj1 = recipe.keywords.first()
        obj2 = recipe.keywords.last()
        obj1.name = unaccent
        obj1.save()
        obj2.name = accent
        obj2.save()
    elif related == 'book':
        obj1 = RecipeBookEntryFactory.create(recipe=recipe)

    return (recipe1, recipe2, recipe3, obj1, obj2)


@pytest.mark.parametrize("found_recipe, param_type", [
    ({'related': 'food'}, 'foods'),
    ({'related': 'keyword'}, 'keywords'),
    ({'related': 'book'}, 'books'),
], indirect=['found_recipe'])
@pytest.mark.parametrize('operator', ['_or', '_and', ])
def test_search_lists(found_recipe, param_type, operator, recipes, u1_s1, space_1):
    with scope(space=space_1):
        assert 1 == 2
        pass
    assert u1_s1.get(reverse(LIST_URL) + f'?parm={share.uuid}')
