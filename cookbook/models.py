import operator
import pathlib
import re
import uuid
from datetime import date, timedelta

import oauth2_provider.models
from annoying.fields import AutoOneToOneField
from django.contrib import auth
from django.contrib.auth.models import Group, User
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile
from django.core.validators import MinLengthValidator
from django.db import IntegrityError, models
from django.db.models import Avg, Index, Max, ProtectedError, Q
from django.db.models.fields.related import ManyToManyField
from django.db.models.functions import Substr
from django.utils import timezone
from django.utils.translation import gettext as _
from django_prometheus.models import ExportModelOperationsMixin
from django_scopes import ScopedManager, scopes_disabled
from PIL import Image
from treebeard.mp_tree import MP_Node, MP_NodeManager

from recipes.settings import (COMMENT_PREF_DEFAULT, FRACTION_PREF_DEFAULT, KJ_PREF_DEFAULT,
                              SORT_TREE_BY_NAME, STICKY_NAV_PREF_DEFAULT, MAX_OWNED_SPACES_PREF_DEFAULT)


def get_user_display_name(self):
    if not (name := f"{self.first_name} {self.last_name}") == " ":
        return name
    else:
        return self.username


def get_active_space(self):
    """
    Returns the active space of a user or in case no space is actives raises an *** exception
    CAREFUL: cannot be used in django scopes with scope() function because passing None as a scope context means no space checking is enforced (at least I think)!!
    :param self: user
    :return: space currently active for user
    """
    try:
        return self.userspace_set.filter(active=True).first().space
    except AttributeError:
        return None


def get_shopping_share(self):
    # get list of users that shared shopping list with user. Django ORM forbids this type of query, so raw is required
    return User.objects.raw(' '.join([
        'SELECT auth_user.id FROM auth_user',
        'INNER JOIN cookbook_userpreference',
        'ON (auth_user.id = cookbook_userpreference.user_id)',
        'INNER JOIN cookbook_userpreference_shopping_share',
        'ON (cookbook_userpreference.user_id = cookbook_userpreference_shopping_share.userpreference_id)',
        'WHERE cookbook_userpreference_shopping_share.user_id ={}'.format(self.id)
    ]))


auth.models.User.add_to_class('get_user_display_name', get_user_display_name)
auth.models.User.add_to_class('get_shopping_share', get_shopping_share)
auth.models.User.add_to_class('get_active_space', get_active_space)


def oauth_token_get_owner(self):
    return self.user


oauth2_provider.models.AccessToken.add_to_class('get_owner', oauth_token_get_owner)


def get_model_name(model):
    return ('_'.join(re.findall('[A-Z][^A-Z]*', model.__name__))).lower()


class TreeManager(MP_NodeManager):
    def create(self, *args, **kwargs):
        return self.get_or_create(*args, **kwargs)[0]

    # model.Manager get_or_create() is not compatible with MP_Tree
    def get_or_create(self, *args, **kwargs):
        kwargs['name'] = kwargs['name'].strip()
        if hasattr(self, 'space'):
            if obj := self.filter(name__iexact=kwargs['name'], space=kwargs['space']).first():
                return obj, False
        else:
            if obj := self.filter(name__iexact=kwargs['name']).first():
                return obj, False

        with scopes_disabled():
            try:
                defaults = kwargs.pop('defaults', None)
                if defaults:
                    kwargs = {**kwargs, **defaults}
                # ManyToMany fields can't be set this way, so pop them out to save for later
                fields = [field.name for field in self.model._meta.get_fields() if issubclass(type(field), ManyToManyField)]
                many_to_many = {field: kwargs.pop(field) for field in list(kwargs) if field in fields}
                obj = self.model.add_root(**kwargs)
                for field in many_to_many:
                    field_model = getattr(obj, field).model
                    for related_obj in many_to_many[field]:
                        if isinstance(related_obj, User):
                            getattr(obj, field).add(field_model.objects.get(id=related_obj.id))
                        else:
                            getattr(obj, field).add(field_model.objects.get(**dict(related_obj)))
                return obj, True
            except IntegrityError as e:
                if 'Key (path)' in e.args[0]:
                    self.model.fix_tree(fix_paths=True)
                    return self.model.add_root(**kwargs), True


class TreeModel(MP_Node):
    _full_name_separator = ' > '

    def __str__(self):
        return f"{self.name}"

    @property
    def parent(self):
        parent = self.get_parent()
        if parent:
            return self.get_parent().id
        return None

    @property
    def full_name(self):
        """
        Returns a string representation of a tree node and it's ancestors,
        e.g. 'Cuisine > Asian > Chinese > Catonese'.
        """
        names = [node.name for node in self.get_ancestors_and_self()]
        return self._full_name_separator.join(names)

    def get_ancestors_and_self(self):
        """
        Gets ancestors and includes itself. Use treebeard's get_ancestors
        if you don't want to include the node itself. It's a separate
        function as it's commonly used in templates.
        """
        if self.is_root():
            return [self]
        return list(self.get_ancestors()) + [self]

    def get_descendants_and_self(self):
        """
        Gets descendants and includes itself. Use treebeard's get_descendants
        if you don't want to include the node itself. It's a separate
        function as it's commonly used in templates.
        """
        return self.get_tree(self)

    def has_children(self):
        return self.get_num_children() > 0

    def get_num_children(self):
        return self.get_children().count()

    # use self.objects.get_or_create() instead
    @classmethod
    def add_root(self, **kwargs):
        with scopes_disabled():
            return super().add_root(**kwargs)

    # i'm 99% sure there is a more idiomatic way to do this subclassing MP_NodeQuerySet
    @staticmethod
    def include_descendants(queryset=None, filter=None):
        """
        :param queryset: Model Queryset to add descendants
        :param filter: Filter (exclude) the descendants nodes with the provided Q filter
        """
        descendants = Q()
        # TODO filter the queryset nodes to exclude descendants of objects in the queryset
        nodes = queryset.values('path', 'depth')
        for node in nodes:
            descendants |= Q(path__startswith=node['path'], depth__gt=node['depth'])

        return queryset.model.objects.filter(Q(id__in=queryset.values_list('id')) | descendants)

    def exclude_descendants(queryset=None, filter=None):
        """
        :param queryset: Model Queryset to add descendants
        :param filter: Filter (include) the descendants nodes with the provided Q filter
        """
        descendants = Q()
        nodes = queryset.values('path', 'depth')
        for node in nodes:
            descendants |= Q(path__startswith=node['path'], depth__gt=node['depth'])

        return queryset.model.objects.filter(id__in=queryset.values_list('id')).exclude(descendants)

    def include_ancestors(queryset=None):
        """
        :param queryset: Model Queryset to add ancestors
        :param filter: Filter (include) the ancestors nodes with the provided Q filter
        """

        queryset = queryset.annotate(root=Substr('path', 1, queryset.model.steplen))
        nodes = list(set(queryset.values_list('root', 'depth')))

        ancestors = Q()
        for node in nodes:
            ancestors |= Q(path__startswith=node[0], depth__lt=node[1])
        return queryset.model.objects.filter(Q(id__in=queryset.values_list('id')) | ancestors)

    class Meta:
        abstract = True


