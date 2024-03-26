import logging
from logging import Logger
from typing import Dict
from urllib.parse import urljoin

from aiohttp import ClientError, request

from cookbook.connectors.connector import Connector
from cookbook.models import ShoppingListEntry, ConnectorConfig, Space


class HomeAssistant(Connector):
    _config: ConnectorConfig
    _logger: Logger

    def __init__(self, config: ConnectorConfig):
        if not config.token or not config.url or not config.todo_entity:
            raise ValueError("config for HomeAssistantConnector in incomplete")

        self._config = config
        self._logger = logging.getLogger("connector.HomeAssistant")

    async def send_api_call(self, method: str, path: str, data: Dict) -> str:
        headers = {
            "Authorization": f"Bearer {self._config.token}",
            "Content-Type": "application/json"
        }
        async with request(method, urljoin(self._config.url, path), headers=headers, json=data) as response:
            response.raise_for_status()
            return await response.json()

    async def on_shopping_list_entry_created(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_created_enabled:
            return

        item, description = _format_shopping_list_entry(shopping_list_entry)

        logging.debug(f"adding {item=} to {self._config.name}")

        data = {
            "entity_id": self._config.todo_entity,
            "item": item,
            "description": description,
        }

        try:
            await self.send_api_call("POST", "services/todo/add_item", data)
        except ClientError as err:
            self._logger.warning(f"[HomeAssistant {self._config.name}] Received an exception from the api: {err=}, {type(err)=}")

    async def on_shopping_list_entry_updated(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_updated_enabled:
            return
        pass

    async def on_shopping_list_entry_deleted(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_deleted_enabled:
            return

        item, _ = _format_shopping_list_entry(shopping_list_entry)

        logging.debug(f"removing {item=} from {self._config.name}")

        data = {
            "entity_id": self._config.todo_entity,
            "item": item,
        }

        try:
            await self.send_api_call("POST", "services/todo/remove_item", data)
        except ClientError as err:
            self._logger.warning(f"[HomeAssistant {self._config.name}] Received an exception from the api: {err=}, {type(err)=}")

    async def close(self) -> None:
        pass


def _format_shopping_list_entry(shopping_list_entry: ShoppingListEntry):
    item = shopping_list_entry.food.name
    if shopping_list_entry.amount > 0:
        item += f" ({shopping_list_entry.amount:.2f}".rstrip('0').rstrip('.')
        if shopping_list_entry.unit and shopping_list_entry.unit.base_unit and len(shopping_list_entry.unit.base_unit) > 0:
            item += f" {shopping_list_entry.unit.base_unit})"
        elif shopping_list_entry.unit and shopping_list_entry.unit.name and len(shopping_list_entry.unit.name) > 0:
            item += f" {shopping_list_entry.unit.name})"
        else:
            item += ")"

    description = "From TandoorRecipes"
    if shopping_list_entry.created_by.first_name and len(shopping_list_entry.created_by.first_name) > 0:
        description += f", by {shopping_list_entry.created_by.first_name}"
    else:
        description += f", by {shopping_list_entry.created_by.username}"

    return item, description
