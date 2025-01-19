import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from gettext import gettext as _
from html import escape
from smtplib import SMTPException

from django.contrib.auth.models import AnonymousUser, Group, User
from django.core.cache import caches
from django.core.mail import send_mail
from django.db.models import Q, QuerySet, Sum
from django.http import BadHeaderError
from django.urls import reverse
from django.utils import timezone
from django_scopes import scopes_disabled
from drf_writable_nested import UniqueFieldsMixin, WritableNestedModelSerializer
from oauth2_provider.models import AccessToken
from PIL import Image
from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.fields import IntegerField

from cookbook.helper.CustomStorageClass import CachedS3Boto3Storage
from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.image_processing import is_file_type_allowed
from cookbook.helper.permission_helper import above_space_limit
from cookbook.helper.property_helper import FoodPropertyHelper
from cookbook.helper.shopping_helper import RecipeShoppingEditor
from cookbook.helper.unit_conversion_helper import UnitConversionHelper
from cookbook.models import (Automation, BookmarkletImport, Comment, CookLog, CustomFilter,
                             ExportLog, Food, FoodInheritField, ImportLog, Ingredient, InviteLink,
                             Keyword, MealPlan, MealType, NutritionInformation, Property,
                             PropertyType, Recipe, RecipeBook, RecipeBookEntry, RecipeImport,
                             ShareLink, ShoppingListEntry, ShoppingListRecipe, Space,
                             Step, Storage, Supermarket, SupermarketCategory,
                             SupermarketCategoryRelation, Sync, SyncLog, Unit, UnitConversion,
                             UserFile, UserPreference, UserSpace, ViewLog, ConnectorConfig)
from cookbook.templatetags.custom_tags import markdown
from recipes.settings import AWS_ENABLED, MEDIA_URL


class ExtendedRecipeMixin(serializers.ModelSerializer):
    # adds image and recipe count to serializer when query param extended=1
    # ORM path to this object from Recipe
    recipe_filter = None
    # list of ORM paths to any image
    images = None

    image = serializers.SerializerMethodField('get_image')
    numrecipe = serializers.ReadOnlyField(source='recipe_count')

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        try:
            api_serializer = self.context['view'].serializer_class
        except KeyError:
            api_serializer = None
        # extended values are computationally expensive and not needed in normal circumstances
        try:
            if str2bool(
                    self.context['request'].query_params.get('extended', False)) and self.__class__ == api_serializer:
                return fields
        except (AttributeError, KeyError):
            pass
        try:
            del fields['image']
            del fields['numrecipe']
        except KeyError:
            pass
        return fields

    def get_image(self, obj):
        if obj.recipe_image:
            if AWS_ENABLED:
                storage = CachedS3Boto3Storage()
                path = storage.url(obj.recipe_image)
            else:
                path = MEDIA_URL + obj.recipe_image
            return path


class OpenDataModelMixin(serializers.ModelSerializer):

    def create(self, validated_data):
        if 'open_data_slug' in validated_data and validated_data['open_data_slug'] is not None and validated_data['open_data_slug'].strip() == '':
            validated_data['open_data_slug'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'open_data_slug' in validated_data and validated_data['open_data_slug'] is not None and validated_data['open_data_slug'].strip() == '':
            validated_data['open_data_slug'] = None
        return super().update(instance, validated_data)


class CustomDecimalField(serializers.Field):
    """
    Custom decimal field to normalize useless decimal places
    and allow commas as decimal separators
    """

    def to_representation(self, value):
        if not isinstance(value, Decimal):
            value = Decimal(value)
        return round(value, 2).normalize()

    def to_internal_value(self, data):
        if isinstance(data, int) or isinstance(data, float):
            return data
        elif isinstance(data, str):
            if data == '':
                return 0
            try:
                return float(data.replace(',', '.'))
            except ValueError:
                raise ValidationError('A valid number is required')


class CustomOnHandField(serializers.Field):
    def get_attribute(self, instance):
        return instance

    def to_representation(self, obj):
        if not self.context["request"].user.is_authenticated:
            return []
        shared_users = []
        if c := caches['default'].get(
                f'shopping_shared_users_{self.context["request"].space.id}_{self.context["request"].user.id}', None):
            shared_users = c
        else:
            try:
                shared_users = [x.id for x in list(self.context['request'].user.get_shopping_share())] + [
                    self.context['request'].user.id]
                caches['default'].set(
                    f'shopping_shared_users_{self.context["request"].space.id}_{self.context["request"].user.id}',
                    shared_users, timeout=5 * 60)
                # TODO ugly hack that improves API performance significantly, should be done properly
            except AttributeError:  # Anonymous users (using share links) don't have shared users
                pass
        return obj.onhand_users.filter(id__in=shared_users).exists()

    def to_internal_value(self, data):
        return data


class SpaceFilterSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        if self.context.get('request', None) is None:
            return
        if (isinstance(data, QuerySet) and data.query.is_sliced):
            # if query is sliced it came from api request not nested serializer
            return super().to_representation(data)
        if self.child.Meta.model == User:
            if isinstance(self.context['request'].user, AnonymousUser):
                data = []
            else:
                data = data.filter(userspace__space=self.context['request'].user.get_active_space()).all()
        else:
            data = data.filter(**{'__'.join(data.model.get_space_key()): self.context['request'].space})
        return super().to_representation(data)


class UserSerializer(WritableNestedModelSerializer):
    display_name = serializers.SerializerMethodField('get_user_label')

    def get_user_label(self, obj):
        return obj.get_user_display_name()

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'display_name')
        read_only_fields = ('username',)


class GroupSerializer(UniqueFieldsMixin, WritableNestedModelSerializer):
    def create(self, validated_data):
        raise ValidationError('Cannot create using this endpoint')

    def update(self, instance, validated_data):
        return instance  # cannot update group

    class Meta:
        model = Group
        fields = ('id', 'name')


