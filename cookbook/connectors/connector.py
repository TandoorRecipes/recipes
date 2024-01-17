from abc import ABC, abstractmethod

from cookbook.models import ShoppingListEntry, Space, ConnectorConfig


class Connector(ABC):
    @abstractmethod
    def __init__(self, config: ConnectorConfig):
        pass

    @abstractmethod
    async def on_shopping_list_entry_created(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    @abstractmethod
    async def on_shopping_list_entry_updated(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    @abstractmethod
    async def on_shopping_list_entry_deleted(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    @abstractmethod
    async def close(self) -> None:
        pass

    # TODO: Add Recipes & possibly Meal Place listeners/hooks (And maybe more?)
