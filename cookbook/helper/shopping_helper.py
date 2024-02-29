
from decimal import Decimal

from django.db.models import F, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils.translation import gettext as _

from cookbook.models import (Ingredient, MealPlan, Recipe, ShoppingListEntry, ShoppingListRecipe,
                             SupermarketCategoryRelation)


def shopping_helper(qs, request):
    supermarket = request.query_params.get('supermarket', None)
    checked = request.query_params.get('checked', 'recent')
    user = request.user
    supermarket_order = [F('food__supermarket_category__name').asc(nulls_first=True), 'food__name']

    # TODO created either scheduled task or startup task to delete very old shopping list entries
    # TODO create user preference to define 'very old'
    if supermarket:
        supermarket_categories = SupermarketCategoryRelation.objects.filter(supermarket=supermarket, category=OuterRef('food__supermarket_category'))
        qs = qs.annotate(supermarket_order=Coalesce(Subquery(supermarket_categories.values('order')), Value(9999)))
        supermarket_order = ['supermarket_order'] + supermarket_order
    if checked in ['false', 0, '0']:
        qs = qs.filter(checked=False)
    elif checked in ['true', 1, '1']:
        qs = qs.filter(checked=True)
    elif checked in ['recent']:
        supermarket_order = ['checked'] + supermarket_order

    return qs.distinct().order_by(*supermarket_order).select_related('unit', 'food', 'ingredient', 'created_by', 'list_recipe', 'list_recipe__mealplan', 'list_recipe__recipe')