class FoodInheritFieldSerializer(UniqueFieldsMixin, WritableNestedModelSerializer):
    name = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    field = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    def create(self, validated_data):
        raise ValidationError('Cannot create using this endpoint')

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = FoodInheritField
        fields = ('id', 'name', 'field',)
        read_only_fields = ['id']


class UserFileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    file_download = serializers.SerializerMethodField('get_download_link')
    preview = serializers.SerializerMethodField('get_preview_link')

    def get_download_link(self, obj):
        return self.context['request'].build_absolute_uri(reverse('api_download_file', args={obj.pk}))

    def get_preview_link(self, obj):
        try:
            Image.open(obj.file.file.file)
            return self.context['request'].build_absolute_uri(obj.file.url)
        except Exception:
            # traceback.print_exc()
            return ""

    def check_file_limit(self, validated_data):
        if 'file' in validated_data:
            if self.context['request'].space.max_file_storage_mb == -1:
                raise ValidationError(_('File uploads are not enabled for this Space.'))

            try:
                current_file_size_mb = \
                    UserFile.objects.filter(space=self.context['request'].space).aggregate(Sum('file_size_kb'))[
                        'file_size_kb__sum'] / 1000
            except TypeError:
                current_file_size_mb = 0

            if ((validated_data['file'].size / 1000 / 1000 + current_file_size_mb - 5)
                    > self.context['request'].space.max_file_storage_mb != 0):
                raise ValidationError(_('You have reached your file upload limit.'))

    def create(self, validated_data):
        if not is_file_type_allowed(validated_data['file'].name):
            return None

        self.check_file_limit(validated_data)
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if not is_file_type_allowed(validated_data['file'].name):
            return None
        self.check_file_limit(validated_data)
        return super().update(instance, validated_data)

    class Meta:
        model = UserFile
        fields = ('id', 'name', 'file', 'file_download', 'preview', 'file_size_kb')
        read_only_fields = ('id', 'file_size_kb')
        extra_kwargs = {"file": {"required": False, }}


class UserFileViewSerializer(serializers.ModelSerializer):
    file_download = serializers.SerializerMethodField('get_download_link')
    preview = serializers.SerializerMethodField('get_preview_link')

    def get_download_link(self, obj):
        return self.context['request'].build_absolute_uri(reverse('api_download_file', args={obj.pk}))

    def get_preview_link(self, obj):
        try:
            Image.open(obj.file.file.file)
            return self.context['request'].build_absolute_uri(obj.file.url)
        except Exception:
            # traceback.print_exc()
            return ""

    def create(self, validated_data):
        raise ValidationError('Cannot create File over this view')

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserFile
        fields = ('id', 'name', 'file_download', 'preview')
        read_only_fields = ('id', 'file')


class SpaceSerializer(WritableNestedModelSerializer):
    user_count = serializers.SerializerMethodField('get_user_count')
    recipe_count = serializers.SerializerMethodField('get_recipe_count')
    file_size_mb = serializers.SerializerMethodField('get_file_size_mb')
    food_inherit = FoodInheritFieldSerializer(many=True)
    image = UserFileViewSerializer(required=False, many=False, allow_null=True)
    nav_logo = UserFileViewSerializer(required=False, many=False, allow_null=True)
    custom_space_theme = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_32 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_128 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_144 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_180 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_192 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_512 = UserFileViewSerializer(required=False, many=False, allow_null=True)
    logo_color_svg = UserFileViewSerializer(required=False, many=False, allow_null=True)

    def get_user_count(self, obj):
        return UserSpace.objects.filter(space=obj).count()

    def get_recipe_count(self, obj):
        return Recipe.objects.filter(space=obj).count()

    def get_file_size_mb(self, obj):
        try:
            return UserFile.objects.filter(space=obj).aggregate(Sum('file_size_kb'))['file_size_kb__sum'] / 1000
        except TypeError:
            return 0

    def create(self, validated_data):
        raise ValidationError('Cannot create using this endpoint')

    class Meta:
        model = Space
        fields = (
            'id', 'name', 'created_by', 'created_at', 'message', 'max_recipes', 'max_file_storage_mb', 'max_users',
            'allow_sharing', 'demo', 'food_inherit', 'user_count', 'recipe_count', 'file_size_mb',
            'image', 'nav_logo', 'space_theme', 'custom_space_theme', 'nav_bg_color', 'nav_text_color',
            'logo_color_32', 'logo_color_128', 'logo_color_144', 'logo_color_180', 'logo_color_192', 'logo_color_512', 'logo_color_svg',)
        read_only_fields = (
            'id', 'created_by', 'created_at', 'max_recipes', 'max_file_storage_mb', 'max_users', 'allow_sharing',
            'demo',)


class UserSpaceSerializer(WritableNestedModelSerializer):
    user = UserSerializer(read_only=True)
    groups = GroupSerializer(many=True)

    def validate(self, data):
        if self.instance.user == self.context['request'].space.created_by:  # can't change space owner permission
            raise serializers.ValidationError(_('Cannot modify Space owner permission.'))
        return super().validate(data)

    def create(self, validated_data):
        raise ValidationError('Cannot create using this endpoint')

    class Meta:
        model = UserSpace
        fields = ('id', 'user', 'space', 'groups', 'active', 'internal_note', 'invite_link', 'created_at', 'updated_at',)
        read_only_fields = ('id', 'invite_link', 'created_at', 'updated_at', 'space')


class SpacedModelSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)


class MealTypeSerializer(SpacedModelSerializer, WritableNestedModelSerializer):

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        space = validated_data.pop('space', self.context['request'].space)
        validated_data['created_by'] = self.context['request'].user
        obj, created = MealType.objects.get_or_create(name__iexact=validated_data['name'], space=space, created_by=self.context['request'].user, defaults=validated_data)
        return obj

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = MealType
        fields = ('id', 'name', 'order', 'time', 'color', 'default', 'created_by')
        read_only_fields = ('created_by',)


