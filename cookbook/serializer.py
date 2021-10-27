import random
from datetime import timedelta
from decimal import Decimal
from gettext import gettext as _

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Avg, QuerySet, Sum
from django.urls import reverse
from django.utils import timezone
from drf_writable_nested import UniqueFieldsMixin, WritableNestedModelSerializer
from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError

from cookbook.models import (Automation, BookmarkletImport, Comment, CookLog, Food,
                             FoodInheritField, ImportLog, Ingredient, Keyword, MealPlan, MealType,
                             NutritionInformation, Recipe, RecipeBook, RecipeBookEntry,
                             RecipeImport, ShareLink, ShoppingList, ShoppingListEntry,
                             ShoppingListRecipe, Step, Storage, Supermarket, SupermarketCategory,
                             SupermarketCategoryRelation, Sync, SyncLog, Unit, UserFile,
                             UserPreference, ViewLog)
from cookbook.templatetags.custom_tags import markdown


class ExtendedRecipeMixin(serializers.ModelSerializer):
    # adds image and recipe count to serializer when query param extended=1
    image = serializers.SerializerMethodField('get_image')
    numrecipe = serializers.SerializerMethodField('count_recipes')
    recipe_filter = None

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        try:
            api_serializer = self.context['view'].serializer_class
        except KeyError:
            api_serializer = None
        # extended values are computationally expensive and not needed in normal circumstances
        if self.context.get('request', False) and bool(int(self.context['request'].query_params.get('extended', False))) and self.__class__ == api_serializer:
            return fields
        else:
            del fields['image']
            del fields['numrecipe']
            return fields

    def get_image(self, obj):
        # TODO add caching
        recipes = Recipe.objects.filter(**{self.recipe_filter: obj}, space=obj.space).exclude(
            image__isnull=True).exclude(image__exact='')
        try:
            if recipes.count() == 0 and obj.has_children():
                obj__in = self.recipe_filter + '__in'
                recipes = Recipe.objects.filter(**{obj__in: obj.get_descendants()}, space=obj.space).exclude(
                    image__isnull=True).exclude(image__exact='')  # if no recipes found - check whole tree
        except AttributeError:
            # probably not a tree
            pass
        if recipes.count() != 0:
            return recipes.order_by('?')[:1][0].image.url
        else:
            return None

    def count_recipes(self, obj):
        return Recipe.objects.filter(**{self.recipe_filter: obj}, space=obj.space).count()


class CustomDecimalField(serializers.Field):
    """
    Custom decimal field to normalize useless decimal places
    and allow commas as decimal separators
    """

    def to_representation(self, value):
        if not isinstance(value, Decimal):
            value = Decimal(value)
        return round(value, 3).normalize()

    def to_internal_value(self, data):
        if type(data) == int or type(data) == float:
            return data
        elif type(data) == str:
            if data == '':
                return 0
            try:
                return float(data.replace(',', ''))
            except ValueError:
                raise ValidationError('A valid number is required')


class SpaceFilterSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        if (type(data) == QuerySet and data.query.is_sliced):
            # if query is sliced it came from api request not nested serializer
            return super().to_representation(data)
        if self.child.Meta.model == User:
            data = data.filter(userpreference__space=self.context['request'].space)
        else:
            data = data.filter(**{'__'.join(data.model.get_space_key()): self.context['request'].space})
        return super().to_representation(data)


class SpacedModelSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)


