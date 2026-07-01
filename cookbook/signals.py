from functools import wraps

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector
from django.core.cache import caches
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.utils import translation
from django_scopes import scopes_disabled

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.unit_conversion_helper import UnitConversionHelper
from cookbook.managers import DICTIONARY
from cookbook.models import Food, PropertyType, Recipe, SearchFields, SearchPreference, Step, Unit, UserPreference, UserSpace

SQLITE = True
if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    SQLITE = False


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


@receiver(post_save, sender=User)
def create_user_preference(sender, instance=None, created=False, **kwargs):
    if created:
        with scopes_disabled():
            UserPreference.objects.get_or_create(user=instance)


@receiver(post_save, sender=SearchPreference)
def create_search_preference(sender, instance=None, created=False, **kwargs):
    if created:
        with scopes_disabled():
            instance.unaccent.add(SearchFields.objects.get(name='Name'))
            instance.icontains.add(SearchFields.objects.get(name='Name'))
            instance.trigram.add(SearchFields.objects.get(name='Name'))


@receiver(post_save, sender=Recipe)
@skip_signal
def update_recipe_search_vector(sender, instance=None, created=False, **kwargs):
    if SQLITE:
        return
    language = DICTIONARY.get(translation.get_language(), 'simple')
    # these indexed fields are space wide, reading user preferences would lead to inconsistent behavior
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
    if SQLITE:
        return
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

    inherit = instance.inherit_fields.all()
    # nothing to apply from parent and nothing to apply to children
    if (not instance.parent or inherit.count() == 0) and instance.numchild == 0:
        return

    inherit = inherit.values_list('field', flat=True)
    # apply changes from parent to instance for each inherited field
    if instance.parent and inherit.count() > 0:
        parent = instance.get_parent()
        for field in ['ignore_shopping', 'substitute_children', 'substitute_siblings']:
            if field in inherit:
                setattr(instance, field, getattr(parent, field, None))
        # if supermarket_category is not set, do not cascade - if this becomes non-intuitive can change
        if 'supermarket_category' in inherit and parent.supermarket_category:
            instance.supermarket_category = parent.supermarket_category
        try:
            instance.skip_signal = True
            instance.save()
        finally:
            del instance.skip_signal

    # apply changes to direct children - depend on save signals for those objects to cascade inheritance down
    for child in instance.get_children().filter(inherit_fields__in=Food.inheritable_fields):
        # set inherited field values
        for field in (inherit_fields := ['ignore_shopping', 'substitute_children', 'substitute_siblings']):
            if field in instance.inherit_fields.values_list('field', flat=True):
                setattr(child, field, getattr(instance, field, None))

        # don't cascade empty supermarket category
        if instance.supermarket_category and 'supermarket_category' in inherit_fields:
            setattr(child, 'supermarket_category', getattr(instance, 'supermarket_category', None))

        child.save()


@receiver(post_save, sender=Unit)
def clear_unit_cache(sender, instance=None, created=False, **kwargs):
    if instance:
        caches['default'].delete(CacheHelper(instance.space).BASE_UNITS_CACHE_KEY)
        # Also clear class-level cache used by UnitConversionHelper
        UnitConversionHelper._base_units_cache.pop(instance.space.id, None)


@receiver(post_save, sender=PropertyType)
def clear_property_type_cache(sender, instance=None, created=False, **kwargs):
    if instance:
        caches['default'].delete(CacheHelper(instance.space).PROPERTY_TYPE_CACHE_KEY)


@receiver(pre_save, sender=UserSpace)
def capture_old_household(sender, instance=None, **kwargs):
    """Stash the previous household_id so post_save can invalidate the old cache."""
    if instance and instance.pk:
        try:
            instance._old_household_id = UserSpace.objects.filter(pk=instance.pk).values_list('household_id', flat=True).first()
        except Exception:
            instance._old_household_id = None
    else:
        instance._old_household_id = None


def _fan_out_household_cache_delete(space_id, household_id):
    """Delete per-user cache keys for every current member of a household."""
    for member_user_id in UserSpace.objects.filter(
        space_id=space_id, household_id=household_id
    ).values_list('user_id', flat=True):
        caches['default'].delete(f'household_user_ids_{space_id}_{household_id}_user_{member_user_id}')


@receiver(post_save, sender=UserSpace)
def invalidate_household_cache_on_save(sender, instance=None, **kwargs):
    if not instance:
        return
    # Invalidate the new household's cache (fan out — cache is per-user)
    if instance.household_id:
        _fan_out_household_cache_delete(instance.space_id, instance.household_id)
    # Invalidate the old household's cache if it changed. The fan-out skips
    # this user (they're no longer a member), so delete their key explicitly.
    old_household_id = getattr(instance, '_old_household_id', None)
    if old_household_id and old_household_id != instance.household_id:
        _fan_out_household_cache_delete(instance.space_id, old_household_id)
        caches['default'].delete(f'household_user_ids_{instance.space_id}_{old_household_id}_user_{instance.user_id}')
    # Always invalidate the per-user fallback cache for this user
    caches['default'].delete(f'household_user_ids_{instance.space_id}_user_{instance.user_id}')


@receiver(post_delete, sender=UserSpace)
def invalidate_household_cache_on_delete(sender, instance=None, **kwargs):
    if not instance:
        return
    if instance.household_id:
        _fan_out_household_cache_delete(instance.space_id, instance.household_id)
        # The deleted UserSpace is gone from the DB, so the fan-out missed it.
        caches['default'].delete(f'household_user_ids_{instance.space_id}_{instance.household_id}_user_{instance.user_id}')
    caches['default'].delete(f'household_user_ids_{instance.space_id}_user_{instance.user_id}')
