from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

from cookbook.models import ShoppingListEntry, User, ConnectorConfig


@dataclass
class UserDTO:
    username: str
    first_name: Optional[str]

    @staticmethod
    def create_from_user(instance: User) -> 'UserDTO':
        return UserDTO(
            username=instance.username,
            first_name=instance.first_name if instance.first_name else None
        )


@dataclass
class ShoppingListEntryDTO:
    food_name: str
    amount: Optional[float]
    base_unit: Optional[str]
    unit_name: Optional[str]
    created_by: UserDTO

    @staticmethod
    def try_create_from_entry(instance: ShoppingListEntry) -> Optional['ShoppingListEntryDTO']:
        if instance.food is None or instance.created_by is None:
            return None

        return ShoppingListEntryDTO(
            food_name=instance.food.name,
            amount=instance.amount if instance.amount else None,
            unit_name=instance.unit.name if instance.unit else None,
            base_unit=instance.unit.base_unit if instance.unit and instance.unit.base_unit else None,
            created_by=UserDTO.create_from_user(instance.created_by),
        )


# A Connector is 'destroyed' & recreated each time 'any' ConnectorConfig in a space changes.
class Connector(ABC):
    @abstractmethod
    def __init__(self, config: ConnectorConfig):
        pass

    @abstractmethod
    async def on_shopping_list_entry_created(self, instance: ShoppingListEntryDTO) -> None:
        pass

    # This method might not trigger on 'direct' entry updates: https://stackoverflow.com/a/35238823
    @abstractmethod
    async def on_shopping_list_entry_updated(self, instance: ShoppingListEntryDTO) -> None:
        pass

    @abstractmethod
    async def on_shopping_list_entry_deleted(self, instance: ShoppingListEntryDTO) -> None:
        pass

    @abstractmethod
    async def close(self) -> None:
        pass