class MealTypeSerializer(SpacedModelSerializer, WritableNestedModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = MealType
        fields = ('id', 'name', 'order', 'icon', 'color', 'default', 'created_by')
        read_only_fields = ('created_by',)


class UserNameSerializer(WritableNestedModelSerializer):
    username = serializers.SerializerMethodField('get_user_label')

    def get_user_label(self, obj):
        return obj.get_user_name()

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = User
        fields = ('id', 'username')


class FoodInheritFieldSerializer(UniqueFieldsMixin):

    def create(self, validated_data):
        # don't allow writing to FoodInheritField via API
        return FoodInheritField.objects.get(**validated_data)

    def update(self, instance, validated_data):
        # don't allow writing to FoodInheritField via API
        return FoodInheritField.objects.get(**validated_data)

    class Meta:
        model = FoodInheritField
        fields = ['id', 'name', 'field', ]


class UserPreferenceSerializer(serializers.ModelSerializer):
    # food_inherit_default = FoodInheritFieldSerializer(source='space.food_inherit', read_only=True)
    food_ignore_default = serializers.SerializerMethodField('get_ignore_default')

    def get_ignore_default(self, obj):
        return FoodInheritFieldSerializer(Food.inherit_fields.difference(obj.space.food_inherit.all()), many=True).data

    def create(self, validated_data):
        if validated_data['user'] != self.context['request'].user:
            raise NotFound()
        return super().create(validated_data)

    class Meta:
        model = UserPreference
        fields = (
            'user', 'theme', 'nav_color', 'default_unit', 'default_page',
            'search_style', 'show_recent', 'plan_share', 'ingredient_decimals',
            'comments', 'shopping_auto_sync', 'mealplan_autoadd_shopping', 'food_ignore_default', 'default_delay',
            'mealplan_autoinclude_related', 'mealplan_autoexclude_onhand', 'shopping_share'
        )


class UserFileSerializer(serializers.ModelSerializer):

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
        self.check_file_limit(validated_data)
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self.check_file_limit(validated_data)
        return super().update(instance, validated_data)

    class Meta:
        model = UserFile
        fields = ('name', 'file', 'file_size_kb', 'id',)
        read_only_fields = ('id', 'file_size_kb')
        extra_kwargs = {"file": {"required": False, }}


class UserFileViewSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        raise ValidationError('Cannot create File over this view')

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserFile
        fields = ('name', 'file', 'id',)
        read_only_fields = ('id', 'file')


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
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        obj, created = Keyword.objects.get_or_create(**validated_data)
        return obj

    class Meta:
        model = Keyword
        fields = (
            'id', 'name', 'icon', 'label', 'description', 'image', 'parent', 'numchild', 'numrecipe')
        read_only_fields = ('id', 'label', 'image', 'parent', 'numchild', 'numrecipe')


class UnitSerializer(UniqueFieldsMixin, ExtendedRecipeMixin):

    recipe_filter = 'steps__ingredients__unit'

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        obj, created = Unit.objects.get_or_create(**validated_data)
        return obj

    def update(self, instance, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        return super(UnitSerializer, self).update(instance, validated_data)

    class Meta:
        model = Unit
        fields = ('id', 'name', 'description', 'numrecipe', 'image')
        read_only_fields = ('id', 'numrecipe', 'image')


class SupermarketCategorySerializer(UniqueFieldsMixin, WritableNestedModelSerializer):

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        obj, created = SupermarketCategory.objects.get_or_create(**validated_data)
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


class SupermarketSerializer(UniqueFieldsMixin, SpacedModelSerializer):
    category_to_supermarket = SupermarketCategoryRelationSerializer(many=True, read_only=True)

    class Meta:
        model = Supermarket
        fields = ('id', 'name', 'description', 'category_to_supermarket')


class RecipeSimpleSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField('get_url')

    def get_url(self, obj):
        return reverse('view_recipe', args=[obj.id])

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'url')
        read_only_fields = ['id', 'name', 'url']


class FoodSerializer(UniqueFieldsMixin, WritableNestedModelSerializer, ExtendedRecipeMixin):
    supermarket_category = SupermarketCategorySerializer(allow_null=True, required=False)
    recipe = RecipeSimpleSerializer(allow_null=True, required=False)
    shopping = serializers.SerializerMethodField('get_shopping_status')
    ignore_inherit = FoodInheritFieldSerializer(many=True)

    recipe_filter = 'steps__ingredients__food'

    def get_shopping_status(self, obj):
        return ShoppingListEntry.objects.filter(space=obj.space, food=obj, checked=False).count() > 0

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        print('food', self.__class__, self.parent.__class__)
        # extended values are computationally expensive and not needed in normal circumstances
        if not bool(int(self.context['request'].query_params.get('extended', False))) or not self.parent:
            del fields['image']
            del fields['numrecipe']
        return fields

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        # supermarket category needs to be handled manually as food.get or create does not create nested serializers unlike a super.create of serializer
        if 'supermarket_category' in validated_data and validated_data['supermarket_category']:
            validated_data['supermarket_category'], sc_created = SupermarketCategory.objects.get_or_create(
                name=validated_data.pop('supermarket_category')['name'],
                space=self.context['request'].space)
        obj, created = Food.objects.get_or_create(**validated_data)
        return obj

    def update(self, instance, validated_data):
        if name := validated_data.get('name', None):
            validated_data['name'] = name.strip()
        return super(FoodSerializer, self).update(instance, validated_data)

    class Meta:
        model = Food
        fields = (
            'id', 'name', 'description', 'shopping', 'recipe', 'ignore_shopping', 'supermarket_category',
            'image', 'parent', 'numchild', 'numrecipe', 'on_hand', 'inherit', 'ignore_inherit',
        )
        read_only_fields = ('id', 'numchild', 'parent', 'image', 'numrecipe')


class IngredientSerializer(WritableNestedModelSerializer):
    food = FoodSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True)
    amount = CustomDecimalField()

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Ingredient
        fields = (
            'id', 'food', 'unit', 'amount', 'note', 'order',
            'is_header', 'no_amount'
        )


