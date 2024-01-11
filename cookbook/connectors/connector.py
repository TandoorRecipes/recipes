from abc import ABC, abstractmethod

from cookbook.models import ShoppingListEntry, Space


class Connector(ABC):
    @abstractmethod
    async def on_shopping_list_entry_created(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    @abstractmethod
    async def on_shopping_list_entry_updated(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    @abstractmethod
    async def on_shopping_list_entry_deleted(self, space: Space, instance: ShoppingListEntry) -> None:
        pass

    # TODO: Maybe add an 'IsEnabled(self) -> Bool' to here
    # TODO: Add Recipes & possibly Meal Place listeners/hooks (And maybe more?)
