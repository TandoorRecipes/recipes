from datetime import timedelta
from decimal import Decimal

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import F, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from cookbook.helper.HelperFunctions import Round, str2bool
from cookbook.models import (Ingredient, ShoppingListEntry, ShoppingListRecipe,
                             SupermarketCategoryRelation)
from recipes import settings


def shopping_helper(qs, request):
    supermarket = request.query_params.get('supermarket', None)
    checked = request.query_params.get('checked', 'recent')
    user = request.user

    supermarket_order = ['food__supermarket_category__name', 'food__name']

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


def list_from_recipe(list_recipe=None, recipe=None, mealplan=None, servings=None, ingredients=None, created_by=None, space=None, append=False):
    """
    Creates ShoppingListRecipe and associated ShoppingListEntrys from a recipe or a meal plan with a recipe
    :param list_recipe: Modify an existing ShoppingListRecipe
    :param recipe: Recipe to use as list of ingredients.  One of [recipe, mealplan] are required
    :param mealplan: alternatively use a mealplan recipe as source of ingredients
    :param servings: Optional: Number of servings to use to scale shoppinglist.  If servings = 0 an existing recipe list will be deleted
    :param ingredients: Ingredients, list of ingredient IDs to include on the shopping list.  When not provided all ingredients will be used
    :param append: If False will remove any entries not included with ingredients, when True will append ingredients to the shopping list
    """
    r = recipe or getattr(mealplan, 'recipe', None) or getattr(list_recipe, 'recipe', None)
    if not r:
        raise ValueError(_("You must supply a recipe or mealplan"))

    created_by = created_by or getattr(mealplan, 'created_by', None) or getattr(list_recipe, 'created_by', None)
    if not created_by:
        raise ValueError(_("You must supply a created_by"))

    if type(servings) not in [int, float]:
        servings = getattr(mealplan, 'servings', 1.0)

    shared_users = list(created_by.get_shopping_share())
    shared_users.append(created_by)
    if list_recipe:
        created = False
    else:
        list_recipe = ShoppingListRecipe.objects.create(recipe=r, mealplan=mealplan, servings=servings)
        created = True

    if servings == 0 and not created:
        list_recipe.delete()
        return []
    elif ingredients:
        ingredients = Ingredient.objects.filter(pk__in=ingredients, space=space)
    else:
        ingredients = Ingredient.objects.filter(step__recipe=r, space=space)

    add_ingredients = ingredients.values_list('id', flat=True)
    if not append:
        existing_list = ShoppingListEntry.objects.filter(list_recipe=list_recipe)
        # delete shopping list entries not included in ingredients
        existing_list.exclude(ingredient__in=ingredients).delete()
        # add shopping list entries that did not previously exist
        add_ingredients = set(add_ingredients) - set(existing_list.values_list('ingredient__id', flat=True))
    add_ingredients = Ingredient.objects.filter(id__in=add_ingredients, space=space)

    # if servings have changed, update the ShoppingListRecipe and existing Entrys
    if servings <= 0:
        servings = 1
    servings_factor = servings / r.servings
    if not created and list_recipe.servings != servings:
        update_ingredients = set(ingredients.values_list('id', flat=True)) - set(add_ingredients.values_list('id', flat=True))
        for sle in ShoppingListEntry.objects.filter(list_recipe=list_recipe, ingredient__id__in=update_ingredients):
            sle.amount = sle.ingredient.amount * Decimal(servings_factor)
            sle.save()

    # add any missing Entrys
    for i in [x for x in add_ingredients if not x.food.ignore_shopping]:

        ShoppingListEntry.objects.create(
            list_recipe=list_recipe,
            food=i.food,
            unit=i.unit,
            ingredient=i,
            amount=i.amount * Decimal(servings_factor),
            created_by=created_by,
            space=space,
        )

    # return all shopping list items
    return list_recipe
