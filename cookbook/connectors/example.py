from cookbook.connectors.connector import Connector
from cookbook.models import ExampleConfig, Space, ShoppingListEntry


class Example(Connector):
    _config: ExampleConfig

    def __init__(self, config: ExampleConfig):
        self._config = config

    async def on_shopping_list_entry_created(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_created_enabled:
            return
        pass

    async def on_shopping_list_entry_updated(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_updated_enabled:
            return
        pass

    async def on_shopping_list_entry_deleted(self, space: Space, shopping_list_entry: ShoppingListEntry) -> None:
        if not self._config.on_shopping_list_entry_deleted_enabled:
            return
        pass

    async def close(self) -> None:
        pass