class MergeModelMixin:

    def merge_into(self, target):
        """
        very simple merge function that replaces the current instance with the target instance
        :param target: target object
        :return: target with data merged
        """

        if self == target:
            raise ValueError('Cannot merge an object with itself')

        if getattr(self, 'space', 0) != getattr(target, 'space', 0):
            raise RuntimeError('Cannot merge objects from different spaces')

        if hasattr(self, 'get_descendants_and_self') and target in callable(getattr(self, 'get_descendants_and_self')):
            raise RuntimeError('Cannot merge parent (source) with child (target) object')

        # TODO copy field values


class PermissionModelMixin:
    @staticmethod
    def get_space_key():
        return ('space',)

    def get_space_kwarg(self):
        return '__'.join(self.get_space_key())

    def get_owner(self):
        if getattr(self, 'created_by', None):
            return self.created_by
        if getattr(self, 'user', None):
            return self.user
        return None

    def get_shared(self):
        if getattr(self, 'shared', None):
            return self.shared.all()
        return []

    def get_space(self):
        p = '.'.join(self.get_space_key())
        try:
            if space := operator.attrgetter(p)(self):
                return space
        except AttributeError:
            raise NotImplementedError('get space for method not implemented and standard fields not available')


class FoodInheritField(models.Model, PermissionModelMixin):
    field = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return _(self.name)

    @staticmethod
    def get_name(self):
        return _(self.name)


class Space(ExportModelOperationsMixin('space'), models.Model):
    # TODO remove redundant theming constants
    # Themes
    BLANK = 'BLANK'
    TANDOOR = 'TANDOOR'
    TANDOOR_DARK = 'TANDOOR_DARK'
    BOOTSTRAP = 'BOOTSTRAP'
    DARKLY = 'DARKLY'
    FLATLY = 'FLATLY'
    SUPERHERO = 'SUPERHERO'

    THEMES = (
        (BLANK, '-------'),
        (TANDOOR, 'Tandoor'),
        (BOOTSTRAP, 'Bootstrap'),
        (DARKLY, 'Darkly'),
        (FLATLY, 'Flatly'),
        (SUPERHERO, 'Superhero'),
        (TANDOOR_DARK, 'Tandoor Dark (INCOMPLETE)'),
    )

    LIGHT = 'LIGHT'
    DARK = 'DARK'

    NAV_TEXT_COLORS = (
        (BLANK, '-------'),
        (LIGHT, 'Light'),
        (DARK, 'Dark')
    )

    name = models.CharField(max_length=128, default='Default')

    image = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_image')
    space_theme = models.CharField(choices=THEMES, max_length=128, default=BLANK)
    custom_space_theme = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_theme')
    nav_logo = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_nav_logo')
    nav_bg_color = models.CharField(max_length=8, default='', blank=True, )
    nav_text_color = models.CharField(max_length=16, choices=NAV_TEXT_COLORS, default=BLANK)
    app_name = models.CharField(max_length=40, null=True, blank=True, )
    logo_color_32 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_32')
    logo_color_128 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_128')
    logo_color_144 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_144')
    logo_color_180 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_180')
    logo_color_192 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_192')
    logo_color_512 = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_512')
    logo_color_svg = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='space_logo_color_svg')

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.CharField(max_length=512, default='', blank=True)
    max_recipes = models.IntegerField(default=0)
    max_file_storage_mb = models.IntegerField(default=0, help_text=_('Maximum file storage for space in MB. 0 for unlimited, -1 to disable file upload.'))
    max_users = models.IntegerField(default=0)
    allow_sharing = models.BooleanField(default=True)
    no_sharing_limit = models.BooleanField(default=False)
    demo = models.BooleanField(default=False)
    food_inherit = models.ManyToManyField(FoodInheritField, blank=True)

    internal_note = models.TextField(blank=True, null=True)

    def safe_delete(self):
        """
        Safely deletes a space by deleting all objects belonging to the space first and then deleting the space itself
        """
        CookLog.objects.filter(space=self).delete()
        ViewLog.objects.filter(space=self).delete()
        ImportLog.objects.filter(space=self).delete()
        BookmarkletImport.objects.filter(space=self).delete()
        CustomFilter.objects.filter(space=self).delete()

        Property.objects.filter(space=self).delete()
        PropertyType.objects.filter(space=self).delete()

        Comment.objects.filter(recipe__space=self).delete()
        Ingredient.objects.filter(space=self).delete()
        Keyword.objects.filter(space=self).delete()

        # delete food in batches because treabeard might fail to delete otherwise
        while Food.objects.filter(space=self).count() > 0:
            pks = Food.objects.filter(space=self).values_list('pk')[:200]
            Food.objects.filter(pk__in=pks).delete()

        Unit.objects.filter(space=self).delete()
        Step.objects.filter(space=self).delete()
        NutritionInformation.objects.filter(space=self).delete()
        RecipeBookEntry.objects.filter(book__space=self).delete()
        RecipeBook.objects.filter(space=self).delete()
        MealType.objects.filter(space=self).delete()
        MealPlan.objects.filter(space=self).delete()
        ShareLink.objects.filter(space=self).delete()
        Recipe.objects.filter(space=self).delete()

        RecipeImport.objects.filter(space=self).delete()
        SyncLog.objects.filter(sync__space=self).delete()
        Sync.objects.filter(space=self).delete()
        Storage.objects.filter(space=self).delete()
        ConnectorConfig.objects.filter(space=self).delete()

        ShoppingListEntry.objects.filter(space=self).delete()
        ShoppingListRecipe.objects.filter(recipe__space=self).delete()

        SupermarketCategoryRelation.objects.filter(supermarket__space=self).delete()
        SupermarketCategory.objects.filter(space=self).delete()
        Supermarket.objects.filter(space=self).delete()

        UserFile.objects.filter(space=self).delete()
        UserSpace.objects.filter(space=self).delete()
        Automation.objects.filter(space=self).delete()
        InviteLink.objects.filter(space=self).delete()
        TelegramBot.objects.filter(space=self).delete()
        self.delete()

    def get_owner(self):
        return self.created_by

    def get_space(self):
        return self

    def __str__(self):
        return self.name