class RecipeShoppingEditor():
    def __init__(self, user, space, **kwargs):
        self.created_by = user
        self.space = space
        self._kwargs = {**kwargs}

        self.mealplan = self._kwargs.get('mealplan', None)
        if type(self.mealplan) in [int, float]:
            self.mealplan = MealPlan.objects.filter(id=self.mealplan, space=self.space)
        if isinstance(self.mealplan, dict):
            self.mealplan = MealPlan.objects.filter(id=self.mealplan['id'], space=self.space).first()
        self.id = self._kwargs.get('id', None)

        self._shopping_list_recipe = self.get_shopping_list_recipe(self.id, self.created_by, self.space)

        if self._shopping_list_recipe:
            # created_by needs to be sticky to original creator as it is 'their' shopping list
            # changing shopping list created_by can shift some items to new owner which may not share in the other direction
            self.created_by = getattr(self._shopping_list_recipe.entries.first(), 'created_by', self.created_by)

        self.recipe = getattr(self._shopping_list_recipe, 'recipe', None) or self._kwargs.get('recipe', None) or getattr(self.mealplan, 'recipe', None)
        if type(self.recipe) in [int, float]:
            self.recipe = Recipe.objects.filter(id=self.recipe, space=self.space)

        try:
            self.servings = float(self._kwargs.get('servings', None))
        except (ValueError, TypeError):
            self.servings = getattr(self._shopping_list_recipe, 'servings', None) or getattr(self.mealplan, 'servings', None) or getattr(self.recipe, 'servings', None)

    @property
    def _recipe_servings(self):
        return getattr(self.recipe, 'servings', None) or getattr(getattr(self.mealplan, 'recipe', None), 'servings',
                                                                 None) or getattr(getattr(self._shopping_list_recipe, 'recipe', None), 'servings', None)

    @property
    def _servings_factor(self):
        return Decimal(self.servings) / Decimal(self._recipe_servings)

    @property
    def _shared_users(self):
        return [*list(self.created_by.get_shopping_share()), self.created_by]

    @staticmethod
    def get_shopping_list_recipe(id, user, space):
        return ShoppingListRecipe.objects.filter(id=id).filter(entries__space=space).filter(
            Q(entries__created_by=user)
            | Q(entries__created_by__in=list(user.get_shopping_share()))
        ).prefetch_related('entries').first()

    def get_recipe_ingredients(self, id, exclude_onhand=False):
        if exclude_onhand:
            return Ingredient.objects.filter(step__recipe__id=id, food__ignore_shopping=False, space=self.space).exclude(
                food__onhand_users__id__in=[x.id for x in self._shared_users])
        else:
            return Ingredient.objects.filter(step__recipe__id=id, food__ignore_shopping=False, space=self.space)

    @property
    def _include_related(self):
        return self.created_by.userpreference.mealplan_autoinclude_related

    @property
    def _exclude_onhand(self):
        return self.created_by.userpreference.mealplan_autoexclude_onhand

    def create(self, **kwargs):
        ingredients = kwargs.get('ingredients', None)
        exclude_onhand = not ingredients and self._exclude_onhand
        if servings := kwargs.get('servings', None):
            self.servings = float(servings)

        if mealplan := kwargs.get('mealplan', None):
            if isinstance(mealplan, dict):
                self.mealplan = MealPlan.objects.filter(id=mealplan['id'], space=self.space).first()
            else:
                self.mealplan = mealplan
            self.recipe = mealplan.recipe
        elif recipe := kwargs.get('recipe', None):
            self.recipe = recipe

        if not self.servings:
            self.servings = getattr(self.mealplan, 'servings', None) or getattr(self.recipe, 'servings', 1.0)

        self._shopping_list_recipe = ShoppingListRecipe.objects.create(recipe=self.recipe, mealplan=self.mealplan, servings=self.servings)

        if ingredients:
            self._add_ingredients(ingredients=ingredients)
        else:
            if self._include_related:
                related = self.recipe.get_related_recipes()
                self._add_ingredients(self.get_recipe_ingredients(self.recipe.id, exclude_onhand=exclude_onhand).exclude(food__recipe__in=related))
                for r in related:
                    self._add_ingredients(self.get_recipe_ingredients(r.id, exclude_onhand=exclude_onhand).exclude(food__recipe__in=related))
            else:
                self._add_ingredients(self.get_recipe_ingredients(self.recipe.id, exclude_onhand=exclude_onhand))

        return True

    def add(self, **kwargs):
        return

    def edit(self, servings=None, ingredients=None, **kwargs):
        if servings:
            self.servings = servings

        self._delete_ingredients(ingredients=ingredients)
        if self.servings != self._shopping_list_recipe.servings:
            self.edit_servings()
        self._add_ingredients(ingredients=ingredients)
        return True

    def edit_servings(self, servings=None, **kwargs):
        if servings:
            self.servings = servings
        if id := kwargs.get('id', None):
            self._shopping_list_recipe = self.get_shopping_list_recipe(id, self.created_by, self.space)
        if not self.servings:
            raise ValueError(_("You must supply a servings size"))

        if self._shopping_list_recipe.servings == self.servings:
            return True

        for sle in ShoppingListEntry.objects.filter(list_recipe=self._shopping_list_recipe):
            sle.amount = sle.ingredient.amount * Decimal(self._servings_factor)
            sle.save()
        self._shopping_list_recipe.servings = self.servings
        self._shopping_list_recipe.save()
        return True

    def delete(self, **kwargs):
        try:
            self._shopping_list_recipe.delete()
            return True
        except BaseException:
            return False

    def _add_ingredients(self, ingredients=None):
        if not ingredients:
            return
        elif isinstance(ingredients, list):
            ingredients = Ingredient.objects.filter(id__in=ingredients, food__ignore_shopping=False)
        existing = self._shopping_list_recipe.entries.filter(ingredient__in=ingredients).values_list('ingredient__pk', flat=True)
        add_ingredients = ingredients.exclude(id__in=existing)

        for i in [x for x in add_ingredients if x.food]:
            ShoppingListEntry.objects.create(
                list_recipe=self._shopping_list_recipe,
                food=i.food,
                unit=i.unit,
                ingredient=i,
                amount=i.amount * Decimal(self._servings_factor),
                created_by=self.created_by,
                space=self.space,
            )

    # deletes shopping list entries not in ingredients list
    def _delete_ingredients(self, ingredients=None):
        if not ingredients:
            return
        to_delete = self._shopping_list_recipe.entries.exclude(ingredient__in=ingredients)
        ShoppingListEntry.objects.filter(id__in=to_delete).delete()
        self._shopping_list_recipe = self.get_shopping_list_recipe(self.id, self.created_by, self.space)
