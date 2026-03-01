"""
Performance test for IngredientViewSet.get_used_in_recipes N+1 query fix.

Run with: conda run -n tandoor pytest cookbook/tests/other/test_ingredient_editor_performance.py -v -s -n 0
"""
import json
import time

import pytest
from django.contrib import auth
from django.db import connection, reset_queries
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Food, Ingredient, Recipe, Step, Unit


@pytest.fixture
def performance_test_data(space_1, u1_s1):
    """Create test data: 1 food used in 50 recipes."""
    num_recipes = 50
    user = auth.get_user(u1_s1)

    with scopes_disabled():
        # Create the food and unit we'll filter by
        food = Food.objects.create(name='test-salt-perf', space=space_1)
        unit = Unit.objects.create(name='teaspoon', space=space_1)

        # Create N recipes, each with a step containing an ingredient using our food
        for i in range(num_recipes):
            recipe = Recipe.objects.create(
                name=f'Test Recipe {i}',
                created_by=user,
                space=space_1,
                internal=True,
            )
            step = Step.objects.create(
                name=f'Step {i}',
                instruction=f'Test instruction {i}',
                space=space_1,
            )
            ingredient = Ingredient.objects.create(
                food=food,
                unit=unit,
                amount=1,
                space=space_1,
            )
            step.ingredients.add(ingredient)
            recipe.steps.add(step)

        yield {
            'space': space_1,
            'user': user,
            'food': food,
            'unit': unit,
            'num_recipes': num_recipes,
        }

        # Cleanup
        Recipe.objects.filter(name__startswith='Test Recipe', space=space_1).delete()
        Step.objects.filter(name__startswith='Step', space=space_1).delete()
        Ingredient.objects.filter(food=food, space=space_1).delete()
        food.delete()
        unit.delete()


def test_ingredient_api_query_count(performance_test_data, u1_s1):
    """
    Measure query count and time for ingredient API with used_in_recipes.

    This test measures the current performance. After applying the prefetch fix,
    re-run to compare results.

    Expected results:
    - BEFORE fix: ~100+ queries for 50 ingredients (2 per ingredient for step_set, recipe_set)
    - AFTER fix: ~5-10 queries (constant, regardless of ingredient count)
    """
    data = performance_test_data
    food = data['food']
    num_recipes = data['num_recipes']

    # Reset query log
    reset_queries()

    # Measure time and queries
    with CaptureQueriesContext(connection) as context:
        start_time = time.perf_counter()

        response = u1_s1.get(
            reverse('api:ingredient-list'),
            {'food': food.id, 'page_size': 100, 'simple': 'true'},
        )

        end_time = time.perf_counter()

    elapsed_ms = (end_time - start_time) * 1000
    query_count = len(context.captured_queries)

    # Print results for comparison
    print(f"\n{'='*60}")
    print(f"INGREDIENT API PERFORMANCE TEST")
    print(f"{'='*60}")
    print(f"Test data: {num_recipes} recipes with '{food.name}' ingredient")
    print(f"Response status: {response.status_code}")
    print(f"{'='*60}")
    print(f"RESULTS:")
    print(f"  Query count: {query_count}")
    print(f"  Time: {elapsed_ms:.2f} ms")
    print(f"{'='*60}")

    # Verify response is successful
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.content[:500]}"

    # Print response info
    response_data = json.loads(response.content)
    result_count = response_data.get('count', len(response_data.get('results', [])))
    print(f"Ingredients returned: {result_count}")
    print(f"{'='*60}")

    # Print query breakdown - check for table names in various formats
    query_types = {}
    step_ingredient_queries = 0
    step_recipe_queries = 0

    for q in context.captured_queries:
        sql = q['sql'].lower()
        # Check for N+1 pattern queries
        if 'cookbook_step_ingredients' in sql:
            step_ingredient_queries += 1
            query_types['step_ingredients (M2M)'] = query_types.get('step_ingredients (M2M)', 0) + 1
        elif 'cookbook_recipe_steps' in sql:
            step_recipe_queries += 1
            query_types['recipe_steps (M2M)'] = query_types.get('recipe_steps (M2M)', 0) + 1
        elif 'cookbook_ingredient' in sql and 'cookbook_step' not in sql:
            query_types['ingredient'] = query_types.get('ingredient', 0) + 1
        elif 'cookbook_step' in sql and 'cookbook_recipe' not in sql and 'cookbook_ingredient' not in sql:
            query_types['step'] = query_types.get('step', 0) + 1
        elif 'cookbook_recipe' in sql and 'cookbook_step' not in sql:
            query_types['recipe'] = query_types.get('recipe', 0) + 1
        elif 'cookbook_food' in sql:
            query_types['food'] = query_types.get('food', 0) + 1
        elif 'cookbook_unit' in sql:
            query_types['unit'] = query_types.get('unit', 0) + 1
        elif 'auth_user' in sql:
            query_types['user'] = query_types.get('user', 0) + 1
        elif 'cookbook_space' in sql:
            query_types['space'] = query_types.get('space', 0) + 1
        else:
            query_types['other'] = query_types.get('other', 0) + 1

    print(f"Query breakdown by table:")
    for table, count in sorted(query_types.items(), key=lambda x: -x[1]):
        print(f"  {table}: {count}")

    # Flag potential N+1 issues
    if step_ingredient_queries > 5 or step_recipe_queries > 5:
        print(f"\n⚠️  POTENTIAL N+1 DETECTED:")
        print(f"   step_ingredients queries: {step_ingredient_queries}")
        print(f"   recipe_steps queries: {step_recipe_queries}")
    else:
        print(f"\n✓ No obvious N+1 pattern detected")

    print(f"{'='*60}\n")

    assert query_count < 100, f"Expected fewer than 100 queries, got {query_count} (possible N+1)"
