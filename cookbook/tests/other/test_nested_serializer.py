import json

import pytest
from django.urls import reverse
from django_scopes import scopes_disabled
from pytest_factoryboy import LazyFixture, register

from cookbook.tests.factories import FoodFactory, KeywordFactory, UnitFactory

RECIPE_URL = 'api:recipe-detail'
FOOD_URL = 'api:food-detail'

register(FoodFactory, 'food_1', space=LazyFixture('space_1'))
register(FoodFactory, 'food_2', space=LazyFixture('space_1'))
register(KeywordFactory, 'keyword_1', space=LazyFixture('space_1'))
register(KeywordFactory, 'keyword_2', space=LazyFixture('space_1'))
register(UnitFactory, 'unit_1', space=LazyFixture('space_1'))


@pytest.mark.parametrize("arg", ['dict', 'pk'])
def test_unnested_serializer__single(arg, recipe_1_s1, food_1, u1_s1):
    if arg == 'dict':
        recipe = {'id': recipe_1_s1.id, 'name': recipe_1_s1.name, }
    elif arg == 'pk':
        recipe = recipe_1_s1.id
    r = u1_s1.patch(reverse(FOOD_URL, args={food_1.id}), {'name': food_1.name, 'recipe': recipe}, content_type='application/json')
    assert r.status_code == 200
    assert json.loads(r.content)['recipe']['id'] == recipe_1_s1.id


def test_nested_serializer_many(recipe_1_s1, food_1, food_2, keyword_1, keyword_2, unit_1, u1_s1):
    with scopes_disabled():
        assert food_1 not in [i.food for i in recipe_1_s1.steps.all()[0].ingredients.all()]
        assert food_2 not in [i.food for i in recipe_1_s1.steps.all()[0].ingredients.all()]
        assert keyword_1 not in recipe_1_s1.keywords.all()
        assert keyword_2 not in recipe_1_s1.keywords.all()
    r = u1_s1.patch(reverse(RECIPE_URL, args={recipe_1_s1.id}), {
        'name':
        recipe_1_s1.name,
        'steps': [{
            'ingredients': [{
                'amount': 1,
                'unit': {
                    'id': unit_1.id,
                    'name': unit_1.name
                },
                'food': {
                    'id': food_1.id,
                    'name': food_1.name
                }
            }, {
                'amount': 1,
                'unit': unit_1.id,
                'food': food_2.id
            }]
        }],
        'keywords': [{
            'id': keyword_1.id,
            'name': keyword_1.name
        }, keyword_2.id]
    },
                    content_type='application/json')
    assert r.status_code == 200
    with scopes_disabled():
        # recipe_1_s1 = Recipe.objects.get(id=recipe_1_s1.id)
        assert food_1 in [i.food for i in recipe_1_s1.steps.all()[0].ingredients.all()]
        assert food_2 in [i.food for i in recipe_1_s1.steps.all()[0].ingredients.all()]
        assert keyword_1 in recipe_1_s1.keywords.all()
        assert keyword_2 in recipe_1_s1.keywords.all()
