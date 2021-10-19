from functools import wraps

from django.contrib.postgres.search import SearchVector
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import translation

from cookbook.managers import DICTIONARY
from cookbook.models import Food, FoodInheritField, Recipe, Step


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
