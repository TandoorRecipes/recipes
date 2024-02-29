from functools import wraps

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector
from django.core.cache import caches
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import translation
from django_scopes import scope, scopes_disabled

from cookbook.helper.cache_helper import CacheHelper
from cookbook.helper.shopping_helper import RecipeShoppingEditor
from cookbook.managers import DICTIONARY
from cookbook.models import (Food, MealPlan, PropertyType, Recipe, SearchFields, SearchPreference,
                             Step, Unit, UserPreference)

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


@receiver(post_save, sender=MealPlan)
def auto_add_shopping(sender, instance=None, created=False, weak=False, **kwargs):
    print("MEAL_AUTO_ADD Signal trying to auto add to shopping")
    if not instance:
        print("MEAL_AUTO_ADD Instance is none")
        return

    try:
        space = instance.get_space()
        user = instance.get_owner()
        with scope(space=space):
            slr_exists = instance.shoppinglistrecipe_set.exists()

        if not created and slr_exists:
            for x in instance.shoppinglistrecipe_set.all():
                # assuming that permissions checks for the MealPlan have happened upstream
                if instance.servings != x.servings:
                    SLR = RecipeShoppingEditor(id=x.id, user=user, space=instance.space)
                    SLR.edit_servings(servings=instance.servings)
        elif not user.userpreference.mealplan_autoadd_shopping or not instance.recipe:
            print("MEAL_AUTO_ADD No recipe or no setting")
            return

        if created:
            SLR = RecipeShoppingEditor(user=user, space=space)
            SLR.create(mealplan=instance, servings=instance.servings)
            print("MEAL_AUTO_ADD Created SLR")
    except AttributeError:
        pass


@receiver(post_save, sender=Unit)
def clear_unit_cache(sender, instance=None, created=False, **kwargs):
    if instance:
        caches['default'].delete(CacheHelper(instance.space).BASE_UNITS_CACHE_KEY)


@receiver(post_save, sender=PropertyType)
def clear_property_type_cache(sender, instance=None, created=False, **kwargs):
    if instance:
        caches['default'].delete(CacheHelper(instance.space).PROPERTY_TYPE_CACHE_KEY)