class UserPreferenceSerializer(WritableNestedModelSerializer):
    food_inherit_default = serializers.SerializerMethodField('get_food_inherit_defaults')
    plan_share = UserSerializer(many=True, allow_null=True, required=False)
    shopping_share = UserSerializer(many=True, allow_null=True, required=False)
    food_children_exist = serializers.SerializerMethodField('get_food_children_exist')
    image = UserFileViewSerializer(required=False, allow_null=True, many=False)

    def get_food_inherit_defaults(self, obj):
        return FoodInheritFieldSerializer(obj.user.get_active_space().food_inherit.all(), many=True).data

    def get_food_children_exist(self, obj):
        space = getattr(self.context.get('request', None), 'space', None)
        return Food.objects.filter(depth__gt=0, space=space).exists()

    def update(self, instance, validated_data):
        with scopes_disabled():
            return super().update(instance, validated_data)

    def create(self, validated_data):
        raise ValidationError('Cannot create using this endpoint')

    class Meta:
        model = UserPreference
        fields = (
            'user', 'image', 'theme', 'nav_bg_color', 'nav_text_color', 'nav_show_logo', 'default_unit', 'default_page',
            'use_fractions', 'use_kj',
            'plan_share', 'nav_sticky',
            'ingredient_decimals', 'comments', 'shopping_auto_sync', 'mealplan_autoadd_shopping',
            'food_inherit_default', 'default_delay',
            'mealplan_autoinclude_related', 'mealplan_autoexclude_onhand', 'shopping_share', 'shopping_recent_days',
            'csv_delim', 'csv_prefix',
            'filter_to_supermarket', 'shopping_add_onhand', 'left_handed', 'show_step_ingredients',
            'food_children_exist'
        )