class ConnectorConfig(models.Model, PermissionModelMixin):
    HOMEASSISTANT = 'HomeAssistant'
    CONNECTER_TYPE = ((HOMEASSISTANT, 'HomeAssistant'),)

    name = models.CharField(max_length=128, validators=[MinLengthValidator(1)])
    type = models.CharField(
        choices=CONNECTER_TYPE, max_length=128, default=HOMEASSISTANT
    )

    enabled = models.BooleanField(default=True, help_text="Is Connector Enabled")
    on_shopping_list_entry_created_enabled = models.BooleanField(default=False)
    on_shopping_list_entry_updated_enabled = models.BooleanField(default=False)
    on_shopping_list_entry_deleted_enabled = models.BooleanField(default=False)
    supports_description_field = models.BooleanField(default=True, help_text="Does the todo entity support the description field")

    url = models.URLField(blank=True, null=True)
    token = models.CharField(max_length=512, blank=True, null=True)
    todo_entity = models.CharField(max_length=128, blank=True, null=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')


class UserPreference(models.Model, PermissionModelMixin):
    # Themes
    BOOTSTRAP = 'BOOTSTRAP'
    DARKLY = 'DARKLY'
    FLATLY = 'FLATLY'
    SUPERHERO = 'SUPERHERO'
    TANDOOR = 'TANDOOR'
    TANDOOR_DARK = 'TANDOOR_DARK'

    THEMES = (
        (TANDOOR, 'Tandoor'),
        (BOOTSTRAP, 'Bootstrap'),
        (DARKLY, 'Darkly'),
        (FLATLY, 'Flatly'),
        (SUPERHERO, 'Superhero'),
        (TANDOOR_DARK, 'Tandoor Dark (INCOMPLETE)'),
    )

    # Nav colors
    LIGHT = 'LIGHT'
    DARK = 'DARK'

    NAV_TEXT_COLORS = (
        (LIGHT, 'Light'),
        (DARK, 'Dark')
    )

    # Default Page
    SEARCH = 'SEARCH'
    PLAN = 'PLAN'
    BOOKS = 'BOOKS'
    SHOPPING = 'SHOPPING'

    PAGES = (
        (SEARCH, _('Search')),
        (PLAN, _('Meal-Plan')),
        (BOOKS, _('Books')),
        (SHOPPING, _('Shopping')),
    )

    user = AutoOneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    image = models.ForeignKey("UserFile", on_delete=models.SET_NULL, null=True, blank=True, related_name='user_image')

    theme = models.CharField(choices=THEMES, max_length=128, default=TANDOOR)
    nav_bg_color = models.CharField(max_length=8, default='#ddbf86')
    nav_text_color = models.CharField(max_length=16, choices=NAV_TEXT_COLORS, default=DARK)
    nav_show_logo = models.BooleanField(default=True)
    nav_sticky = models.BooleanField(default=STICKY_NAV_PREF_DEFAULT)
    max_owned_spaces = models.IntegerField(default=MAX_OWNED_SPACES_PREF_DEFAULT)
    default_unit = models.CharField(max_length=32, default='g')
    use_fractions = models.BooleanField(default=FRACTION_PREF_DEFAULT)
    use_kj = models.BooleanField(default=KJ_PREF_DEFAULT)
    default_page = models.CharField(choices=PAGES, max_length=64, default=SEARCH)
    plan_share = models.ManyToManyField(User, blank=True, related_name='plan_share_default')
    shopping_share = models.ManyToManyField(User, blank=True, related_name='shopping_share')
    ingredient_decimals = models.IntegerField(default=2)
    comments = models.BooleanField(default=COMMENT_PREF_DEFAULT)
    shopping_auto_sync = models.IntegerField(default=5)
    mealplan_autoadd_shopping = models.BooleanField(default=False)
    mealplan_autoexclude_onhand = models.BooleanField(default=True)
    mealplan_autoinclude_related = models.BooleanField(default=True)
    shopping_add_onhand = models.BooleanField(default=False)
    filter_to_supermarket = models.BooleanField(default=False)
    left_handed = models.BooleanField(default=False)
    show_step_ingredients = models.BooleanField(default=True)
    default_delay = models.DecimalField(default=4, max_digits=8, decimal_places=4)
    shopping_recent_days = models.PositiveIntegerField(default=7)
    csv_delim = models.CharField(max_length=2, default=",")
    csv_prefix = models.CharField(max_length=10, blank=True, )

    created_at = models.DateTimeField(auto_now_add=True)
    objects = ScopedManager(space='space')

    def save(self, *args, **kwargs):
        if not self.pk:
            self.max_owned_spaces = MAX_OWNED_SPACES_PREF_DEFAULT
            self.comments = COMMENT_PREF_DEFAULT
            self.nav_sticky = STICKY_NAV_PREF_DEFAULT
            self.use_kj = KJ_PREF_DEFAULT
            self.use_fractions = FRACTION_PREF_DEFAULT

        return super().save(*args, **kwargs)

    def __str__(self):
        return str(self.user)


class UserSpace(models.Model, PermissionModelMixin):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    groups = models.ManyToManyField(Group)

    # there should always only be one active space although permission methods are written in such a way
    # that having more than one active space should just break certain parts of the application and not leak any data
    active = models.BooleanField(default=False)

    invite_link = models.ForeignKey("InviteLink", on_delete=models.PROTECT, null=True, blank=True)
    internal_note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Storage(models.Model, PermissionModelMixin):
    DROPBOX = 'DB'
    NEXTCLOUD = 'NEXTCLOUD'
    LOCAL = 'LOCAL'
    STORAGE_TYPES = ((DROPBOX, 'Dropbox'), (NEXTCLOUD, 'Nextcloud'), (LOCAL, 'Local'))

    name = models.CharField(max_length=128)
    method = models.CharField(
        choices=STORAGE_TYPES, max_length=128, default=DROPBOX
    )
    username = models.CharField(max_length=128, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    token = models.CharField(max_length=512, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    path = models.CharField(blank=True, default='', max_length=256)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name


class Sync(models.Model, PermissionModelMixin):
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT)
    path = models.CharField(max_length=512, default="")
    active = models.BooleanField(default=True)
    last_checked = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.path


class SupermarketCategory(models.Model, PermissionModelMixin, MergeModelMixin):
    name = models.CharField(max_length=128, validators=[MinLengthValidator(1)])
    description = models.TextField(blank=True, null=True)
    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name

    def merge_into(self, target):
        super().merge_into(target)

        Food.objects.filter(supermarket_category=self).update(supermarket_category=target)
        SupermarketCategoryRelation.objects.filter(category=self).update(category=target)
        self.delete()
        return target

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='smc_unique_name_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='supermarket_category_unique_open_data_slug_per_space')
        ]


class Supermarket(models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128, validators=[MinLengthValidator(1)])
    description = models.TextField(blank=True, null=True)
    categories = models.ManyToManyField(SupermarketCategory, through='SupermarketCategoryRelation')
    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='sm_unique_name_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='supermarket_unique_open_data_slug_per_space')
        ]


