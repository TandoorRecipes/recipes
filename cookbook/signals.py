from decimal import Decimal
from functools import wraps

from django.contrib.postgres.search import SearchVector
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import translation

from cookbook.helper.shopping_helper import list_from_recipe
from cookbook.managers import DICTIONARY
from cookbook.models import (Food, FoodInheritField, Ingredient, MealPlan, Recipe,
                             ShoppingListEntry, Step)


# wraps a signal with the ability to set 'skip_signal' to avoid creating recursive signals
def skip_signal(signal_func):
    @wraps(signal_func)
    def _decorator(sender, instance, **kwargs):
        if not instance:
            return None
        if hasattr(instance, 'skip_signal'):
            return None
        return signal_func(sender, instance, **kwargs)
    return _decorator


# TODO there is probably a way to generalize this
@receiver(post_save, sender=Recipe)
@skip_signal
def update_recipe_search_vector(sender, instance=None, created=False, **kwargs):
    language = DICTIONARY.get(translation.get_language(), 'simple')
    instance.name_search_vector = SearchVector('name__unaccent', weight='A', config=language)
    instance.desc_search_vector = SearchVector('description__unaccent', weight='C', config=language)
    try:
        instance.skip_signal = True
        instance.save()
    finally:
        del instance.skip_signal


@receiver(post_save, sender=Step)
@skip_signal
def update_step_search_vector(sender, instance=None, created=False, **kwargs):
    language = DICTIONARY.get(translation.get_language(), 'simple')
    instance.search_vector = SearchVector('instruction__unaccent', weight='B', config=language)
    try:
        instance.skip_signal = True
        instance.save()
    finally:
        del instance.skip_signal


@receiver(post_save, sender=Food)
@skip_signal
def update_food_inheritance(sender, instance=None, created=False, **kwargs):
    if not instance:
        return

    inherit = Food.inherit_fields.difference(instance.ignore_inherit.all())
    # nothing to apply from parent and nothing to apply to children
    if (not instance.inherit or not instance.parent or inherit.count() == 0) and instance.numchild == 0:
        return

    inherit = inherit.values_list('field', flat=True)
    # apply changes from parent to instance for each inheritted field
    if instance.inherit and instance.parent and inherit.count() > 0:
        parent = instance.get_parent()
        if 'ignore_shopping' in inherit:
            instance.ignore_shopping = parent.ignore_shopping
        # if supermarket_category is not set, do not cascade - if this becomes non-intuitive can change
        if 'supermarket_category' in inherit and parent.supermarket_category:
            instance.supermarket_category = parent.supermarket_category
        try:
            instance.skip_signal = True
            instance.save()
        finally:
            del instance.skip_signal

    # apply changes to direct children - depend on save signals for those objects to cascade inheritance down
    instance.get_children().filter(inherit=True).exclude(ignore_inherit__field='ignore_shopping').update(ignore_shopping=instance.ignore_shopping)
    # don't cascade empty supermarket category
    if instance.supermarket_category:
        instance.get_children().filter(inherit=True).exclude(ignore_inherit__field='supermarket_category').update(supermarket_category=instance.supermarket_category)


@receiver(post_save, sender=MealPlan)
def auto_add_shopping(sender, instance=None, created=False, weak=False, **kwargs):
    user = instance.get_owner()
    if not created or not user.userpreference.mealplan_autoadd_shopping:
        return

    # if creating a mealplan - perform shopping list activities
    space = instance.space
    if user.userpreference.mealplan_autoadd_shopping:
        kwargs = {
            'mealplan': instance,
            'space': space,
            'created_by': user,
            'servings': instance.servings
        }
        recipe_ingredients = Ingredient.objects.filter(step__recipe=instance.recipe, space=space)
        if exclude_onhand := user.userpreference.mealplan_autoexclude_onhand:
            recipe_ingredients = recipe_ingredients.exclude(food__on_hand=True)
        if related := user.userpreference.mealplan_autoinclude_related:
            # TODO: add levels of related recipes to use when auto-adding mealplans
            related_recipes = instance.recipe.get_related_recipes()
            # dont' add recipes that are going to have their recipes added to the shopping list
            kwargs['ingredients'] = recipe_ingredients.exclude(food__recipe__in=related_recipes).values_list('id', flat=True)
        else:
            kwargs['ingredients'] = recipe_ingredients.values_list('id', flat=True)

        list_recipe = list_from_recipe(**kwargs)
        if related:
            servings_factor = Decimal(instance.servings / instance.recipe.servings)
            kwargs['list_recipe'] = list_recipe
            food_recipes = recipe_ingredients.filter(food__recipe__in=related_recipes).values('food__recipe', 'amount')

            for recipe in related_recipes:
                kwargs['ingredients'] = []
                if exclude_onhand:
                    kwargs['ingredients'] = Ingredient.objects.filter(step__recipe=recipe, food__on_hand=False, space=space).values_list('id', flat=True)
                kwargs['recipe'] = recipe

                # assume related recipes are intended to be 'full sized' to parent recipe
                # Recipe1 (servings:4) includes StepRecipe2(servings:2) a Meal Plan serving size of 8 would assume 4 servings of StepRecipe2
                if recipe.id in [x['food__recipe'] for x in food_recipes if x['food__recipe'] == recipe.id]:
                    kwargs['servings'] = Decimal(recipe.servings) * sum([x['amount'] for x in food_recipes if x['food__recipe'] == recipe.id]) * servings_factor
                else:
                    # TODO: When modifying step recipes to allow serving size - will need to update this
                    kwargs['servings'] = Decimal(recipe.servings) * servings_factor

                list_from_recipe(**kwargs, append=True)