class StorageSerializer(SpacedModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = Storage
        fields = (
            'id', 'name', 'method', 'username', 'password',
            'token', 'created_by'
        )

        read_only_fields = ('created_by',)

        extra_kwargs = {
            'password': {'write_only': True},
            'token': {'write_only': True},
        }


class ConnectorConfigConfigSerializer(SpacedModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = ConnectorConfig
        fields = (
            'id', 'name', 'url', 'token', 'todo_entity', 'enabled',
            'on_shopping_list_entry_created_enabled', 'on_shopping_list_entry_updated_enabled',
            'on_shopping_list_entry_deleted_enabled', 'supports_description_field', 'created_by'
        )

        read_only_fields = ('created_by',)

        extra_kwargs = {
            'token': {'write_only': True},
        }


class SyncSerializer(SpacedModelSerializer):
    class Meta:
        model = Sync
        fields = (
            'id', 'storage', 'path', 'active', 'last_checked',
            'created_at', 'updated_at'
        )


class SyncLogSerializer(SpacedModelSerializer):
    class Meta:
        model = SyncLog
        fields = ('id', 'sync', 'status', 'msg', 'created_at')


class KeywordLabelSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField('get_label')

    def get_label(self, obj):
        return str(obj)

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = Keyword
        fields = (
            'id', 'label',
        )
        read_only_fields = ('id', 'label')


class KeywordSerializer(UniqueFieldsMixin, ExtendedRecipeMixin):
    label = serializers.SerializerMethodField('get_label')
    recipe_filter = 'keywords'

    def get_label(self, obj):
        return str(obj)

    def create(self, validated_data):
        # since multi select tags dont have id's
        # duplicate names might be routed to create
        name = validated_data.pop('name').strip()
        space = validated_data.pop('space', self.context['request'].space)
        obj, created = Keyword.objects.get_or_create(name=name, space=space, defaults=validated_data)
        return obj

    class Meta:
        model = Keyword
        fields = (
            'id', 'name', 'label', 'description', 'image', 'parent', 'numchild', 'numrecipe', 'created_at',
            'updated_at', 'full_name')
        read_only_fields = ('id', 'label', 'numchild', 'parent', 'image')


class UnitSerializer(UniqueFieldsMixin, ExtendedRecipeMixin, OpenDataModelMixin):
    recipe_filter = 'steps__ingredients__unit'

    def create(self, validated_data):
        #  get_or_create drops any field that contains '__' when creating so values must be included in validated data
        space = validated_data.pop('space', self.context['request'].space)
        if x := validated_data.get('name', None):
            validated_data['name'] = x.strip()
        if x := validated_data.get('name', None):
            validated_data['plural_name'] = x.strip()

        if unit := Unit.objects.filter(
                Q(name__iexact=validated_data['name']) | Q(plural_name__iexact=validated_data['name']),
                space=space).first():
            return unit

        obj, created = Unit.objects.get_or_create(name__iexact=validated_data['name'], space=space,
                                                  defaults=validated_data)
        return obj

    def update(self, instance, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        if plural_name := validated_data.get('plural_name', None):
            validated_data['plural_name'] = plural_name.strip()
        return super(UnitSerializer, self).update(instance, validated_data)

    class Meta:
        model = Unit
        fields = ('id', 'name', 'plural_name', 'description', 'base_unit', 'numrecipe', 'image', 'open_data_slug')
        read_only_fields = ('id', 'numrecipe', 'image')


class SupermarketCategorySerializer(UniqueFieldsMixin, WritableNestedModelSerializer, OpenDataModelMixin):

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        space = validated_data.pop('space', self.context['request'].space)
        obj, created = SupermarketCategory.objects.get_or_create(name__iexact=validated_data['name'], space=space,
                                                                 defaults=validated_data)
        return obj

    def update(self, instance, validated_data):
        return super(SupermarketCategorySerializer, self).update(instance, validated_data)

    class Meta:
        model = SupermarketCategory
        fields = ('id', 'name', 'description')


class SupermarketCategoryRelationSerializer(WritableNestedModelSerializer):
    category = SupermarketCategorySerializer()

    class Meta:
        model = SupermarketCategoryRelation
        fields = ('id', 'category', 'supermarket', 'order')


class SupermarketSerializer(UniqueFieldsMixin, SpacedModelSerializer, OpenDataModelMixin):
    category_to_supermarket = SupermarketCategoryRelationSerializer(many=True, read_only=True)

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        space = validated_data.pop('space', self.context['request'].space)
        obj, created = Supermarket.objects.get_or_create(name__iexact=validated_data['name'], space=space,
                                                         defaults=validated_data)
        return obj

    class Meta:
        model = Supermarket
        fields = ('id', 'name', 'description', 'category_to_supermarket', 'open_data_slug')


class PropertyTypeSerializer(OpenDataModelMixin, WritableNestedModelSerializer, UniqueFieldsMixin):
    id = serializers.IntegerField(required=False)
    order = IntegerField(default=0, required=False)

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        space = validated_data.pop('space', self.context['request'].space)
        obj, created = PropertyType.objects.get_or_create(name__iexact=validated_data['name'], space=space,
                                                          defaults=validated_data)
        return obj

    class Meta:
        model = PropertyType
        fields = ('id', 'name', 'unit', 'description', 'order', 'open_data_slug', 'fdc_id',)


class PropertySerializer(UniqueFieldsMixin, WritableNestedModelSerializer):
    property_type = PropertyTypeSerializer()
    property_amount = CustomDecimalField(allow_null=True)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Property
        fields = ('id', 'property_amount', 'property_type')


class RecipeSimpleSerializer(WritableNestedModelSerializer):
    url = serializers.SerializerMethodField('get_url')

    def get_url(self, obj):
        return reverse('view_recipe', args=[obj.id])

    def create(self, validated_data):
        # don't allow writing to Recipe via this API
        return Recipe.objects.get(**validated_data)

    def update(self, instance, validated_data):
        # don't allow writing to Recipe via this API
        return Recipe.objects.get(**validated_data)

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'url')


class FoodSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ('id', 'name', 'plural_name')


class FoodSerializer(UniqueFieldsMixin, WritableNestedModelSerializer, ExtendedRecipeMixin, OpenDataModelMixin):
    supermarket_category = SupermarketCategorySerializer(allow_null=True, required=False)
    recipe = RecipeSimpleSerializer(allow_null=True, required=False)
    shopping = serializers.ReadOnlyField(source='shopping_status')
    inherit_fields = FoodInheritFieldSerializer(many=True, allow_null=True, required=False)
    child_inherit_fields = FoodInheritFieldSerializer(many=True, allow_null=True, required=False)
    food_onhand = CustomOnHandField(required=False, allow_null=True)
    substitute_onhand = serializers.SerializerMethodField('get_substitute_onhand')
    substitute = FoodSimpleSerializer(many=True, allow_null=True, required=False)

    properties = PropertySerializer(many=True, allow_null=True, required=False)
    properties_food_unit = UnitSerializer(allow_null=True, required=False)
    properties_food_amount = CustomDecimalField(required=False)

    recipe_filter = 'steps__ingredients__food'
    images = ['recipe__image']

    def get_substitute_onhand(self, obj):
        if not self.context["request"].user.is_authenticated:
            return []
        shared_users = []
        if c := caches['default'].get(
                f'shopping_shared_users_{self.context["request"].space.id}_{self.context["request"].user.id}', None):
            shared_users = c
        else:
            try:
                shared_users = [x.id for x in list(self.context['request'].user.get_shopping_share())] + [
                    self.context['request'].user.id]
                caches['default'].set(
                    f'shopping_shared_users_{self.context["request"].space.id}_{self.context["request"].user.id}',
                    shared_users, timeout=5 * 60)
                # TODO ugly hack that improves API performance significantly, should be done properly
            except AttributeError:  # Anonymous users (using share links) don't have shared users
                pass
        filter = Q(id__in=obj.substitute.all())
        if obj.substitute_siblings:
            filter |= Q(path__startswith=obj.path[:Food.steplen * (obj.depth - 1)], depth=obj.depth)
        if obj.substitute_children:
            filter |= Q(path__startswith=obj.path, depth__gt=obj.depth)
        return Food.objects.filter(filter).filter(onhand_users__id__in=shared_users).exists()

    def create(self, validated_data):
        name = validated_data['name'].strip()

        if plural_name := validated_data.pop('plural_name', None):
            plural_name = plural_name.strip()

        if food := Food.objects.filter(Q(name=name) | Q(plural_name=name)).first():
            return food

        space = validated_data.pop('space', self.context['request'].space)
        # supermarket category needs to be handled manually as food.get or create does not create nested serializers unlike a super.create of serializer
        if 'supermarket_category' in validated_data and validated_data['supermarket_category']:
            sm_category = validated_data['supermarket_category']
            sc_name = sm_category.pop('name', None)
            validated_data['supermarket_category'], sc_created = SupermarketCategory.objects.get_or_create(
                name=sc_name,
                space=space, defaults=sm_category)
        onhand = validated_data.pop('food_onhand', None)
        if recipe := validated_data.get('recipe', None):
            validated_data['recipe'] = Recipe.objects.get(**recipe)

        # assuming if on hand for user also onhand for shopping_share users
        if onhand is not None:
            shared_users = [user := self.context['request'].user] + list(user.userpreference.shopping_share.all())
            if self.instance:
                onhand_users = self.instance.onhand_users.all()
            else:
                onhand_users = []
            if onhand:
                validated_data['onhand_users'] = list(onhand_users) + shared_users
            else:
                validated_data['onhand_users'] = list(set(onhand_users) - set(shared_users))

        if properties_food_unit := validated_data.pop('properties_food_unit', None):
            properties_food_unit = Unit.objects.filter(name=properties_food_unit['name']).first()

        properties = validated_data.pop('properties', None)

        obj, created = Food.objects.get_or_create(name=name, plural_name=plural_name, space=space,
                                                  properties_food_unit=properties_food_unit,
                                                  defaults=validated_data)

        if properties and len(properties) > 0:
            for p in properties:
                obj.properties.add(Property.objects.create(property_type_id=p['property_type']['id'],
                                                           property_amount=p['property_amount'], space=space))

        return obj

    def update(self, instance, validated_data):
        if name := validated_data.get('name', None):
            validated_data['name'] = name.strip()
        if plural_name := validated_data.get('plural_name', None):
            validated_data['plural_name'] = plural_name.strip()
        # assuming if on hand for user also onhand for shopping_share users
        onhand = validated_data.get('food_onhand', None)
        reset_inherit = self.initial_data.get('reset_inherit', False)
        if onhand is not None:
            shared_users = [user := self.context['request'].user] + list(user.userpreference.shopping_share.all())
            if onhand:
                validated_data['onhand_users'] = list(self.instance.onhand_users.all()) + shared_users
            else:
                validated_data['onhand_users'] = list(set(self.instance.onhand_users.all()) - set(shared_users))

        # update before resetting inheritance
        saved_instance = super(FoodSerializer, self).update(instance, validated_data)
        if reset_inherit and (r := self.context.get('request', None)):
            Food.reset_inheritance(food=saved_instance, space=r.space)
        return saved_instance

    class Meta:
        model = Food
        fields = (
            'id', 'name', 'plural_name', 'description', 'shopping', 'recipe', 'url',
            'properties', 'properties_food_amount', 'properties_food_unit', 'fdc_id',
            'food_onhand', 'supermarket_category',
            'image', 'parent', 'numchild', 'numrecipe', 'inherit_fields', 'full_name', 'ignore_shopping',
            'substitute', 'substitute_siblings', 'substitute_children', 'substitute_onhand', 'child_inherit_fields',
            'open_data_slug',
        )
        read_only_fields = ('id', 'numchild', 'parent', 'image', 'numrecipe')


class IngredientSimpleSerializer(WritableNestedModelSerializer):
    food = FoodSimpleSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True)
    used_in_recipes = serializers.SerializerMethodField('get_used_in_recipes')
    amount = CustomDecimalField()
    conversions = serializers.SerializerMethodField('get_conversions')

    def get_used_in_recipes(self, obj):
        used_in = []
        for s in obj.step_set.all():
            for r in s.recipe_set.all():
                used_in.append({'id': r.id, 'name': r.name})
        return used_in

    def get_conversions(self, obj):
        if obj.unit and obj.food:
            uch = UnitConversionHelper(self.context['request'].space)
            conversions = []
            for c in uch.get_conversions(obj):
                conversions.append(
                    {'food': c.food.name, 'unit': c.unit.name, 'amount': c.amount})  # TODO do formatting in helper
            return conversions
        else:
            return []

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('original_text', None)
        return super().update(instance, validated_data)

    class Meta:
        model = Ingredient
        fields = (
            'id', 'food', 'unit', 'amount', 'conversions', 'note', 'order',
            'is_header', 'no_amount', 'original_text', 'used_in_recipes',
            'always_use_plural_unit', 'always_use_plural_food',
        )
        read_only_fields = ['conversions', ]


class IngredientSerializer(IngredientSimpleSerializer):
    food = FoodSerializer(allow_null=True)


class StepSerializer(WritableNestedModelSerializer, ExtendedRecipeMixin):
    ingredients = IngredientSerializer(many=True)
    instructions_markdown = serializers.SerializerMethodField('get_instructions_markdown')
    file = UserFileViewSerializer(allow_null=True, required=False)
    step_recipe_data = serializers.SerializerMethodField('get_step_recipe_data')
    recipe_filter = 'steps'

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def get_instructions_markdown(self, obj):
        return obj.get_instruction_render()

    def get_step_recipes(self, obj):
        return list(obj.recipe_set.values_list('id', flat=True).all())

    def get_step_recipe_data(self, obj):
        # check if root type is recipe to prevent infinite recursion
        # can be improved later to allow multi level embedding
        if obj.step_recipe and isinstance(self.parent.root, RecipeSerializer):
            return StepRecipeSerializer(obj.step_recipe, context={'request': self.context['request']}).data

    class Meta:
        model = Step
        fields = (
            'id', 'name', 'instruction', 'ingredients', 'instructions_markdown',
            'time', 'order', 'show_as_header', 'file', 'step_recipe',
            'step_recipe_data', 'numrecipe', 'show_ingredients_table'
        )


class StepRecipeSerializer(WritableNestedModelSerializer):
    steps = StepSerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'steps',
        )