class SupermarketCategoryRelation(models.Model, PermissionModelMixin):
    supermarket = models.ForeignKey(Supermarket, on_delete=models.CASCADE, related_name='category_to_supermarket')
    category = models.ForeignKey(SupermarketCategory, on_delete=models.CASCADE, related_name='category_to_supermarket')
    order = models.IntegerField(default=0)

    objects = ScopedManager(space='supermarket__space')

    @staticmethod
    def get_space_key():
        return 'supermarket', 'space'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['supermarket', 'category'], name='unique_sm_category_relation')
        ]
        ordering = ('order',)


class SyncLog(models.Model, PermissionModelMixin):
    sync = models.ForeignKey(Sync, on_delete=models.CASCADE)
    status = models.CharField(max_length=32)
    msg = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ScopedManager(space='sync__space')

    def __str__(self):
        return f"{self.created_at}:{self.sync} - {self.status}"


class Keyword(ExportModelOperationsMixin('keyword'), TreeModel, PermissionModelMixin):
    if SORT_TREE_BY_NAME:
        node_order_by = ['name']
    name = models.CharField(max_length=64)
    description = models.TextField(default="", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # TODO deprecate
    updated_at = models.DateTimeField(auto_now=True)  # TODO deprecate

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space', _manager_class=TreeManager)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='kw_unique_name_per_space')
        ]
        indexes = (Index(fields=['id', 'name']),)


class Unit(ExportModelOperationsMixin('unit'), models.Model, PermissionModelMixin, MergeModelMixin):
    name = models.CharField(max_length=128, validators=[MinLengthValidator(1)])
    plural_name = models.CharField(max_length=128, null=True, blank=True, default=None)
    description = models.TextField(blank=True, null=True)
    base_unit = models.TextField(max_length=256, null=True, blank=True, default=None)
    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def merge_into(self, target):
        super().merge_into(target)

        Ingredient.objects.filter(unit=self).update(unit=target)
        ShoppingListEntry.objects.filter(unit=self).update(unit=target)
        Food.objects.filter(properties_food_unit=self).update(properties_food_unit=target)
        Food.objects.filter(preferred_unit=self).update(preferred_unit=target)
        Food.objects.filter(preferred_shopping_unit=self).update(preferred_shopping_unit=target)
        self.delete()
        return target

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='u_unique_name_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='unit_unique_open_data_slug_per_space')
        ]


