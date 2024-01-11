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

    # @abstractmethod
    # def on_recipe_created(self, instance: Recipe, **kwargs) -> None:
    #     pass
    #
    # @abstractmethod
    # def on_recipe_updated(self, instance: Recipe, **kwargs) -> None:
    #     pass
    #
    # @abstractmethod
    # def on_recipe_deleted(self, instance: Recipe, **kwargs) -> None:
    #     pass
    #
    # @abstractmethod
    # def on_meal_plan_created(self, instance: MealPlan, **kwargs) -> None:
    #     pass
    #
    # @abstractmethod
    # def on_meal_plan_updated(self, instance: MealPlan, **kwargs) -> None:
    #     pass
    #
    # @abstractmethod
    # def on_meal_plan_deleted(self, instance: MealPlan, **kwargs) -> None:
    #     pass
