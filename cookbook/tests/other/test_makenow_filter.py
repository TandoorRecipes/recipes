import pytest
from django.contrib import auth
from django_scopes import scope

from cookbook.helper.recipe_search import RecipeSearch
from cookbook.models import Food, Recipe
from cookbook.tests.factories import FoodFactory, RecipeFactory

# TODO returns recipes with all ingredients via child substitute
# TODO returns recipes with all ingredients via sibling substitute

if (Food.node_order_by):
    node_location = 'sorted-child'
else:
    node_location = 'last-child'


@pytest.fixture
def recipes(space_1):
    return RecipeFactory.create_batch(10, space=space_1)


@pytest.fixture
def makenow_recipe(request, space_1):
    onhand_user = auth.get_user(request.getfixturevalue(
        request.param.get('onhand_users', 'u1_s1')))

    recipe = RecipeFactory.create(space=space_1)
    for food in Food.objects.filter(ingredient__step__recipe=recipe.id):
        food.onhand_users.add(onhand_user)
    return recipe


@pytest.fixture
def user1(u1_s1, u2_s1, space_1):
    user1 = auth.get_user(u1_s1)
    user2 = auth.get_user(u2_s1)
    user1.userpreference.shopping_share.add(user2)
    user2.userpreference.shopping_share.add(user1)
    return user1


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'}),
], indirect=['makenow_recipe'])
def test_makenow_onhand(recipes, makenow_recipe, user1, space_1):
    request = type('', (object,), {'space': space_1, 'user': user1})()
    search = RecipeSearch(request, makenow='true')
    with scope(space=space_1):
        search = search.get_queryset(Recipe.objects.all())
        assert search.count() == 1
        assert search.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'}),
], indirect=['makenow_recipe'])
def test_makenow_ignoreshopping(recipes, makenow_recipe, user1, space_1):
    request = type('', (object,), {'space': space_1, 'user': user1})()
    search = RecipeSearch(request, makenow='true')
    with scope(space=space_1):
        food = Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id).first()
        food.onhand_users.clear()
        assert search.get_queryset(Recipe.objects.all()).count() == 0
        food.ignore_shopping = True
        food.save()
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, ignore_shopping=True).count() == 1
        search = search.get_queryset(Recipe.objects.all())
        assert search.count() == 1
        assert search.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'}),
], indirect=['makenow_recipe'])
def test_makenow_substitute(recipes, makenow_recipe, user1, space_1):
    request = type('', (object,), {'space': space_1, 'user': user1})()
    search = RecipeSearch(request, makenow='true')
    with scope(space=space_1):
        food = Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        assert search.get_queryset(Recipe.objects.all()).count() == 0
        food.substitute.add(FoodFactory.create(
            space=space_1, onhand_users=[onhand_user]))
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, substitute__isnull=False).count() == 1

        search = search.get_queryset(Recipe.objects.all())
        assert search.count() == 1
        assert search.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'}),
], indirect=['makenow_recipe'])
def test_makenow_child_substitute(recipes, makenow_recipe, user1, space_1):
    request = type('', (object,), {'space': space_1, 'user': user1})()
    search = RecipeSearch(request, makenow='true')
    with scope(space=space_1):
        food = Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        food.substitute_children = True
        food.save()
        assert search.get_queryset(Recipe.objects.all()).count() == 0
        new_food = FoodFactory.create(
            space=space_1, onhand_users=[onhand_user])
        new_food.move(food, node_location)
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, numchild__gt=0).count() == 1
        search = search.get_queryset(Recipe.objects.all())
        assert search.count() == 1
        assert search.first().id == makenow_recipe.id


@pytest.mark.parametrize("makenow_recipe", [
    ({'onhand_users': 'u1_s1'}), ({'onhand_users': 'u2_s1'}),
], indirect=['makenow_recipe'])
def test_makenow_sibling_substitute(recipes, makenow_recipe, user1, space_1):
    request = type('', (object,), {'space': space_1, 'user': user1})()
    search = RecipeSearch(request, makenow='true')
    with scope(space=space_1):
        food = Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id).first()
        onhand_user = food.onhand_users.first()
        food.onhand_users.clear()
        food.substitute_siblings = True
        food.save()
        assert search.get_queryset(Recipe.objects.all()).count() == 0
        new_parent = FoodFactory.create(space=space_1)
        new_sibling = FoodFactory.create(
            space=space_1, onhand_users=[onhand_user])
        new_sibling.move(new_parent, node_location)
        food.move(new_parent, node_location)
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, onhand_users__isnull=False).count() == 9
        assert Food.objects.filter(
            ingredient__step__recipe=makenow_recipe.id, depth=2).count() == 1
        search = search.get_queryset(Recipe.objects.all())
        assert search.count() == 1
        assert search.first().id == makenow_recipe.id
