from datetime import timedelta
from decimal import Decimal

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import F, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.translation import gettext as _

from cookbook.helper.HelperFunctions import Round, str2bool
from cookbook.models import (Ingredient, MealPlan, Recipe, ShoppingListEntry, ShoppingListRecipe,
                             SupermarketCategoryRelation)
from recipes import settings


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
        today_start = timezone.now().replace(hour=0, minute=0, second=0)
        week_ago = today_start - timedelta(days=user.userpreference.shopping_recent_days)
        qs = qs.filter(Q(checked=False) | Q(completed_at__gte=week_ago))
        supermarket_order = ['checked'] + supermarket_order

    return qs.order_by(*supermarket_order).select_related('unit', 'food', 'ingredient', 'created_by', 'list_recipe', 'list_recipe__mealplan', 'list_recipe__recipe')


class RecipeShoppingEditor():
    def __init__(self, user, space, **kwargs):
        self.created_by = user
        self.space = space
        self._kwargs = {**kwargs}

        self.mealplan = self._kwargs.get('mealplan', None)
        if type(self.mealplan) in [int, float]:
            self.mealplan = MealPlan.objects.filter(id=self.mealplan, space=self.space)
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
    def _servings_factor(self):
        return self.servings / self.recipe.servings

    @property
    def _shared_users(self):
        return [*list(self.created_by.get_shopping_share()), self.created_by]

    @staticmethod
    def get_shopping_list_recipe(id, user, space):
        return ShoppingListRecipe.objects.filter(id=id).filter(Q(shoppinglist__space=space) | Q(entries__space=space)).filter(
            Q(shoppinglist__created_by=user)
            | Q(shoppinglist__shared=user)
            | Q(entries__created_by=user)
            | Q(entries__created_by__in=list(user.get_shopping_share()))
        ).prefetch_related('entries').first()

    def get_recipe_ingredients(self, id, exclude_onhand=False):
        if exclude_onhand:
            return Ingredient.objects.filter(step__recipe__id=id,  food__ignore_shopping=False,  space=self.space).exclude(food__onhand_users__id__in=[x.id for x in self._shared_users])
        else:
            return Ingredient.objects.filter(step__recipe__id=id,  food__ignore_shopping=False,  space=self.space)

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
        except:
            return False

    def _add_ingredients(self, ingredients=None):
        if not ingredients:
            return
        elif type(ingredients) == list:
            ingredients = Ingredient.objects.filter(id__in=ingredients)
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


# # TODO refactor as class
# def list_from_recipe(list_recipe=None, recipe=None, mealplan=None, servings=None, ingredients=None, created_by=None, space=None, append=False):
#     """
#     Creates ShoppingListRecipe and associated ShoppingListEntrys from a recipe or a meal plan with a recipe
#     :param list_recipe: Modify an existing ShoppingListRecipe
#     :param recipe: Recipe to use as list of ingredients.  One of [recipe, mealplan] are required
#     :param mealplan: alternatively use a mealplan recipe as source of ingredients
#     :param servings: Optional: Number of servings to use to scale shoppinglist.  If servings = 0 an existing recipe list will be deleted
#     :param ingredients: Ingredients, list of ingredient IDs to include on the shopping list.  When not provided all ingredients will be used
#     :param append: If False will remove any entries not included with ingredients, when True will append ingredients to the shopping list
#     """
#     r = recipe or getattr(mealplan, 'recipe', None) or getattr(list_recipe, 'recipe', None)
#     if not r:
#         raise ValueError(_("You must supply a recipe or mealplan"))

#     created_by = created_by or getattr(ShoppingListEntry.objects.filter(list_recipe=list_recipe).first(), 'created_by', None)
#     if not created_by:
#         raise ValueError(_("You must supply a created_by"))

#     try:
#         servings = float(servings)
#     except (ValueError, TypeError):
#         servings = getattr(mealplan, 'servings', 1.0)

#     servings_factor = servings / r.servings

#     shared_users = list(created_by.get_shopping_share())
#     shared_users.append(created_by)
#     if list_recipe:
#         created = False
#     else:
#         list_recipe = ShoppingListRecipe.objects.create(recipe=r, mealplan=mealplan, servings=servings)
#         created = True

