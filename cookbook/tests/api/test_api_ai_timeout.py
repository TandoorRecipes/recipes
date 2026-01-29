import json
from unittest.mock import patch

import pytest
from django.urls import reverse
from litellm.exceptions import Timeout

from cookbook.models import AiProvider, PropertyType
from cookbook.tests.factories import FoodFactory, RecipeFactory, StepFactory


@pytest.fixture
def ai_provider(space_1):
    return AiProvider.objects.create(
        name='test_provider',
        space=space_1,
        api_key='test-key',
        model_name='test-model',
    )


@pytest.fixture
def food_1(space_1):
    return FoodFactory.create(space=space_1)


@pytest.fixture
def recipe_1(space_1):
    return RecipeFactory.create(space=space_1)


@pytest.fixture
def ai_space(space_1, ai_provider):
    space_1.ai_provider = ai_provider
    space_1.save()
    return space_1


TIMEOUT_SIDE_EFFECT = Timeout(
    message='Request timed out after 120 seconds',
    model='test-model',
    llm_provider='test',
)


@pytest.mark.django_db
class TestFoodAiPropertiesTimeout:

    @patch('cookbook.views.api.completion')
    def test_timeout_returns_408(self, mock_completion, ai_space, food_1, a1_s1):
        mock_completion.side_effect = TIMEOUT_SIDE_EFFECT
        PropertyType.objects.create(name='test_prop', space=ai_space)

        url = reverse('api:food-aiproperties', kwargs={'pk': food_1.pk})
        response = a1_s1.post(
            f'{url}?provider={ai_space.ai_provider.pk}',
            json.dumps({'name': food_1.name}),
            content_type='application/json',
        )

        assert response.status_code == 408
        data = json.loads(response.content)
        assert data['error'] is True
        assert 'timed out' in data['msg'].lower()


@pytest.mark.django_db
class TestRecipeAiPropertiesTimeout:

    @patch('cookbook.views.api.completion')
    def test_timeout_returns_408(self, mock_completion, ai_space, recipe_1, a1_s1):
        mock_completion.side_effect = TIMEOUT_SIDE_EFFECT
        PropertyType.objects.create(name='test_prop', space=ai_space)

        url = reverse('api:recipe-aiproperties', kwargs={'pk': recipe_1.pk})
        response = a1_s1.post(
            f'{url}?provider={ai_space.ai_provider.pk}',
            json.dumps({'name': recipe_1.name}),
            content_type='application/json',
        )

        assert response.status_code == 408
        data = json.loads(response.content)
        assert data['error'] is True
        assert 'timed out' in data['msg'].lower()


@pytest.mark.django_db
class TestAiStepSortTimeout:

    @patch('cookbook.views.api.completion')
    def test_timeout_returns_408(self, mock_completion, ai_space, recipe_1, a1_s1):
        mock_completion.side_effect = TIMEOUT_SIDE_EFFECT
        step1 = StepFactory.create(space=ai_space, ingredients__count=0)
        step2 = StepFactory.create(space=ai_space, ingredients__count=0)
        recipe_1.steps.add(step1, step2)

        url = reverse('api_ai_step_sort')
        response = a1_s1.post(
            f'{url}?provider={ai_space.ai_provider.pk}',
            json.dumps({'name': recipe_1.name}),
            content_type='application/json',
        )

        assert response.status_code == 408
        data = json.loads(response.content)
        assert data['error'] is True
        assert 'timed out' in data['msg'].lower()


@pytest.mark.django_db
class TestAiImportTimeout:

    @patch('cookbook.views.api.completion')
    def test_timeout_returns_408(self, mock_completion, ai_space, a1_s1):
        mock_completion.side_effect = TIMEOUT_SIDE_EFFECT

        url = reverse('api_ai_import')
        response = a1_s1.post(
            url,
            {
                'ai_provider_id': ai_space.ai_provider.pk,
                'text': 'Some recipe text to import',
                'recipe_id': '',
            },
        )

        assert response.status_code == 408
        data = json.loads(response.content)
        assert data['error'] is True
        assert 'timed out' in data['msg'].lower()
