import pytest
from django.contrib import auth
from mock.mock import Mock

from cookbook.connectors.connector import Connector, ShoppingListEntryDTO
from cookbook.connectors.connector_manager import ActionType, run_connectors
from cookbook.models import Food, ShoppingListEntry


@pytest.fixture()
def obj_1(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(created_by=auth.get_user(u1_s1), food=Food.objects.get_or_create(name='test 1', space=space_1)[0], space=space_1)
    return e


@pytest.mark.asyncio
async def test_run_connectors(space_1, u1_s1, obj_1) -> None:
    expected_dto = ShoppingListEntryDTO.try_create_from_entry(obj_1)
    connector_mock = Mock(spec=Connector)

    await run_connectors([connector_mock], obj_1, ActionType.DELETED)

    assert not connector_mock.on_shopping_list_entry_updated.called
    assert not connector_mock.on_shopping_list_entry_created.called
    connector_mock.on_shopping_list_entry_deleted.assert_called_once_with(expected_dto)