#     related_step_ing = []
#     if servings == 0 and not created:
#         list_recipe.delete()
#         return []
#     elif ingredients:
#         ingredients = Ingredient.objects.filter(pk__in=ingredients, space=space)
#     else:
#         ingredients = Ingredient.objects.filter(step__recipe=r,  food__ignore_shopping=False, space=space)

#         if exclude_onhand := created_by.userpreference.mealplan_autoexclude_onhand:
#             ingredients = ingredients.exclude(food__onhand_users__id__in=[x.id for x in shared_users])

#         if related := created_by.userpreference.mealplan_autoinclude_related:
#             # TODO: add levels of related recipes (related recipes of related recipes) to use when auto-adding mealplans
#             related_recipes = r.get_related_recipes()

#             for x in related_recipes:
#                 # related recipe is a Step serving size is driven by recipe serving size
#                 # TODO once/if Steps can have a serving size this needs to be refactored
#                 if exclude_onhand:
#                     # if steps are used more than once in a recipe or subrecipe - I don' think this results in the desired behavior
#                     related_step_ing += Ingredient.objects.filter(step__recipe=x, space=space).exclude(food__onhand_users__id__in=[x.id for x in shared_users]).values_list('id', flat=True)
#                 else:
#                     related_step_ing += Ingredient.objects.filter(step__recipe=x, space=space).values_list('id', flat=True)

#                 x_ing = []
#                 if ingredients.filter(food__recipe=x).exists():
#                     for ing in ingredients.filter(food__recipe=x):
#                         if exclude_onhand:
#                             x_ing = Ingredient.objects.filter(step__recipe=x,  food__ignore_shopping=False, space=space).exclude(food__onhand_users__id__in=[x.id for x in shared_users])
#                         else:
#                             x_ing = Ingredient.objects.filter(step__recipe=x,  food__ignore_shopping=False, space=space).exclude(food__ignore_shopping=True)
#                         for i in [x for x in x_ing]:
#                             ShoppingListEntry.objects.create(
#                                 list_recipe=list_recipe,
#                                 food=i.food,
#                                 unit=i.unit,
#                                 ingredient=i,
#                                 amount=i.amount * Decimal(servings_factor),
#                                 created_by=created_by,
#                                 space=space,
#                             )
#                 # dont' add food to the shopping list that are actually recipes that will be added as ingredients
#                 ingredients = ingredients.exclude(food__recipe=x)

#     add_ingredients = list(ingredients.values_list('id', flat=True)) + related_step_ing
#     if not append:
#         existing_list = ShoppingListEntry.objects.filter(list_recipe=list_recipe)
#         # delete shopping list entries not included in ingredients
#         existing_list.exclude(ingredient__in=ingredients).delete()
#         # add shopping list entries that did not previously exist
#         add_ingredients = set(add_ingredients) - set(existing_list.values_list('ingredient__id', flat=True))
#     add_ingredients = Ingredient.objects.filter(id__in=add_ingredients, space=space)

#     # if servings have changed, update the ShoppingListRecipe and existing Entries
#     if servings <= 0:
#         servings = 1

#     if not created and list_recipe.servings != servings:
#         update_ingredients = set(ingredients.values_list('id', flat=True)) - set(add_ingredients.values_list('id', flat=True))
#         list_recipe.servings = servings
#         list_recipe.save()
#         for sle in ShoppingListEntry.objects.filter(list_recipe=list_recipe, ingredient__id__in=update_ingredients):
#             sle.amount = sle.ingredient.amount * Decimal(servings_factor)
#             sle.save()

#     # add any missing Entries
#     for i in [x for x in add_ingredients if x.food]:

#         ShoppingListEntry.objects.create(
#             list_recipe=list_recipe,
#             food=i.food,
#             unit=i.unit,
#             ingredient=i,
#             amount=i.amount * Decimal(servings_factor),
#             created_by=created_by,
#             space=space,
#         )

#     # return all shopping list items
#     return list_recipe
