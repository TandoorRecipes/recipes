import uuid
from unittest.mock import patch

import pytest
from django.contrib import auth
from django_scopes import scope
from mock.mock import Mock

from cookbook.connectors.connector import Connector, ShoppingListEntryDTO
from cookbook.connectors.connector_manager import ActionType, ConnectorManager, run_connectors
from cookbook.helper.shopping_helper import RecipeShoppingEditor
from cookbook.models import Food, Ingredient, Recipe, ShoppingListEntry, Step, Unit


@pytest.fixture()
def obj_1(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(created_by=auth.get_user(u1_s1), food=Food.objects.get_or_create(name='test 1', space=space_1)[0], space=space_1)
    return e


@pytest.fixture()
def recipe_with_ingredients(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    recipe = Recipe.objects.create(
        name='connector test recipe', servings=2, created_by=user, space=space_1, internal=True,
    )
    step = Step.objects.create(name='step 1', instruction='do stuff', space=space_1)
    recipe.steps.add(step)
    for i in range(3):
        food = Food.objects.create(name=f'food_{uuid.uuid4().hex[:8]}', space=space_1)
        unit = Unit.objects.create(name=f'unit_{uuid.uuid4().hex[:8]}', space=space_1)
        step.ingredients.add(
            Ingredient.objects.create(amount=1, food=food, unit=unit, space=space_1)
        )
    return recipe


@pytest.mark.asyncio
async def test_run_connectors(space_1, u1_s1, obj_1) -> None:
    expected_dto = ShoppingListEntryDTO.try_create_from_entry(obj_1)
    connector_mock = Mock(spec=Connector)

    await run_connectors([connector_mock], obj_1, ActionType.DELETED)

    assert not connector_mock.on_shopping_list_entry_updated.called
    assert not connector_mock.on_shopping_list_entry_created.called
    connector_mock.on_shopping_list_entry_deleted.assert_called_once_with(expected_dto)


@patch.object(ConnectorManager, 'add_work')
def test_add_ingredients_triggers_connector(mock_add_work, space_1, u1_s1, recipe_with_ingredients):
    """RecipeShoppingEditor.create() must call ConnectorManager.add_work after bulk_create."""
    user = auth.get_user(u1_s1)
    with scope(space=space_1):
        editor = RecipeShoppingEditor(user, space_1)
        editor.create(recipe=recipe_with_ingredients, servings=2)

    mock_add_work.assert_called_once()
    call_args = mock_add_work.call_args
    assert call_args[0][0] == ActionType.CREATED
    created_entries = call_args[0][1:]
    assert len(created_entries) == 3
    assert all(isinstance(e, ShoppingListEntry) for e in created_entries)