class UnitConversionSerializer(WritableNestedModelSerializer, OpenDataModelMixin):
    name = serializers.SerializerMethodField('get_conversion_name')
    base_unit = UnitSerializer()
    converted_unit = UnitSerializer()
    food = FoodSerializer(allow_null=True, required=False)
    base_amount = CustomDecimalField()
    converted_amount = CustomDecimalField()

    def get_conversion_name(self, obj):
        text = f'{round(obj.base_amount)} {obj.base_unit} '
        if obj.food:
            text += f' {obj.food}'
        return text + f' = {round(obj.converted_amount)} {obj.converted_unit}'

    def create(self, validated_data):
        validated_data['space'] = validated_data.pop('space', self.context['request'].space)
        try:
            return UnitConversion.objects.get(
                food__name__iexact=validated_data.get('food', {}).get('name', None),
                base_unit__name__iexact=validated_data.get('base_unit', {}).get('name', None),
                converted_unit__name__iexact=validated_data.get('converted_unit', {}).get('name', None),
                space=validated_data['space']
            )
        except UnitConversion.DoesNotExist:
            validated_data['created_by'] = self.context['request'].user
            return super().create(validated_data)

    class Meta:
        model = UnitConversion
        fields = ('id', 'name', 'base_amount', 'base_unit', 'converted_amount', 'converted_unit', 'food', 'open_data_slug')


