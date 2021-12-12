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

    # TODO figure out how to generalize this
    # apply changes to direct children - depend on save signals for those objects to cascade inheritance down
    _save = []
    for child in instance.get_children().filter(inherit=True).exclude(ignore_inherit__field='ignore_shopping'):
        child.ignore_shopping = instance.ignore_shopping
        _save.append(child)
    # don't cascade empty supermarket category
    if instance.supermarket_category:
        # apply changes to direct children - depend on save signals for those objects to cascade inheritance down
        for child in instance.get_children().filter(inherit=True).exclude(ignore_inherit__field='supermarket_category'):
            child.supermarket_category = instance.supermarket_category
            _save.append(child)
    for child in set(_save):
        child.save()


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

        list_recipe = list_from_recipe(**kwargs)
