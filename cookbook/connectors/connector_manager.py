import asyncio
import logging
import multiprocessing
import queue
import weakref
from asyncio import Task
from dataclasses import dataclass
from enum import Enum
from multiprocessing import JoinableQueue
from types import UnionType
from typing import List, Any, Dict, Optional, Type

from django.conf import settings
from django_scopes import scope

from cookbook.connectors.connector import Connector
from cookbook.connectors.homeassistant import HomeAssistant
from cookbook.models import ShoppingListEntry, Space, ConnectorConfig

multiprocessing.set_start_method('fork')  # https://code.djangoproject.com/ticket/31169

REGISTERED_CLASSES: UnionType | Type = ShoppingListEntry


class ActionType(Enum):
    CREATED = 1
    UPDATED = 2
    DELETED = 3


@dataclass
class Work:
    instance: REGISTERED_CLASSES | ConnectorConfig
    actionType: ActionType


# The way ConnectionManager works is as follows:
# 1. On init, it starts a worker & creates a queue for 'Work'
# 2. Then any time its called, it verifies the type of action (create/update/delete) and if the item is of interest, pushes the Work (non-blocking) to the queue.
# 3. The worker consumes said work from the queue.
# 3.1 If the work is of type ConnectorConfig, it flushes its cache of known connectors (per space.id)
# 3.2 If work is of type REGISTERED_CLASSES, it asynchronously fires of all connectors and wait for them to finish (runtime should depend on the 'slowest' connector)
# 4. Work is marked as consumed, and next entry of the queue is consumed.
# Each 'Work' is processed in sequential by the worker, so the throughput is about [workers * the slowest connector]
class ConnectorManager:
    _queue: JoinableQueue
    _listening_to_classes = REGISTERED_CLASSES | ConnectorConfig

    def __init__(self):
        self._queue = multiprocessing.JoinableQueue(maxsize=settings.EXTERNAL_CONNECTORS_QUEUE_SIZE)
        self._worker = multiprocessing.Process(target=self.worker, args=(0, self._queue,), daemon=True)
        self._worker.start()
        self._finalizer = weakref.finalize(self, self.stop)

    # Called by post save & post delete signals
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
            logging.info(f"queue was full, so skipping {action_type} of type {type(instance)}")
            return

    def stop(self):
        self._queue.join()
        self._queue.close()
        self._worker.join()

    @staticmethod
    def worker(worker_id: int, worker_queue: JoinableQueue):
        # https://stackoverflow.com/a/10684672 Close open connections after starting a new process to prevent re-use of same connections
        from django.db import connections
        connections.close_all()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        logging.info(f"started ConnectionManager worker {worker_id}")

        # When multiple workers are used, please make sure the cache is shared across all threads, otherwise it might lead to un-expected behavior.
        _connectors_cache: Dict[int, List[Connector]] = dict()

        while True:
            try:
                item: Optional[Work] = worker_queue.get()
            except KeyboardInterrupt:
                break

            if item is None:
                break

            # If a Connector was changed/updated, refresh connector from the database for said space
            refresh_connector_cache = isinstance(item.instance, ConnectorConfig)

            space: Space = item.instance.space
            connectors: Optional[List[Connector]] = _connectors_cache.get(space.id)

            if connectors is None or refresh_connector_cache:
                if connectors is not None:
                    loop.run_until_complete(close_connectors(connectors))

                with scope(space=space):
                    connectors: List[Connector] = list()
                    for config in space.connectorconfig_set.all():
                        config: ConnectorConfig = config
                        if not config.enabled:
                            continue

                        try:
                            connector: Optional[Connector] = ConnectorManager.get_connected_for_config(config)
                        except BaseException:
                            logging.exception(f"failed to initialize {config.name}")
                            continue

                        if connector is not None:
                            connectors.append(connector)

                    _connectors_cache[space.id] = connectors

            if len(connectors) == 0 or refresh_connector_cache:
                worker_queue.task_done()
                continue

            loop.run_until_complete(run_connectors(connectors, space, item.instance, item.actionType))
            worker_queue.task_done()

        logging.info(f"terminating ConnectionManager worker {worker_id}")

    @staticmethod
    def get_connected_for_config(config: ConnectorConfig) -> Optional[Connector]:
        match config.type:
            case ConnectorConfig.HOMEASSISTANT:
                return HomeAssistant(config)
            case _:
                return None


async def close_connectors(connectors: List[Connector]):
    tasks: List[Task] = [asyncio.create_task(connector.close()) for connector in connectors]

    if len(tasks) == 0:
        return

    try:
        await asyncio.gather(*tasks, return_exceptions=False)
    except BaseException:
        logging.exception("received an exception while closing one of the connectors")


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

    if len(tasks) == 0:
        return

    try:
        # Wait for all async tasks to finish, if one fails, the others still continue.
        await asyncio.gather(*tasks, return_exceptions=False)
    except BaseException:
        logging.exception("received an exception from one of the connectors")
