import logging
from logging import Logger
from typing import Tuple

import aiohttp
from bring_api import Bring as BringAPI
from bring_api.exceptions import BringAuthException, BringRequestException

from cookbook.connectors.connector import Connector, ShoppingListEntryDTO
from cookbook.models import ConnectorConfig


class Bring(Connector):
    _config: ConnectorConfig
    _logger: Logger
    _session: aiohttp.ClientSession
    _bring: BringAPI
    _logged_in: bool
    _auth_failed: bool

    MAX_AUTH_RETRIES = 3

    def __init__(self, config: ConnectorConfig):
        if not config.email or not config.password or not config.list_id:
            raise ValueError("config for BringConnector is incomplete")

        self._logger = logging.getLogger(f"recipes.connector.bring.{config.name}")
        self._config = config
        self._session = None
        self._bring = None
        self._logged_in = False
        self._auth_failed = False
        self._auth_attempts = 0

    async def _ensure_logged_in(self):
        if self._logged_in:
            return
        if self._auth_failed:
            return
        if self._session is None:
            self._session = aiohttp.ClientSession()
            self._bring = BringAPI(self._session, self._config.email, self._config.password)
        try:
            self._auth_attempts += 1
            await self._bring.login()
            self._logged_in = True
            self._auth_attempts = 0
        except BringAuthException:
            self._logger.error(f"failed to authenticate with Bring API (attempt {self._auth_attempts}/{self.MAX_AUTH_RETRIES})")
            if self._auth_attempts >= self.MAX_AUTH_RETRIES:
                self._auth_failed = True
                self._logger.error("max auth retries reached, disabling Bring connector until restart")
            raise

    async def on_shopping_list_entry_created(self, shopping_list_entry: ShoppingListEntryDTO) -> None:
        if not self._config.on_shopping_list_entry_created_enabled:
            return

        item_name, specification = _format_shopping_list_entry(shopping_list_entry)
        self._logger.debug(f"adding {item_name=} with {specification=} to Bring list {self._config.list_id}")

        try:
            await self._ensure_logged_in()
            await self._bring.save_item(self._config.list_id, item_name, specification)
        except (BringRequestException, BringAuthException) as err:
            self._logger.warning(f"failed to add item to Bring: {err}")

    async def on_shopping_list_entry_updated(self, shopping_list_entry: ShoppingListEntryDTO) -> None:
        if not self._config.on_shopping_list_entry_updated_enabled:
            return

        item_name, specification = _format_shopping_list_entry(shopping_list_entry)
        self._logger.debug(f"updating {item_name=} with {specification=} on Bring list {self._config.list_id}")

        try:
            await self._ensure_logged_in()
            await self._bring.save_item(self._config.list_id, item_name, specification)
        except (BringRequestException, BringAuthException) as err:
            self._logger.warning(f"failed to update item on Bring: {err}")

    async def on_shopping_list_entry_deleted(self, shopping_list_entry: ShoppingListEntryDTO) -> None:
        if not self._config.on_shopping_list_entry_deleted_enabled:
            return

        item_name, _ = _format_shopping_list_entry(shopping_list_entry)
        self._logger.debug(f"removing {item_name=} from Bring list {self._config.list_id}")

        try:
            await self._ensure_logged_in()
            await self._bring.remove_item(self._config.list_id, item_name)
        except (BringRequestException, BringAuthException) as err:
            self._logger.debug(f"failed to remove item from Bring: {err}")

    async def close(self) -> None:
        if self._session is not None:
            await self._session.close()


def _format_shopping_list_entry(shopping_list_entry: ShoppingListEntryDTO) -> Tuple[str, str]:
    item_name = shopping_list_entry.food_name

    specification = ""
    if shopping_list_entry.amount is not None and shopping_list_entry.amount != 0:
        specification = f"{shopping_list_entry.amount:.2f}".rstrip('0').rstrip('.')
        if shopping_list_entry.base_unit:
            specification += f" {shopping_list_entry.base_unit}"
        elif shopping_list_entry.unit_name:
            specification += f" {shopping_list_entry.unit_name}"

    return item_name, specification
