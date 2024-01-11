import asyncio
from enum import Enum
from types import UnionType
from typing import List, Any, Dict

from django_scopes import scope

from cookbook.connectors.connector import Connector
from cookbook.connectors.homeassistant import HomeAssistant
from cookbook.models import ShoppingListEntry, Recipe, MealPlan, Space


class ActionType(Enum):
    CREATED = 1
    UPDATED = 2
    DELETED = 3


class ConnectorManager:
    _connectors: Dict[str, List[Connector]]
    _listening_to_classes: UnionType = ShoppingListEntry | Recipe | MealPlan | Connector

    def __init__(self):
        self._connectors = dict()

    def __call__(self, instance: Any, **kwargs) -> None:
        if not isinstance(instance, self._listening_to_classes):
            return

        # If a Connector was changed/updated, refresh connector from the database for said space
        purge_connector_cache = isinstance(instance, Connector)

        space: Space = instance.space
        if space.name in self._connectors and not purge_connector_cache:
            connectors: List[Connector] = self._connectors[space.name]
        else:
            with scope(space=space):
                connectors: List[Connector] = [HomeAssistant(config) for config in space.homeassistantconfig_set.all() if config.enabled]
                self._connectors[space.name] = connectors

        if len(connectors) == 0 or purge_connector_cache:
            return

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.run_connectors(connectors, space, instance, **kwargs))
        loop.close()

    @staticmethod
    async def run_connectors(connectors: List[Connector], space: Space, instance: Any, **kwargs):
        action_type: ActionType
        if "created" in kwargs and kwargs["created"]:
            action_type = ActionType.CREATED
        elif "created" in kwargs and not kwargs["created"]:
            action_type = ActionType.UPDATED
        elif "origin" in kwargs:
            action_type = ActionType.DELETED
        else:
            return

        tasks: List[asyncio.Task] = list()

        if isinstance(instance, ShoppingListEntry):
            shopping_list_entry: ShoppingListEntry = instance

            match action_type:
                case ActionType.CREATED:
                    for connector in connectors:
                        tasks.append(asyncio.create_task(connector.on_shopping_list_entry_created(space, shopping_list_entry)))
                case ActionType.UPDATED:
                    for connector in connectors:
                        tasks.append(asyncio.create_task(connector.on_shopping_list_entry_updated(space, shopping_list_entry)))
                case ActionType.DELETED:
                    for connector in connectors:
                        tasks.append(asyncio.create_task(connector.on_shopping_list_entry_deleted(space, shopping_list_entry)))

        try:
            await asyncio.gather(*tasks, return_exceptions=False)
        except BaseException as e:
            print("received an exception from one of the tasks: ", e)
