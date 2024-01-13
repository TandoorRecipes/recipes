import logging
from logging import Logger

from homeassistant_api import Client, HomeassistantAPIError, Domain

from cookbook.connectors.connector import Connector
from cookbook.models import ShoppingListEntry, HomeAssistantConfig, Space


class HomeAssistant(Connector):
    _domains_cache: dict[str, Domain]
    _config: HomeAssistantConfig
    _logger: Logger
    _client: Client

    def __init__(self, config: HomeAssistantConfig):
        self._domains_cache = dict()
        self._config = config
        self._logger = logging.getLogger("connector.HomeAssistant")
        self._client = Client(self._config.url, self._config.token, async_cache_session=False, use_async=True)

    async def on_shopping_list_entry_created(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_created_enabled:
            return

        item, description = _format_shopping_list_entry(shopping_list_entry)

        todo_domain = self._domains_cache.get('todo')
        try:
            if todo_domain is None:
                todo_domain = await self._client.async_get_domain('todo')
                self._domains_cache['todo'] = todo_domain

            logging.debug(f"pushing {item} to {self._config.name}")
            await todo_domain.add_item(entity_id=self._config.todo_entity, item=item)
        except HomeassistantAPIError as err:
            self._logger.warning(f"[HomeAssistant {self._config.name}] Received an exception from the api: {err=}, {type(err)=}")

    async def on_shopping_list_entry_updated(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_updated_enabled:
            return
        pass

    async def on_shopping_list_entry_deleted(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_deleted_enabled:
            return

        item, description = _format_shopping_list_entry(shopping_list_entry)

        todo_domain = self._domains_cache.get('todo')
        try:
            if todo_domain is None:
                todo_domain = await self._client.async_get_domain('todo')
                self._domains_cache['todo'] = todo_domain

            logging.debug(f"deleting {item} from {self._config.name}")
            await todo_domain.remove_item(entity_id=self._config.todo_entity, item=item)
        except HomeassistantAPIError as err:
            self._logger.warning(f"[HomeAssistant {self._config.name}] Received an exception from the api: {err=}, {type(err)=}")

    async def close(self) -> None:
        await self._client.async_cache_session.close()


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

    description = "Imported by TandoorRecipes"
    if shopping_list_entry.created_by.first_name and len(shopping_list_entry.created_by.first_name) > 0:
        description += f", created by {shopping_list_entry.created_by.first_name}"
    else:
        description += f", created by {shopping_list_entry.created_by.username}"

    return item, description