class StepSerializer(WritableNestedModelSerializer, ExtendedRecipeMixin):
    ingredients = IngredientSerializer(many=True)
    ingredients_markdown = serializers.SerializerMethodField('get_ingredients_markdown')
    ingredients_vue = serializers.SerializerMethodField('get_ingredients_vue')
    file = UserFileViewSerializer(allow_null=True, required=False)
    step_recipe_data = serializers.SerializerMethodField('get_step_recipe_data')
    recipe_filter = 'steps'

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def get_ingredients_vue(self, obj):
        return obj.get_instruction_render()

    def get_ingredients_markdown(self, obj):
        return obj.get_instruction_render()

    def get_step_recipes(self, obj):
        return list(obj.recipe_set.values_list('id', flat=True).all())

    def get_step_recipe_data(self, obj):
        # check if root type is recipe to prevent infinite recursion
        # can be improved later to allow multi level embedding
        if obj.step_recipe and type(self.parent.root) == RecipeSerializer:
            return StepRecipeSerializer(obj.step_recipe).data

    class Meta:
        model = Step
        fields = (
            'id', 'name', 'type', 'instruction', 'ingredients', 'ingredients_markdown',
            'ingredients_vue', 'time', 'order', 'show_as_header', 'file', 'step_recipe', 'step_recipe_data', 'numrecipe'
        )


class StepRecipeSerializer(WritableNestedModelSerializer):
    steps = StepSerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'steps',
        )


class NutritionInformationSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = NutritionInformation
        fields = ('id', 'carbohydrates', 'fats', 'proteins', 'calories', 'source')


class RecipeBaseSerializer(WritableNestedModelSerializer):
    def get_recipe_rating(self, obj):
        try:
            rating = obj.cooklog_set.filter(created_by=self.context['request'].user, rating__gt=0).aggregate(
                Avg('rating'))
            if rating['rating__avg']:
                return rating['rating__avg']
        except TypeError:
            pass
        return 0

    def get_recipe_last_cooked(self, obj):
        try:
            last = obj.cooklog_set.filter(created_by=self.context['request'].user).last()
            if last:
                return last.created_at
        except TypeError:
            pass
        return None

    # TODO make days of new recipe a setting
    def is_recipe_new(self, obj):
        if obj.created_at > (timezone.now() - timedelta(days=7)):
            return True
        else:
            return False


class RecipeOverviewSerializer(RecipeBaseSerializer):
    keywords = KeywordLabelSerializer(many=True)
    rating = serializers.SerializerMethodField('get_recipe_rating')
    last_cooked = serializers.SerializerMethodField('get_recipe_last_cooked')
    new = serializers.SerializerMethodField('is_recipe_new')

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at',
            'internal', 'servings', 'servings_text', 'rating', 'last_cooked', 'new'
        )
        read_only_fields = ['image', 'created_by', 'created_at']


