import logging
from logging import Logger
from typing import Dict, Tuple
from urllib.parse import urljoin

from aiohttp import request, ClientResponseError

from cookbook.connectors.connector import Connector
from cookbook.models import ShoppingListEntry, ConnectorConfig, Space


class HomeAssistant(Connector):
    _config: ConnectorConfig
    _logger: Logger

    _required_foreign_keys = ("food", "unit", "created_by")

    def __init__(self, config: ConnectorConfig):
        if not config.token or not config.url or not config.todo_entity:
            raise ValueError("config for HomeAssistantConnector in incomplete")

        self._logger = logging.getLogger(f"recipes.connector.homeassistant.{config.name}")

        if config.url[-1] != "/":
            config.url += "/"
        self._config = config

    async def homeassistant_api_call(self, method: str, path: str, data: Dict) -> str:
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

        self._logger.debug(f"adding {item=} with {description=} to {self._config.todo_entity}")

        data = {
            "entity_id": self._config.todo_entity,
            "item": item,
        }

        if self._config.supports_description_field:
            data["description"] = description

        try:
            await self.homeassistant_api_call("POST", "services/todo/add_item", data)
        except ClientResponseError as err:
            self._logger.warning(f"received an exception from the api: {err.request_info.url=}, {err.request_info.method=}, {err.status=}, {err.message=}, {type(err)=}")

    async def on_shopping_list_entry_updated(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_updated_enabled:
            return
        pass

    async def on_shopping_list_entry_deleted(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_deleted_enabled:
            return

        if not all(k in shopping_list_entry._state.fields_cache for k in self._required_foreign_keys):
            # Sometimes the food foreign key is not loaded, and we cant load it from an async process
            self._logger.debug("required property was not present in ShoppingListEntry")
            return

        item, _ = _format_shopping_list_entry(shopping_list_entry)

        self._logger.debug(f"removing {item=} from {self._config.todo_entity}")

        data = {
            "entity_id": self._config.todo_entity,
            "item": item,
        }

        try:
            await self.homeassistant_api_call("POST", "services/todo/remove_item", data)
        except ClientResponseError as err:
            # This error will always trigger if the item is not present/found
            self._logger.debug(f"received an exception from the api: {err.request_info.url=}, {err.request_info.method=}, {err.status=}, {err.message=}, {type(err)=}")

    async def close(self) -> None:
        pass


def _format_shopping_list_entry(shopping_list_entry: ShoppingListEntry) -> Tuple[str, str]:
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