class NutritionInformationSerializer(serializers.ModelSerializer):
    carbohydrates = CustomDecimalField()
    fats = CustomDecimalField()
    proteins = CustomDecimalField()
    calories = CustomDecimalField()

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = NutritionInformation
        fields = ('id', 'carbohydrates', 'fats', 'proteins', 'calories', 'source')


class RecipeBaseSerializer(WritableNestedModelSerializer):
    # TODO make days of new recipe a setting
    def is_recipe_new(self, obj):
        if getattr(obj, 'new_recipe', None) or obj.created_at > (timezone.now() - timedelta(days=7)):
            return True
        else:
            return False


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by', 'updated_at', ]


class RecipeOverviewSerializer(RecipeBaseSerializer):
    keywords = KeywordLabelSerializer(many=True)
    new = serializers.SerializerMethodField('is_recipe_new')
    recent = serializers.ReadOnlyField()

    rating = CustomDecimalField(required=False, allow_null=True)
    last_cooked = serializers.DateTimeField(required=False, allow_null=True)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at',
            'internal', 'servings', 'servings_text', 'rating', 'last_cooked', 'new', 'recent'
        )
        read_only_fields = ['image', 'created_by', 'created_at']


class RecipeSerializer(RecipeBaseSerializer):
    nutrition = NutritionInformationSerializer(allow_null=True, required=False)
    properties = PropertySerializer(many=True, required=False)
    steps = StepSerializer(many=True)
    keywords = KeywordSerializer(many=True, required=False)
    shared = UserSerializer(many=True, required=False)
    rating = CustomDecimalField(required=False, allow_null=True, read_only=True)
    last_cooked = serializers.DateTimeField(required=False, allow_null=True, read_only=True)
    food_properties = serializers.SerializerMethodField('get_food_properties')

    def get_food_properties(self, obj):
        fph = FoodPropertyHelper(obj.space)  # initialize with object space since recipes might be viewed anonymously
        return fph.calculate_recipe_properties(obj)

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'steps', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at', 'source_url',
            'internal', 'show_ingredient_overview', 'nutrition', 'properties', 'food_properties', 'servings',
            'file_path', 'servings_text', 'rating',
            'last_cooked',
            'private', 'shared',
        )
        read_only_fields = ['image', 'created_by', 'created_at', 'food_properties']

    def validate(self, data):
        above_limit, msg = above_space_limit(self.context['request'].space)
        if above_limit:
            raise serializers.ValidationError(msg)
        return super().validate(data)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)


