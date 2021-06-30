from django.contrib.postgres.search import SearchVector
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import translation

from cookbook.models import Recipe, Step
from cookbook.managers import DICTIONARY


# TODO there is probably a way to generalize this
@receiver(post_save, sender=Recipe)
def update_recipe_search_vector(sender, instance=None, created=False, **kwargs):
    if not instance:
        return

    # needed to ensure search vector update doesn't trigger recursion
    if hasattr(instance, '_dirty'):
        return

    language = DICTIONARY.get(translation.get_language(), 'simple')
    instance.name_search_vector = SearchVector('name__unaccent', weight='A', config=language)
    instance.desc_search_vector = SearchVector('description__unaccent', weight='C', config=language)

    try:
        instance._dirty = True
        instance.save()
    finally:
        del instance._dirty


@receiver(post_save, sender=Step)
def update_step_search_vector(sender, instance=None, created=False, **kwargs):
    if not instance:
        return

    # needed to ensure search vector update doesn't trigger recursion
    if hasattr(instance, '_dirty'):
        return

    language = DICTIONARY.get(translation.get_language(), 'simple')
    instance.search_vector = SearchVector('instruction__unaccent', weight='B', config=language)

    try:
        instance._dirty = True
        instance.save()
    finally:
        del instance._dirty