class RecipeSerializer(RecipeBaseSerializer):
    nutrition = NutritionInformationSerializer(allow_null=True, required=False)
    steps = StepSerializer(many=True)
    keywords = KeywordSerializer(many=True)
    rating = serializers.SerializerMethodField('get_recipe_rating')
    last_cooked = serializers.SerializerMethodField('get_recipe_last_cooked')

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'steps', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at',
            'internal', 'nutrition', 'servings', 'file_path', 'servings_text', 'rating', 'last_cooked',
        )
        read_only_fields = ['image', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class RecipeImageSerializer(WritableNestedModelSerializer):
    class Meta:
        model = Recipe
        fields = ['image', ]


class RecipeImportSerializer(SpacedModelSerializer):
    class Meta:
        model = RecipeImport
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class RecipeBookSerializer(SpacedModelSerializer, WritableNestedModelSerializer):
    shared = UserNameSerializer(many=True)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = RecipeBook
        fields = ('id', 'name', 'description', 'icon', 'shared', 'created_by')
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
        if not book.get_owner() == self.context['request'].user:
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
    shared = UserNameSerializer(many=True)

    def get_note_markdown(self, obj):
        return markdown(obj.note)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        mealplan = super().create(validated_data)
        if self.context['request'].data.get('addshopping', False):
            ShoppingListEntry.list_from_recipe(mealplan=mealplan, space=validated_data['space'], created_by=validated_data['created_by'])
        return mealplan

    class Meta:
        model = MealPlan
        fields = (
            'id', 'title', 'recipe', 'servings', 'note', 'note_markdown',
            'date', 'meal_type', 'created_by', 'shared', 'recipe_name',
            'meal_type_name'
        )
        read_only_fields = ('created_by',)


class ShoppingListRecipeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField('get_name')  # should this be done at the front end?
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    mealplan_note = serializers.ReadOnlyField(source='mealplan.note')
    servings = CustomDecimalField()

    def get_name(self, obj):
        if not isinstance(value := obj.servings, Decimal):
            value = Decimal(value)
        value = value.quantize(Decimal(1)) if value == value.to_integral() else value.normalize()  # strips trailing zero
        return (
            obj.name
            or getattr(obj.mealplan, 'title', None)
            or (d := getattr(obj.mealplan, 'date', None)) and ': '.join([obj.mealplan.recipe.name, str(d)])
            or obj.recipe.name
        ) + f' ({value:.2g})'

    def update(self, instance, validated_data):
        if 'servings' in validated_data:
            ShoppingListEntry.list_from_recipe(
                list_recipe=instance,
                servings=validated_data['servings'],
                created_by=self.context['request'].user,
                space=self.context['request'].space
            )
        return super().update(instance, validated_data)

    class Meta:
        model = ShoppingListRecipe
        fields = ('id', 'recipe_name', 'name', 'recipe', 'mealplan', 'servings', 'mealplan_note')
        read_only_fields = ('id',)


class ShoppingListEntrySerializer(WritableNestedModelSerializer):
    food = FoodSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True, required=False)
    ingredient_note = serializers.ReadOnlyField(source='ingredient.note')
    recipe_mealplan = ShoppingListRecipeSerializer(source='list_recipe', read_only=True)
    amount = CustomDecimalField()
    created_by = UserNameSerializer(read_only=True)
    completed_at = serializers.DateTimeField(allow_null=True)

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        # try:
        #     # this serializer is the parent serializer for the API
        #     api_serializer = self.context['view'].serializer_class
        # except Exception:
        #     # this serializer is probably nested or a foreign key
        #     api_serializer = None

        # autosync values are only needed for frequent 'checked' value updating
        if self.context['request'] and bool(int(self.context['request'].query_params.get('autosync', False))):
            for f in list(set(fields) - set(['id', 'checked'])):
                del fields[f]
        # extended values are computationally expensive and not needed in normal circumstances
        # elif bool(int(self.context['request'].query_params.get('extended', False))) and self.__class__ == api_serializer:
        #     pass
        # else:
        #     del fields['recipe_mealplan']
        return fields

    def run_validation(self, data):
        if (
            data.get('checked', False)
            and not (id := data.get('id', None))
            and not ShoppingListEntry.objects.get(id=id).checked
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

        ############################################################
        # temporary while old and new shopping lists are both in use
        try:
            # this serializer is the parent serializer for the API
            api_serializer = self.context['view'].serializer_class
        except Exception:
            # this serializer is probably nested or a foreign key
            api_serializer = None
        if self.context['request'].method == 'POST' and not self.__class__ == api_serializer:
            data['space'] = self.context['request'].space.id
            data['created_by'] = self.context['request'].user.id
        ############################################################
        if self.context['request'].method == 'POST' and self.__class__ == api_serializer:
            data['created_by'] = {'id': self.context['request'].user.id}
        return super().run_validation(data)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = ShoppingListEntry
        fields = (
            'id', 'list_recipe', 'food', 'unit', 'ingredient', 'ingredient_note', 'amount', 'order', 'checked', 'recipe_mealplan',
            'created_by', 'created_at', 'completed_at', 'delay_until'
        )
        read_only_fields = ('id',  'created_by', 'created_at',)


# TODO deprecate
class ShoppingListEntryCheckedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListEntry
        fields = ('id', 'checked')


# TODO deprecate
class ShoppingListSerializer(WritableNestedModelSerializer):
    recipes = ShoppingListRecipeSerializer(many=True, allow_null=True)
    entries = ShoppingListEntrySerializer(many=True, allow_null=True)
    shared = UserNameSerializer(many=True)
    supermarket = SupermarketSerializer(allow_null=True)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = ShoppingList
        fields = (
            'id', 'uuid', 'note', 'recipes', 'entries',
            'shared', 'finished', 'supermarket', 'created_by', 'created_at'
        )
        read_only_fields = ('id', 'created_by',)


# TODO deprecate
class ShoppingListAutoSyncSerializer(WritableNestedModelSerializer):
    entries = ShoppingListEntryCheckedSerializer(many=True, allow_null=True)

    class Meta:
        model = ShoppingList
        fields = ('id', 'entries',)
        read_only_fields = ('id',)


class ShareLinkSerializer(SpacedModelSerializer):
    class Meta:
        model = ShareLink
        fields = '__all__'


class CookLogSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = CookLog
        fields = ('id', 'recipe', 'servings', 'rating', 'created_by', 'created_at')
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


class AutomationSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Automation
        fields = (
            'id', 'type', 'name', 'description', 'param_1', 'param_2', 'param_3', 'disabled', 'created_by',)
        read_only_fields = ('created_by',)


# CORS, REST and Scopes aren't currently working
# Scopes are evaluating before REST has authenticated the user assiging a None space
# I've made the change below to fix the bookmarklet, other serializers likely need a similar/better fix
class BookmarkletImportSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].user.userpreference.space
        return super().create(validated_data)

    class Meta:
        model = BookmarkletImport
        fields = ('id', 'url', 'html', 'created_by', 'created_at')
        read_only_fields = ('created_by', 'space')