class RecipeImageSerializer(WritableNestedModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.CharField(max_length=4096, required=False, allow_null=True)

    def create(self, validated_data):
        if 'image' in validated_data and not is_file_type_allowed(validated_data['image'].name, image_only=True):
            return None
        return super().create( validated_data)

    def update(self, instance, validated_data):
        if 'image' in validated_data and not is_file_type_allowed(validated_data['image'].name, image_only=True):
            return None
        return super().update(instance, validated_data)

    class Meta:
        model = Recipe
        fields = ['image', 'image_url', ]


class RecipeImportSerializer(SpacedModelSerializer):
    class Meta:
        model = RecipeImport
        fields = '__all__'


class CustomFilterSerializer(SpacedModelSerializer, WritableNestedModelSerializer):
    shared = UserSerializer(many=True, required=False)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = CustomFilter
        fields = ('id', 'name', 'search', 'shared', 'created_by')
        read_only_fields = ('created_by',)


class RecipeBookSerializer(SpacedModelSerializer, WritableNestedModelSerializer):
    shared = UserSerializer(many=True)
    filter = CustomFilterSerializer(allow_null=True, required=False)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = RecipeBook
        fields = ('id', 'name', 'description', 'shared', 'created_by', 'filter', 'order')
        read_only_fields = ('created_by',)


class RecipeBookEntrySerializer(serializers.ModelSerializer):
    book_content = serializers.SerializerMethodField(method_name='get_book_content', read_only=True)
    recipe_content = serializers.SerializerMethodField(method_name='get_recipe_content', read_only=True)

    def get_book_content(self, obj):
        return RecipeBookSerializer(context={'request': self.context['request']}).to_representation(obj.book)

    def get_recipe_content(self, obj):
        return RecipeOverviewSerializer(context={'request': self.context['request']}).to_representation(obj.recipe)

    def create(self, validated_data):
        book = validated_data['book']
        recipe = validated_data['recipe']
        if not book.get_owner() == self.context['request'].user and not self.context[
                                                                            'request'].user in book.get_shared():
            raise NotFound(detail=None, code=None)
        obj, created = RecipeBookEntry.objects.get_or_create(book=book, recipe=recipe)
        return obj

    class Meta:
        model = RecipeBookEntry
        fields = ('id', 'book', 'book_content', 'recipe', 'recipe_content',)


class MealPlanSerializer(SpacedModelSerializer, WritableNestedModelSerializer):
    recipe = RecipeOverviewSerializer(required=False, allow_null=True)
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    meal_type = MealTypeSerializer()
    meal_type_name = serializers.ReadOnlyField(source='meal_type.name')  # TODO deprecate once old meal plan was removed
    note_markdown = serializers.SerializerMethodField('get_note_markdown')
    servings = CustomDecimalField()
    shared = UserSerializer(many=True, required=False, allow_null=True)
    shopping = serializers.SerializerMethodField('in_shopping')

    to_date = serializers.DateTimeField(required=False)

    def get_note_markdown(self, obj):
        return markdown(obj.note)

    def in_shopping(self, obj):
        return ShoppingListRecipe.objects.filter(mealplan=obj.id).exists()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user

        if 'to_date' not in validated_data or validated_data['to_date'] is None:
            validated_data['to_date'] = validated_data['from_date']

        mealplan = super().create(validated_data)
        if self.context['request'].data.get('addshopping', False) and self.context['request'].data.get('recipe', None):
            SLR = RecipeShoppingEditor(user=validated_data['created_by'], space=validated_data['space'])
            SLR.create(mealplan=mealplan, servings=validated_data['servings'])
        return mealplan

    class Meta:
        model = MealPlan
        fields = (
            'id', 'title', 'recipe', 'servings', 'note', 'note_markdown',
            'from_date', 'to_date', 'meal_type', 'created_by', 'shared', 'recipe_name',
            'meal_type_name', 'shopping'
        )
        read_only_fields = ('created_by',)


class AutoMealPlanSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    meal_type_id = serializers.IntegerField()
    keyword_ids = serializers.ListField()
    servings = CustomDecimalField()
    shared = UserSerializer(many=True, required=False, allow_null=True)
    addshopping = serializers.BooleanField()


class ShoppingListRecipeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField('get_name')  # should this be done at the front end?
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    mealplan_note = serializers.ReadOnlyField(source='mealplan.note')
    mealplan_from_date = serializers.ReadOnlyField(source='mealplan.from_date')
    mealplan_type = serializers.ReadOnlyField(source='mealplan.meal_type.name')
    servings = CustomDecimalField()

    def get_name(self, obj):
        if not isinstance(value := obj.servings, Decimal):
            value = Decimal(value)
        value = value.quantize(
            Decimal(1)) if value == value.to_integral() else value.normalize()  # strips trailing zero
        return (
                obj.name
                or getattr(obj.mealplan, 'title', None)
                or (d := getattr(obj.mealplan, 'date', None)) and ': '.join([obj.mealplan.recipe.name, str(d)])
                or obj.recipe.name
        ) + f' ({value:.2g})'

    def update(self, instance, validated_data):
        # TODO remove once old shopping list
        if 'servings' in validated_data and self.context.get('view', None).__class__.__name__ != 'ShoppingListViewSet':
            SLR = RecipeShoppingEditor(user=self.context['request'].user, space=self.context['request'].space)
            SLR.edit_servings(servings=validated_data['servings'], id=instance.id)
        return super().update(instance, validated_data)

    class Meta:
        model = ShoppingListRecipe
        fields = ('id', 'recipe_name', 'name', 'recipe', 'mealplan', 'servings', 'mealplan_note', 'mealplan_from_date',
                  'mealplan_type')
        read_only_fields = ('id',)


class ShoppingListEntrySerializer(WritableNestedModelSerializer):
    food = FoodSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True, required=False)
    recipe_mealplan = ShoppingListRecipeSerializer(source='list_recipe', read_only=True)
    amount = CustomDecimalField()
    created_by = UserSerializer(read_only=True)
    completed_at = serializers.DateTimeField(allow_null=True, required=False)

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)

        # autosync values are only needed for frequent 'checked' value updating
        if self.context['request'] and bool(int(self.context['request'].query_params.get('autosync', False))):
            for f in list(set(fields) - set(['id', 'checked', 'updated_at', ])):
                del fields[f]
        return fields

    def run_validation(self, data):
        if self.root.instance.__class__.__name__ == 'ShoppingListEntry':
            if (
                    data.get('checked', False)
                    and self.root.instance
                    and not self.root.instance.checked
            ):
                # if checked flips from false to true set completed datetime
                data['completed_at'] = timezone.now()

            elif not data.get('checked', False):
                # if not checked set completed to None
                data['completed_at'] = None
            else:
                # otherwise don't write anything
                if 'completed_at' in data:
                    del data['completed_at']

        return super().run_validation(data)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        # update the onhand for food if shopping_add_onhand is True
        if user.userpreference.shopping_add_onhand:
            if checked := validated_data.get('checked', None):
                instance.food.onhand_users.add(*user.userpreference.shopping_share.all(), user)
            elif checked == False:
                instance.food.onhand_users.remove(*user.userpreference.shopping_share.all(), user)
        return super().update(instance, validated_data)

    class Meta:
        model = ShoppingListEntry
        fields = (
            'id', 'list_recipe', 'food', 'unit', 'amount', 'order', 'checked',
            'recipe_mealplan',
            'created_by', 'created_at', 'updated_at', 'completed_at', 'delay_until'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at',)


class ShoppingListEntryBulkSerializer(serializers.Serializer):
    ids = serializers.ListField()
    checked = serializers.BooleanField()


# TODO deprecate
class ShoppingListEntryCheckedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListEntry
        fields = ('id', 'checked')


class ShareLinkSerializer(SpacedModelSerializer):
    class Meta:
        model = ShareLink
        fields = '__all__'


class CookLogSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = CookLog
        fields = ('id', 'recipe', 'servings', 'rating', 'comment', 'created_by', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by')


class ViewLogSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = ViewLog
        fields = ('id', 'recipe', 'created_by', 'created_at')
        read_only_fields = ('created_by',)


class ImportLogSerializer(serializers.ModelSerializer):
    keyword = KeywordSerializer(read_only=True)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = ImportLog
        fields = (
            'id', 'type', 'msg', 'running', 'keyword', 'total_recipes', 'imported_recipes', 'created_by', 'created_at')
        read_only_fields = ('created_by',)


class ExportLogSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = ExportLog
        fields = (
            'id', 'type', 'msg', 'running', 'total_recipes', 'exported_recipes', 'cache_duration',
            'possibly_not_expired',
            'created_by', 'created_at')
        read_only_fields = ('created_by',)


class AutomationSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Automation
        fields = (
            'id', 'type', 'name', 'description', 'param_1', 'param_2', 'param_3', 'order', 'disabled', 'created_by',)
        read_only_fields = ('created_by',)


class InviteLinkSerializer(WritableNestedModelSerializer):
    group = GroupSerializer()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        obj = super().create(validated_data)

        if obj.email:
            try:
                if InviteLink.objects.filter(space=self.context['request'].space,
                                             created_at__gte=datetime.now() - timedelta(hours=4)).count() < 20:
                    message = _('Hello') + '!\n\n' + _('You have been invited by ') + escape(
                        self.context['request'].user.get_user_display_name())
                    message += _(' to join their Tandoor Recipes space ') + escape(
                        self.context['request'].space.name) + '.\n\n'
                    message += _('Click the following link to activate your account: ') + self.context[
                        'request'].build_absolute_uri(reverse('view_invite', args=[str(obj.uuid)])) + '\n\n'
                    message += _('If the link does not work use the following code to manually join the space: ') + str(
                        obj.uuid) + '\n\n'
                    message += _('The invitation is valid until ') + str(obj.valid_until) + '\n\n'
                    message += _(
                        'Tandoor Recipes is an Open Source recipe manager. Check it out on GitHub ') + 'https://github.com/vabene1111/recipes/'

                    send_mail(
                        _('Tandoor Recipes Invite'),
                        message,
                        None,
                        [obj.email],
                        fail_silently=True,
                    )
            except (SMTPException, BadHeaderError, TimeoutError):
                pass

        return obj

    class Meta:
        model = InviteLink
        fields = (
            'id', 'uuid', 'email', 'group', 'valid_until', 'used_by', 'reusable', 'internal_note', 'created_by',
            'created_at',)
        read_only_fields = ('id', 'uuid', 'created_by', 'created_at',)


# CORS, REST and Scopes aren't currently working
# Scopes are evaluating before REST has authenticated the user assigning a None space
# I've made the change below to fix the bookmarklet, other serializers likely need a similar/better fix
class BookmarkletImportListSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = BookmarkletImport
        fields = ('id', 'url', 'created_by', 'created_at')
        read_only_fields = ('created_by', 'space')


class BookmarkletImportSerializer(BookmarkletImportListSerializer):
    class Meta:
        model = BookmarkletImport
        fields = ('id', 'url', 'html', 'created_by', 'created_at')
        read_only_fields = ('created_by', 'space')


# OAuth / Auth Token related Serializers

class AccessTokenSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField('get_token')

    def create(self, validated_data):
        validated_data['token'] = f'tda_{str(uuid.uuid4()).replace("-", "_")}'
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def get_token(self, obj):
        if (timezone.now() - obj.created).seconds < 15:
            return obj.token
        return f'tda_************_******_***********{obj.token[len(obj.token) - 4:]}'

    class Meta:
        model = AccessToken
        fields = ('id', 'token', 'expires', 'scope', 'created', 'updated')
        read_only_fields = ('id', 'token',)


# Export/Import Serializers

class KeywordExportSerializer(KeywordSerializer):
    class Meta:
        model = Keyword
        fields = ('name', 'description', 'created_at', 'updated_at')


class NutritionInformationExportSerializer(NutritionInformationSerializer):
    class Meta:
        model = NutritionInformation
        fields = ('carbohydrates', 'fats', 'proteins', 'calories', 'source')


class SupermarketCategoryExportSerializer(SupermarketCategorySerializer):
    class Meta:
        model = SupermarketCategory
        fields = ('name',)


class UnitExportSerializer(UnitSerializer):
    class Meta:
        model = Unit
        fields = ('name', 'plural_name', 'description')


class FoodExportSerializer(FoodSerializer):
    supermarket_category = SupermarketCategoryExportSerializer(allow_null=True, required=False)

    class Meta:
        model = Food
        fields = ('name', 'plural_name', 'ignore_shopping', 'supermarket_category',)


class IngredientExportSerializer(WritableNestedModelSerializer):
    food = FoodExportSerializer(allow_null=True)
    unit = UnitExportSerializer(allow_null=True)
    amount = CustomDecimalField()

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Ingredient
        fields = ('food', 'unit', 'amount', 'note', 'order', 'is_header', 'no_amount', 'always_use_plural_unit',
                  'always_use_plural_food')


class StepExportSerializer(WritableNestedModelSerializer):
    ingredients = IngredientExportSerializer(many=True)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Step
        fields = ('name', 'instruction', 'ingredients', 'time', 'order', 'show_as_header', 'show_ingredients_table')


class RecipeExportSerializer(WritableNestedModelSerializer):
    nutrition = NutritionInformationSerializer(allow_null=True, required=False)
    steps = StepExportSerializer(many=True)
    keywords = KeywordExportSerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'name', 'description', 'keywords', 'steps', 'working_time',
            'waiting_time', 'internal', 'nutrition', 'servings', 'servings_text', 'source_url',
        )

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)


