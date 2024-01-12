import asyncio
import logging
import multiprocessing
import queue
from asyncio import Task
from dataclasses import dataclass
from enum import Enum
from multiprocessing import Queue
from types import UnionType
from typing import List, Any, Dict, Optional

from django_scopes import scope

from cookbook.connectors.connector import Connector
from cookbook.connectors.homeassistant import HomeAssistant
from cookbook.models import ShoppingListEntry, Recipe, MealPlan, Space

multiprocessing.set_start_method('fork')  # https://code.djangoproject.com/ticket/31169

QUEUE_MAX_SIZE = 10
REGISTERED_CLASSES: UnionType = ShoppingListEntry | Recipe | MealPlan | Connector


class ActionType(Enum):
    CREATED = 1
    UPDATED = 2
    DELETED = 3


@dataclass
class Work:
    instance: REGISTERED_CLASSES
    actionType: ActionType


class ConnectorManager:
    _queue: Queue
    _listening_to_classes = REGISTERED_CLASSES

    def __init__(self):
        self._queue = multiprocessing.Queue(maxsize=QUEUE_MAX_SIZE)
        self._worker = multiprocessing.Process(target=self.worker, args=(self._queue,), daemon=True)
        self._worker.start()

    def __call__(self, instance: Any, **kwargs) -> None:
        if not isinstance(instance, self._listening_to_classes) or not hasattr(instance, "space"):
            return

        action_type: ActionType
        if "created" in kwargs and kwargs["created"]:
            action_type = ActionType.CREATED
        elif "created" in kwargs and not kwargs["created"]:
            action_type = ActionType.UPDATED
        elif "origin" in kwargs:
            action_type = ActionType.DELETED
        else:
            return

        try:
            self._queue.put_nowait(Work(instance, action_type))
        except queue.Full:
            return

    def stop(self):
        self._queue.close()
        self._worker.join()

    @staticmethod
    def worker(worker_queue: Queue):
        from django.db import connections
        connections.close_all()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        _connectors: Dict[str, List[Connector]] = dict()

        while True:
            item: Optional[Work] = worker_queue.get()
            if item is None:
                break

            # If a Connector was changed/updated, refresh connector from the database for said space
            refresh_connector_cache = isinstance(item.instance, Connector)

            space: Space = item.instance.space
            connectors: Optional[List[Connector]] = _connectors.get(space.name, None)

            if connectors is None or refresh_connector_cache:
                with scope(space=space):
                    connectors: List[Connector] = [HomeAssistant(config) for config in space.homeassistantconfig_set.all() if config.enabled]
                    _connectors[space.name] = connectors

            if len(connectors) == 0 or refresh_connector_cache:
                return

            loop.run_until_complete(run_connectors(connectors, space, item.instance, item.actionType))

        loop.close()


async def run_connectors(connectors: List[Connector], space: Space, instance: REGISTERED_CLASSES, action_type: ActionType):
    tasks: List[Task] = list()

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
    except BaseException:
        logging.exception("received an exception from one of the connectors")