class Food(ExportModelOperationsMixin('food'), TreeModel, PermissionModelMixin):
    # TODO when savings a food as substitute children - assume children and descednants are also substitutes for siblings
    # exclude fields not implemented yet
    inheritable_fields = FoodInheritField.objects.exclude(field__in=['diet', 'substitute', ])
    # TODO add inherit children_inherit, parent_inherit, Do Not Inherit

    # WARNING: Food inheritance relies on post_save signals, avoid using UPDATE to update Food objects unless you intend to bypass those signals
    if SORT_TREE_BY_NAME:
        node_order_by = ['name']
    name = models.CharField(max_length=128, validators=[MinLengthValidator(1)])
    plural_name = models.CharField(max_length=128, null=True, blank=True, default=None)
    recipe = models.ForeignKey('Recipe', null=True, blank=True, on_delete=models.SET_NULL)
    url = models.CharField(max_length=1024, blank=True, null=True, default='')
    supermarket_category = models.ForeignKey(SupermarketCategory, null=True, blank=True, on_delete=models.SET_NULL)  # inherited field
    ignore_shopping = models.BooleanField(default=False)  # inherited field
    onhand_users = models.ManyToManyField(User, blank=True)
    description = models.TextField(default='', blank=True)
    inherit_fields = models.ManyToManyField(FoodInheritField, blank=True)
    substitute = models.ManyToManyField("self", blank=True)
    substitute_siblings = models.BooleanField(default=False)
    substitute_children = models.BooleanField(default=False)
    child_inherit_fields = models.ManyToManyField(FoodInheritField, blank=True, related_name='child_inherit')

    properties = models.ManyToManyField("Property", blank=True, through='FoodProperty')
    properties_food_amount = models.DecimalField(default=100, max_digits=16, decimal_places=2, blank=True)
    properties_food_unit = models.ForeignKey(Unit, on_delete=models.PROTECT, blank=True, null=True)

    preferred_unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, default=None, related_name='preferred_unit')
    preferred_shopping_unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, default=None, related_name='preferred_shopping_unit')
    fdc_id = models.IntegerField(null=True, default=None, blank=True)

    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space', _manager_class=TreeManager)

    def __str__(self):
        return self.name

    def merge_into(self, target):
        """
        very simple merge function that replaces the current food with the target food
        also replaces a few attributes on the target field if they were empty before
        :param target: target food object
        :return: target with data merged
        """
        if self == target:
            raise ValueError('Cannot merge an object with itself')

        if self.space != target.space:
            raise RuntimeError('Cannot merge objects from different spaces')

        try:
            if target in self.get_descendants_and_self():
                raise RuntimeError('Cannot merge parent (source) with child (target) object')
        except AttributeError:
            pass  # AttributeError is raised when the object is not a tree and thus does not have the get_descendants_and_self() function

        self.properties.all().delete()
        self.properties.clear()
        Ingredient.objects.filter(food=self).update(food=target)
        ShoppingListEntry.objects.filter(food=self).update(food=target)
        self.delete()
        return target

    def delete(self):
        if self.ingredient_set.all().exclude(step=None).count() > 0:
            raise ProtectedError(self.name + _(" is part of a recipe step and cannot be deleted"), self.ingredient_set.all().exclude(step=None))
        else:
            return super().delete()

    # MP_Tree move uses raw SQL to execute move, override behavior to force a save triggering post_save signal

    def move(self, *args, **kwargs):
        super().move(*args, **kwargs)
        # treebeard bypasses ORM, need to explicity save to trigger post save signals retrieve the object again to avoid writing previous state back to disk
        obj = self.__class__.objects.get(id=self.id)
        if parent := obj.get_parent():
            # child should inherit what the parent defines it should inherit
            fields = list(parent.child_inherit_fields.all() or parent.inherit_fields.all())
            if len(fields) > 0:
                obj.inherit_fields.set(fields)
        obj.save()

    @staticmethod
    def reset_inheritance(space=None, food=None):
        # resets inherited fields to the space defaults and updates all inherited fields to root object values
        if food:
            # if child inherit fields is preset children should be set to that, otherwise inherit this foods inherited fields
            inherit = list((food.child_inherit_fields.all() or food.inherit_fields.all()).values('id', 'field'))
            tree_filter = Q(path__startswith=food.path, space=space, depth=food.depth + 1)
        else:
            inherit = list(space.food_inherit.all().values('id', 'field'))
            tree_filter = Q(space=space)

        # remove all inherited fields from food
        trough = Food.inherit_fields.through
        trough.objects.all().delete()

        # food is going to inherit attributes
        if len(inherit) > 0:
            # ManyToMany cannot be updated through an UPDATE operation
            for i in inherit:
                trough.objects.bulk_create([
                    trough(food_id=x, foodinheritfield_id=i['id'])
                    for x in Food.objects.filter(tree_filter).values_list('id', flat=True)
                ])

            inherit = [x['field'] for x in inherit]
            for field in ['ignore_shopping', 'substitute_children', 'substitute_siblings']:
                if field in inherit:
                    if food and getattr(food, field, None):
                        food.get_descendants().update(**{f"{field}": True})
                    elif food and not getattr(food, field, True):
                        food.get_descendants().update(**{f"{field}": False})
                    else:
                        # get food at root that have children that need updated
                        Food.include_descendants(queryset=Food.objects.filter(depth=1, numchild__gt=0, **{f"{field}": True}, space=space)).update(**{f"{field}": True})
                        Food.include_descendants(queryset=Food.objects.filter(depth=1, numchild__gt=0, **{f"{field}": False}, space=space)).update(**{f"{field}": False})

            if 'supermarket_category' in inherit:
                # when supermarket_category is null or blank assuming it is not set and not intended to be blank for all descedants
                if food and food.supermarket_category:
                    food.get_descendants().update(supermarket_category=food.supermarket_category)
                elif food is None:
                    # find top node that has category set
                    category_roots = Food.exclude_descendants(queryset=Food.objects.filter(supermarket_category__isnull=False, numchild__gt=0, space=space))
                    for root in category_roots:
                        root.get_descendants().update(supermarket_category=root.supermarket_category)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='f_unique_name_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='food_unique_open_data_slug_per_space')
        ]
        indexes = (
            Index(fields=['id']),
            Index(fields=['name']),
        )


class UnitConversion(ExportModelOperationsMixin('unit_conversion'), models.Model, PermissionModelMixin):
    base_amount = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    base_unit = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='unit_conversion_base_relation')
    converted_amount = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    converted_unit = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='unit_conversion_converted_relation')

    food = models.ForeignKey('Food', on_delete=models.CASCADE, null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.base_amount} {self.base_unit} -> {self.converted_amount} {self.converted_unit} {self.food}'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'base_unit', 'converted_unit', 'food'], name='f_unique_conversion_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='unit_conversion_unique_open_data_slug_per_space')
        ]


class Ingredient(ExportModelOperationsMixin('ingredient'), models.Model, PermissionModelMixin):
    # delete method on Food and Unit checks if they are part of a Recipe, if it is raises a ProtectedError instead of cascading the delete
    food = models.ForeignKey(Food, on_delete=models.CASCADE, null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    note = models.CharField(max_length=256, null=True, blank=True)
    is_header = models.BooleanField(default=False)
    no_amount = models.BooleanField(default=False)
    always_use_plural_unit = models.BooleanField(default=False)
    always_use_plural_food = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    original_text = models.CharField(max_length=512, null=True, blank=True, default=None)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.pk}: {self.amount} ' + (self.food.name if self.food else ' ') + (self.unit.name if self.unit else '')

    class Meta:
        ordering = ['order', 'pk']
        indexes = (
            Index(fields=['id']),
        )


