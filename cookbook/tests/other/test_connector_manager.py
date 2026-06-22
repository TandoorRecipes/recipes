import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bring_api.exceptions import BringAuthException
from django.contrib import auth
from django_scopes import scope
from mock.mock import Mock

from cookbook.connectors.bring import Bring, _format_shopping_list_entry
from cookbook.connectors.connector import Connector, ShoppingListEntryDTO, UserDTO
from cookbook.connectors.connector_manager import ActionType, ConnectorManager, run_connectors
from cookbook.helper.shopping_helper import RecipeShoppingEditor
from cookbook.models import ConnectorConfig, Food, Ingredient, Recipe, ShoppingListEntry, Step, Unit


@pytest.fixture()
def obj_1(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(created_by=auth.get_user(u1_s1), food=Food.objects.get_or_create(name='test 1', space=space_1)[0], space=space_1)
    return e


@pytest.fixture()
def recipe_with_ingredients(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    recipe = Recipe.objects.create(
        name='connector test recipe',
        servings=2,
        created_by=user,
        space=space_1,
        internal=True,
    )
    step = Step.objects.create(name='step 1', instruction='do stuff', space=space_1)
    recipe.steps.add(step)
    for i in range(3):
        food = Food.objects.create(name=f'food_{uuid.uuid4().hex[:8]}', space=space_1)
        unit = Unit.objects.create(name=f'unit_{uuid.uuid4().hex[:8]}', space=space_1)
        step.ingredients.add(Ingredient.objects.create(amount=1, food=food, unit=unit, space=space_1))
    return recipe


@pytest.mark.asyncio
async def test_run_connectors(space_1, u1_s1, obj_1) -> None:
    expected_dto = ShoppingListEntryDTO.try_create_from_entry(obj_1)
    connector_mock = Mock(spec=Connector)

    await run_connectors([connector_mock], obj_1, ActionType.DELETED, expected_dto)

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


def test_bring_connector_init_valid(space_1, u1_s1):
    config = ConnectorConfig(
        name='Bring Test',
        type=ConnectorConfig.BRING,
        email='test@example.com',
        password='password123',
        list_id='some-uuid-1234',
        on_shopping_list_entry_created_enabled=True,
        created_by=auth.get_user(u1_s1),
        space=space_1,
    )
    connector = Bring(config)
    assert connector._config == config


def test_bring_connector_init_invalid():
    config = MagicMock(spec=ConnectorConfig)
    config.email = None
    config.password = 'password123'
    config.list_id = 'some-uuid'
    with pytest.raises(ValueError, match="incomplete"):
        Bring(config)


@pytest.mark.asyncio
async def test_bring_on_shopping_list_entry_created():
    config = MagicMock(spec=ConnectorConfig)
    config.name = 'Bring Test'
    config.type = ConnectorConfig.BRING
    config.email = 'test@example.com'
    config.password = 'password123'
    config.list_id = 'test-list-uuid'
    config.on_shopping_list_entry_created_enabled = True

    connector = Bring(config)

    entry = ShoppingListEntryDTO(
        food_name='Milk',
        amount=2.5,
        base_unit='l',
        unit_name='liters',
        created_by=UserDTO(username='testuser', first_name='Test'),
    )

    mock_bring = MagicMock()
    mock_bring.login = AsyncMock()
    mock_bring.save_item = AsyncMock()
    connector._bring = mock_bring
    connector._session = MagicMock()
    connector._logged_in = False

    await connector.on_shopping_list_entry_created(entry)
    mock_bring.login.assert_called_once()
    mock_bring.save_item.assert_called_once_with('test-list-uuid', 'Milk', '2.5 l')


@pytest.mark.asyncio
async def test_bring_on_shopping_list_entry_deleted():
    config = MagicMock(spec=ConnectorConfig)
    config.name = 'Bring Test'
    config.type = ConnectorConfig.BRING
    config.email = 'test@example.com'
    config.password = 'password123'
    config.list_id = 'test-list-uuid'
    config.on_shopping_list_entry_deleted_enabled = True

    connector = Bring(config)

    entry = ShoppingListEntryDTO(
        food_name='Bread',
        amount=None,
        base_unit=None,
        unit_name=None,
        created_by=UserDTO(username='testuser', first_name='Test'),
    )

    mock_bring = MagicMock()
    mock_bring.login = AsyncMock()
    mock_bring.remove_item = AsyncMock()
    connector._bring = mock_bring
    connector._session = MagicMock()
    connector._logged_in = False

    await connector.on_shopping_list_entry_deleted(entry)
    mock_bring.login.assert_called_once()
    mock_bring.remove_item.assert_called_once_with('test-list-uuid', 'Bread')


@pytest.mark.asyncio
async def test_bring_auth_failure_disables_after_max_retries():
    config = MagicMock(spec=ConnectorConfig)
    config.name = 'Bring Test'
    config.type = ConnectorConfig.BRING
    config.email = 'test@example.com'
    config.password = 'wrong-password'
    config.list_id = 'test-list-uuid'
    config.on_shopping_list_entry_created_enabled = True

    connector = Bring(config)

    entry = ShoppingListEntryDTO(
        food_name='Milk',
        amount=1,
        base_unit=None,
        unit_name=None,
        created_by=UserDTO(username='testuser', first_name='Test'),
    )

    mock_bring = MagicMock()
    mock_bring.login = AsyncMock(side_effect=BringAuthException("invalid credentials"))
    mock_bring.save_item = AsyncMock()
    connector._bring = mock_bring
    connector._session = MagicMock()

    for _ in range(Bring.MAX_AUTH_RETRIES):
        await connector.on_shopping_list_entry_created(entry)

    assert connector._auth_failed is True
    mock_bring.save_item.assert_not_called()

    # After max retries, login should no longer be attempted
    mock_bring.login.reset_mock()
    await connector.on_shopping_list_entry_created(entry)
    mock_bring.login.assert_not_called()


def test_format_shopping_list_entry_amount_zero():
    entry = ShoppingListEntryDTO(
        food_name='Salt',
        amount=0,
        base_unit='g',
        unit_name='grams',
        created_by=UserDTO(username='testuser', first_name='Test'),
    )
    item_name, specification = _format_shopping_list_entry(entry)
    assert item_name == 'Salt'
    assert specification == ''


def test_format_shopping_list_entry_amount_none():
    entry = ShoppingListEntryDTO(
        food_name='Pepper',
        amount=None,
        base_unit=None,
        unit_name=None,
        created_by=UserDTO(username='testuser', first_name='Test'),
    )
    item_name, specification = _format_shopping_list_entry(entry)
    assert item_name == 'Pepper'
    assert specification == ''