class RecipeShoppingUpdateSerializer(serializers.ModelSerializer):
    list_recipe = serializers.IntegerField(write_only=True, allow_null=True, required=False,
                                           help_text=_("Existing shopping list to update"))
    ingredients = serializers.IntegerField(write_only=True, allow_null=True, required=False, help_text=_(
        "List of ingredient IDs from the recipe to add, if not provided all ingredients will be added."))
    servings = serializers.IntegerField(default=1, write_only=True, allow_null=True, required=False, help_text=_(
        "Providing a list_recipe ID and servings of 0 will delete that shopping list."))

    class Meta:
        model = Recipe
        fields = ['id', 'list_recipe', 'ingredients', 'servings', ]


class FoodShoppingUpdateSerializer(serializers.ModelSerializer):
    amount = serializers.IntegerField(write_only=True, allow_null=True, required=False,
                                      help_text=_("Amount of food to add to the shopping list"))
    unit = serializers.IntegerField(write_only=True, allow_null=True, required=False,
                                    help_text=_("ID of unit to use for the shopping list"))
    delete = serializers.ChoiceField(choices=['true'], write_only=True, allow_null=True, allow_blank=True,
                                     help_text=_("When set to true will delete all food from active shopping lists."))

    class Meta:
        model = Recipe
        fields = ['id', 'amount', 'unit', 'delete', ]


# non model serializers

class RecipeFromSourceSerializer(serializers.Serializer):
    url = serializers.CharField(max_length=4096, required=False, allow_null=True, allow_blank=True)
    data = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    bookmarklet = serializers.IntegerField(required=False, allow_null=True, )