class Step(ExportModelOperationsMixin('step'), models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128, default='', blank=True)
    instruction = models.TextField(blank=True)
    ingredients = models.ManyToManyField(Ingredient, blank=True)
    time = models.IntegerField(default=0, blank=True)
    order = models.IntegerField(default=0)
    file = models.ForeignKey('UserFile', on_delete=models.PROTECT, null=True, blank=True)
    show_as_header = models.BooleanField(default=True)
    show_ingredients_table = models.BooleanField(default=True)
    search_vector = SearchVectorField(null=True)
    step_recipe = models.ForeignKey('Recipe', default=None, blank=True, null=True, on_delete=models.PROTECT)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def get_instruction_render(self):
        from cookbook.helper.template_helper import render_instructions
        return render_instructions(self)

    def __str__(self):
        if not self.recipe_set.exists():
            return f"{self.pk}: {_('Orphaned Step')}"
        return f"{self.pk}: {self.name}" if self.name else f"Step: {self.pk}"

    class Meta:
        ordering = ['order', 'pk']
        indexes = (GinIndex(fields=["search_vector"]),)


class PropertyType(models.Model, PermissionModelMixin, MergeModelMixin):
    NUTRITION = 'NUTRITION'
    ALLERGEN = 'ALLERGEN'
    PRICE = 'PRICE'
    GOAL = 'GOAL'
    OTHER = 'OTHER'

    name = models.CharField(max_length=128)
    unit = models.CharField(max_length=64, blank=True, null=True)
    order = models.IntegerField(default=0)
    description = models.CharField(max_length=512, blank=True, null=True)
    category = models.CharField(max_length=64, choices=((NUTRITION, _('Nutrition')), (ALLERGEN, _('Allergen')),
                                                        (PRICE, _('Price')), (GOAL, _('Goal')), (OTHER, _('Other'))), null=True, blank=True)
    open_data_slug = models.CharField(max_length=128, null=True, blank=True, default=None)

    fdc_id = models.IntegerField(null=True, default=None, blank=True)
    # TODO show if empty property?
    # TODO formatting property?

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.name}'

    def merge_into(self, target):
        super().merge_into(target)

        Property.objects.filter(property_type=self).update(property_type=target)
        self.delete()
        return target

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='property_type_unique_name_per_space'),
            models.UniqueConstraint(fields=['space', 'open_data_slug'], name='property_type_unique_open_data_slug_per_space')
        ]
        ordering = ('order',)


class Property(models.Model, PermissionModelMixin):
    property_amount = models.DecimalField(default=None, null=True, decimal_places=4, max_digits=32)
    property_type = models.ForeignKey(PropertyType, on_delete=models.PROTECT)

    open_data_food_slug = models.CharField(max_length=128, null=True, blank=True, default=None)  # field to hold food id when importing properties from the open data project

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.property_amount} {self.property_type.unit} {self.property_type.name}'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'property_type', 'open_data_food_slug'], name='property_unique_import_food_per_space')
        ]


class FoodProperty(models.Model):
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['food', 'property'], name='property_unique_food'),
        ]


