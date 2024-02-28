import pytest
from django.contrib import auth
from mock.mock import Mock

from cookbook.connectors.connector import Connector
from cookbook.connectors.connector_manager import run_connectors, ActionType
from cookbook.models import ShoppingListEntry, Food


@pytest.fixture()
def obj_1(space_1, u1_s1):
    e = ShoppingListEntry.objects.create(created_by=auth.get_user(u1_s1), food=Food.objects.get_or_create(name='test 1', space=space_1)[0], space=space_1)
    return e


@pytest.mark.timeout(10)
@pytest.mark.asyncio
async def test_run_connectors(space_1, u1_s1, obj_1) -> None:
    connector_mock = Mock(spec=Connector)

    await run_connectors([connector_mock], space_1, obj_1, ActionType.DELETED)

    assert not connector_mock.on_shopping_list_entry_updated.called
    assert not connector_mock.on_shopping_list_entry_created.called
    connector_mock.on_shopping_list_entry_deleted.assert_called_once_with(space_1, obj_1)