# Export/Import Serializers

class KeywordExportSerializer(KeywordSerializer):
    class Meta:
        model = Keyword
        fields = ('name', 'icon', 'description', 'created_at', 'updated_at')


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
        fields = ('name', 'description')


class FoodExportSerializer(FoodSerializer):
    supermarket_category = SupermarketCategoryExportSerializer(allow_null=True, required=False)

    class Meta:
        model = Food
        fields = ('name', 'ignore_shopping', 'supermarket_category', 'on_hand')


class IngredientExportSerializer(WritableNestedModelSerializer):
    food = FoodExportSerializer(allow_null=True)
    unit = UnitExportSerializer(allow_null=True)
    amount = CustomDecimalField()

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Ingredient
        fields = ('food', 'unit', 'amount', 'note', 'order', 'is_header', 'no_amount')


class StepExportSerializer(WritableNestedModelSerializer):
    ingredients = IngredientExportSerializer(many=True)

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    class Meta:
        model = Step
        fields = ('name', 'type', 'instruction', 'ingredients', 'time', 'order', 'show_as_header')


class RecipeExportSerializer(WritableNestedModelSerializer):
    nutrition = NutritionInformationSerializer(allow_null=True, required=False)
    steps = StepExportSerializer(many=True)
    keywords = KeywordExportSerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'name', 'description', 'keywords', 'steps', 'working_time',
            'waiting_time', 'internal', 'nutrition', 'servings', 'servings_text',
        )

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)


class RecipeShoppingUpdateSerializer(serializers.ModelSerializer):
    list_recipe = serializers.IntegerField(write_only=True, allow_null=True, required=False, help_text=_("Existing shopping list to update"))
    ingredients = serializers.IntegerField(write_only=True, allow_null=True, required=False, help_text=_(
        "List of ingredient IDs from the recipe to add, if not provided all ingredients will be added."))
    servings = serializers.IntegerField(default=1, write_only=True, allow_null=True, required=False, help_text=_("Providing a list_recipe ID and servings of 0 will delete that shopping list."))

    class Meta:
        model = Recipe
        fields = ['id', 'list_recipe', 'ingredients', 'servings', ]


class FoodShoppingUpdateSerializer(serializers.ModelSerializer):
    amount = serializers.IntegerField(write_only=True, allow_null=True, required=False, help_text=_("Amount of food to add to the shopping list"))
    unit = serializers.IntegerField(write_only=True, allow_null=True, required=False, help_text=_("ID of unit to use for the shopping list"))
    delete = serializers.ChoiceField(choices=['true'], write_only=True, allow_null=True, allow_blank=True, help_text=_("When set to true will delete all food from active shopping lists."))

    class Meta:
        model = Recipe
        fields = ['id', 'amount', 'unit', 'delete', ]