class NutritionInformation(models.Model, PermissionModelMixin):
    fats = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    carbohydrates = models.DecimalField(
        default=0, decimal_places=16, max_digits=32
    )
    proteins = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    calories = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    source = models.CharField(max_length=512, default="", null=True, blank=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'Nutrition {self.pk}'


class RecipeManager(models.Manager.from_queryset(models.QuerySet)):
    def get_queryset(self):
        return super(RecipeManager, self).get_queryset().annotate(rating=Avg('cooklog__rating')).annotate(last_cooked=Max('cooklog__created_at'))


class Recipe(ExportModelOperationsMixin('recipe'), models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=512, blank=True, null=True)
    servings = models.IntegerField(default=1)
    servings_text = models.CharField(default='', blank=True, max_length=32)
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT, blank=True, null=True)
    file_uid = models.CharField(max_length=256, default="", blank=True)
    file_path = models.CharField(max_length=512, default="", blank=True)
    link = models.CharField(max_length=512, null=True, blank=True)
    cors_link = models.CharField(max_length=1024, null=True, blank=True)
    keywords = models.ManyToManyField(Keyword, blank=True)
    steps = models.ManyToManyField(Step, blank=True)
    working_time = models.IntegerField(default=0)
    waiting_time = models.IntegerField(default=0)
    internal = models.BooleanField(default=False)
    nutrition = models.ForeignKey(NutritionInformation, blank=True, null=True, on_delete=models.CASCADE)
    properties = models.ManyToManyField(Property, blank=True)
    show_ingredient_overview = models.BooleanField(default=True)
    private = models.BooleanField(default=False)
    shared = models.ManyToManyField(User, blank=True, related_name='recipe_shared_with')

    source_url = models.CharField(max_length=1024, default=None, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    name_search_vector = SearchVectorField(null=True)
    desc_search_vector = SearchVectorField(null=True)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    objects = ScopedManager(space='space', _manager_class=RecipeManager)

    def __str__(self):
        return self.name

    def get_related_recipes(self, levels=1):
        # recipes for step recipe
        step_recipes = Q(id__in=self.steps.exclude(step_recipe=None).values_list('step_recipe'))
        # recipes for foods
        food_recipes = Q(id__in=Food.objects.filter(ingredient__step__recipe=self).exclude(recipe=None).values_list('recipe'))
        related_recipes = Recipe.objects.filter(step_recipes | food_recipes)
        if levels == 1:
            return related_recipes

        # this can loop over multiple levels if you update the value of related_recipes at each step (maybe an array?)
        # for now keeping it at 2 levels max, should be sufficient in 99.9% of scenarios
        sub_step_recipes = Q(id__in=Step.objects.filter(recipe__in=related_recipes.values_list('steps')).exclude(step_recipe=None).values_list('step_recipe'))
        sub_food_recipes = Q(id__in=Food.objects.filter(ingredient__step__recipe__in=related_recipes).exclude(recipe=None).values_list('recipe'))
        return Recipe.objects.filter(Q(id__in=related_recipes.values_list('id')) | sub_step_recipes | sub_food_recipes)

    class Meta():
        indexes = (
            GinIndex(fields=["name_search_vector"]),
            GinIndex(fields=["desc_search_vector"]),
            Index(fields=['id']),
            Index(fields=['name']),
        )


class Comment(ExportModelOperationsMixin('comment'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ScopedManager(space='recipe__space')

    @staticmethod
    def get_space_key():
        return 'recipe', 'space'

    def get_space(self):
        return self.recipe.space

    def __str__(self):
        return self.text


class RecipeImport(models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name


class RecipeBook(ExportModelOperationsMixin('book'), models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    shared = models.ManyToManyField(User, blank=True, related_name='shared_with')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    filter = models.ForeignKey('cookbook.CustomFilter', null=True, blank=True, on_delete=models.SET_NULL)
    order = models.IntegerField(default=0)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name

    class Meta():
        indexes = (Index(fields=['name']),)


class RecipeBookEntry(ExportModelOperationsMixin('book_entry'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    book = models.ForeignKey(RecipeBook, on_delete=models.CASCADE)

    objects = ScopedManager(space='book__space')

    @staticmethod
    def get_space_key():
        return 'book', 'space'

    def __str__(self):
        return self.recipe.name

    def get_owner(self):
        try:
            return self.book.created_by
        except AttributeError:
            return None

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['recipe', 'book'], name='rbe_unique_name_per_space')
        ]


class MealType(models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128)
    order = models.IntegerField(default=0)
    color = models.CharField(max_length=7, blank=True, null=True)
    time = models.TimeField(null=True, blank=True)
    default = models.BooleanField(default=False, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name', 'created_by'], name='mt_unique_name_per_space'),
        ]


class MealPlan(ExportModelOperationsMixin('meal_plan'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, blank=True, null=True)
    servings = models.DecimalField(default=1, max_digits=8, decimal_places=4)
    title = models.CharField(max_length=64, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    shared = models.ManyToManyField(User, blank=True, related_name='plan_share')
    meal_type = models.ForeignKey(MealType, on_delete=models.CASCADE)
    note = models.TextField(blank=True)
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def get_label(self):
        if self.title:
            return self.title
        return str(self.recipe)

    def get_meal_name(self):
        return self.meal_type.name

    def __str__(self):
        return f'{self.get_label()} - {self.from_date} - {self.meal_type.name}'


class ShoppingListRecipe(ExportModelOperationsMixin('shopping_list_recipe'), models.Model, PermissionModelMixin):
    name = models.CharField(max_length=32, blank=True, default='')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True)  # TODO make required after old shoppinglist deprecated
    servings = models.DecimalField(default=1, max_digits=8, decimal_places=4)
    mealplan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, null=True, blank=True)

    objects = ScopedManager(space='recipe__space')

    @staticmethod
    def get_space_key():
        return 'recipe', 'space'

    def get_space(self):
        return self.recipe.space

    def __str__(self):
        return f'Shopping list recipe {self.id} - {self.recipe}'

    def get_owner(self):
        try:
            if not self.entries.exists():
                return 'orphan'
            else:
                return getattr(self.entries.first(), 'created_by', None)
        except AttributeError:
            return None


class ShoppingListEntry(ExportModelOperationsMixin('shopping_list_entry'), models.Model, PermissionModelMixin):
    list_recipe = models.ForeignKey(ShoppingListRecipe, on_delete=models.CASCADE, null=True, blank=True, related_name='entries')
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='shopping_entries')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(default=0, decimal_places=16, max_digits=32)
    order = models.IntegerField(default=0)
    checked = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    completed_at = models.DateTimeField(null=True, blank=True)
    delay_until = models.DateTimeField(null=True, blank=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'Shopping list entry {self.id}'

    def get_shared(self):
        return self.created_by.userpreference.shopping_share.all()

    def get_owner(self):
        try:
            return self.created_by
        except AttributeError:
            return None


class ShareLink(ExportModelOperationsMixin('share_link'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4)
    request_count = models.IntegerField(default=0)
    abuse_blocked = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.recipe} - {self.uuid}'


def default_valid_until():
    return date.today() + timedelta(days=14)


class InviteLink(ExportModelOperationsMixin('invite_link'), models.Model, PermissionModelMixin):
    uuid = models.UUIDField(default=uuid.uuid4)
    email = models.EmailField(blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    valid_until = models.DateField(default=default_valid_until)
    used_by = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='used_by')
    reusable = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    internal_note = models.TextField(blank=True, null=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return f'{self.uuid}'


class TelegramBot(models.Model, PermissionModelMixin):
    token = models.CharField(max_length=256)
    name = models.CharField(max_length=128, default='', blank=True)
    chat_id = models.CharField(max_length=128, default='', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    webhook_token = models.UUIDField(default=uuid.uuid4)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name}"


class CookLog(ExportModelOperationsMixin('cook_log'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    rating = models.IntegerField(null=True, blank=True)
    servings = models.IntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.recipe.name

    class Meta():
        indexes = (
            Index(fields=['id']),
            Index(fields=['recipe']),
            Index(fields=['-created_at']),
            Index(fields=['rating']),
            Index(fields=['created_by']),
            Index(fields=['created_by', 'rating']),
        )


class ViewLog(ExportModelOperationsMixin('view_log'), models.Model, PermissionModelMixin):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    objects = ScopedManager(space='space')

    def __str__(self):
        return self.recipe.name

    class Meta():
        indexes = (
            Index(fields=['recipe']),
            Index(fields=['-created_at']),
            Index(fields=['created_by']),
            Index(fields=['recipe', '-created_at', 'created_by']),
        )


class ImportLog(models.Model, PermissionModelMixin):
    type = models.CharField(max_length=32)
    running = models.BooleanField(default=True)
    msg = models.TextField(default="")
    keyword = models.ForeignKey(Keyword, null=True, blank=True, on_delete=models.SET_NULL)

    total_recipes = models.IntegerField(default=0)
    imported_recipes = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.created_at}:{self.type}"


class ExportLog(models.Model, PermissionModelMixin):
    type = models.CharField(max_length=32)
    running = models.BooleanField(default=True)
    msg = models.TextField(default="")

    total_recipes = models.IntegerField(default=0)
    exported_recipes = models.IntegerField(default=0)
    cache_duration = models.IntegerField(default=0)
    possibly_not_expired = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.created_at}:{self.type}"


class BookmarkletImport(ExportModelOperationsMixin('bookmarklet_import'), models.Model, PermissionModelMixin):
    html = models.TextField()
    url = models.CharField(max_length=256, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)


# field names used to configure search behavior - all data populated during data migration
# other option is to use a MultiSelectField from https://github.com/goinnn/django-multiselectfield
class SearchFields(models.Model, PermissionModelMixin):
    name = models.CharField(max_length=32, unique=True)
    field = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return _(self.name)

    @staticmethod
    def get_name(self):
        return _(self.name)


class SearchPreference(models.Model, PermissionModelMixin):
    # Search Style (validation parsleyjs.org)
    # phrase or plain or raw (websearch and trigrams are mutually exclusive)
    SIMPLE = 'plain'
    PHRASE = 'phrase'
    WEB = 'websearch'
    RAW = 'raw'
    SEARCH_STYLE = (
        (SIMPLE, _('Simple')),
        (PHRASE, _('Phrase')),
        (WEB, _('Web')),
        (RAW, _('Raw'))
    )

    user = AutoOneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    search = models.CharField(choices=SEARCH_STYLE, max_length=32, default=SIMPLE)

    lookup = models.BooleanField(default=False)
    unaccent = models.ManyToManyField(SearchFields, related_name="unaccent_fields", blank=True)
    icontains = models.ManyToManyField(SearchFields, related_name="icontains_fields", blank=True)
    istartswith = models.ManyToManyField(SearchFields, related_name="istartswith_fields", blank=True)
    trigram = models.ManyToManyField(SearchFields, related_name="trigram_fields", blank=True)
    fulltext = models.ManyToManyField(SearchFields, related_name="fulltext_fields", blank=True)
    trigram_threshold = models.DecimalField(default=0.2, decimal_places=2, max_digits=3)


class UserFile(ExportModelOperationsMixin('user_files'), models.Model, PermissionModelMixin):
    name = models.CharField(max_length=128)
    file = models.FileField(upload_to='files/')
    file_size_kb = models.IntegerField(default=0, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    def is_image(self):
        try:
            Image.open(self.file.file.file)
            return True
        except Exception:
            return False

    def save(self, *args, **kwargs):
        if hasattr(self.file, 'file') and isinstance(self.file.file, UploadedFile) or isinstance(self.file.file, InMemoryUploadedFile):
            self.file.name = f'{uuid.uuid4()}' + pathlib.Path(self.file.name).suffix
            self.file_size_kb = round(self.file.size / 1000)
        super(UserFile, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} (#{self.id})'


class Automation(ExportModelOperationsMixin('automations'), models.Model, PermissionModelMixin):
    FOOD_ALIAS = 'FOOD_ALIAS'
    UNIT_ALIAS = 'UNIT_ALIAS'
    KEYWORD_ALIAS = 'KEYWORD_ALIAS'
    DESCRIPTION_REPLACE = 'DESCRIPTION_REPLACE'
    INSTRUCTION_REPLACE = 'INSTRUCTION_REPLACE'
    NEVER_UNIT = 'NEVER_UNIT'
    TRANSPOSE_WORDS = 'TRANSPOSE_WORDS'
    FOOD_REPLACE = 'FOOD_REPLACE'
    UNIT_REPLACE = 'UNIT_REPLACE'
    NAME_REPLACE = 'NAME_REPLACE'

    type = models.CharField(max_length=128,
                            choices=(
                                (FOOD_ALIAS, _('Food Alias')),
                                (UNIT_ALIAS, _('Unit Alias')),
                                (KEYWORD_ALIAS, _('Keyword Alias')),
                                (DESCRIPTION_REPLACE, _('Description Replace')),
                                (INSTRUCTION_REPLACE, _('Instruction Replace')),
                                (NEVER_UNIT, _('Never Unit')),
                                (TRANSPOSE_WORDS, _('Transpose Words')),
                                (FOOD_REPLACE, _('Food Replace')),
                                (UNIT_REPLACE, _('Unit Replace')),
                                (NAME_REPLACE, _('Name Replace')),
                            ))
    name = models.CharField(max_length=128, default='')
    description = models.TextField(blank=True, null=True)

    param_1 = models.CharField(max_length=128, blank=True, null=True)
    param_2 = models.CharField(max_length=128, blank=True, null=True)
    param_3 = models.CharField(max_length=128, blank=True, null=True)

    order = models.IntegerField(default=1000)

    disabled = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)


class CustomFilter(models.Model, PermissionModelMixin):
    RECIPE = 'RECIPE'
    FOOD = 'FOOD'
    KEYWORD = 'KEYWORD'

    MODELS = (
        (RECIPE, _('Recipe')),
        (FOOD, _('Food')),
        (KEYWORD, _('Keyword')),
    )

    name = models.CharField(max_length=128, null=False, blank=False)
    type = models.CharField(max_length=128, choices=(MODELS), default=MODELS[0])
    # could use JSONField, but requires installing extension on SQLite,  don't need to search the objects, so seems unecessary
    search = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    shared = models.ManyToManyField(User, blank=True, related_name='f_shared_with')

    objects = ScopedManager(space='space')
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['space', 'name'], name='cf_unique_name_per_space')
        ]
