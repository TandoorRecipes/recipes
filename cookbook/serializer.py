import random
from datetime import timedelta
from decimal import Decimal
from gettext import gettext as _
from django.contrib.auth.models import User
from django.db.models import QuerySet, Sum, Avg
from django.utils import timezone
from drf_writable_nested import (UniqueFieldsMixin,
                                 WritableNestedModelSerializer)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, NotFound

from cookbook.models import (Comment, CookLog, Food, Ingredient, Keyword,
                             MealPlan, MealType, NutritionInformation, Recipe,
                             RecipeBook, RecipeBookEntry, RecipeImport,
                             ShareLink, ShoppingList, ShoppingListEntry,
                             ShoppingListRecipe, Step, Storage, Sync, SyncLog,
                             Unit, UserPreference, ViewLog, SupermarketCategory, Supermarket,
                             SupermarketCategoryRelation, ImportLog, BookmarkletImport, UserFile)
from cookbook.templatetags.custom_tags import markdown


class CustomDecimalField(serializers.Field):
    """
    Custom decimal field to normalize useless decimal places
    and allow commas as decimal separators
    """

    def to_representation(self, value):
        if isinstance(value, Decimal):
            return value.normalize()
        else:
            return Decimal(value).normalize()

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


class MealTypeSerializer(SpacedModelSerializer):

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = MealType
        fields = ('id', 'name', 'order', 'created_by')
        read_only_fields = ('created_by',)


class UserNameSerializer(WritableNestedModelSerializer):
    username = serializers.SerializerMethodField('get_user_label')

    def get_user_label(self, obj):
        return obj.get_user_name()

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = User
        fields = ('id', 'username')


class UserPreferenceSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        if validated_data['user'] != self.context['request'].user:
            raise NotFound()
        return super().create(validated_data)

    class Meta:
        model = UserPreference
        fields = (
            'user', 'theme', 'nav_color', 'default_unit', 'default_page',
            'search_style', 'show_recent', 'plan_share', 'ingredient_decimals',
            'comments'
        )


class UserFileSerializer(serializers.ModelSerializer):

    def check_file_limit(self, validated_data):
        if self.context['request'].space.max_file_storage_mb == -1:
            raise ValidationError(_('File uploads are not enabled for this Space.'))

        try:
            current_file_size_mb = UserFile.objects.filter(space=self.context['request'].space).aggregate(Sum('file_size_kb'))['file_size_kb__sum'] / 1000
        except TypeError:
            current_file_size_mb = 0

        if (validated_data['file'].size / 1000 / 1000 + current_file_size_mb - 5) > self.context['request'].space.max_file_storage_mb != 0:
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


class KeywordSerializer(UniqueFieldsMixin, serializers.ModelSerializer):
    label = serializers.SerializerMethodField('get_label')
    image = serializers.SerializerMethodField('get_image')
    numrecipe = serializers.SerializerMethodField('count_recipes')

    def get_label(self, obj):
        return str(obj)

    def get_image(self, obj):
        recipes = obj.recipe_set.all().filter(space=obj.space).exclude(image__isnull=True).exclude(image__exact='')
        if len(recipes) == 0:
            recipes = Recipe.objects.filter(keywords__in=obj.get_tree(), space=obj.space).exclude(image__isnull=True).exclude(image__exact='')  # if no recipes found - check whole tree
        if len(recipes) != 0:
            return random.choice(recipes).image.url
        else:
            return None

    def count_recipes(self, obj):
        return obj.recipe_set.filter(space=self.context['request'].space).all().count()

    def create(self, validated_data):
        # since multi select tags dont have id's
        # duplicate names might be routed to create
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        obj, created = Keyword.objects.get_or_create(**validated_data)
        return obj

    class Meta:
        # list_serializer_class = SpaceFilterSerializer
        model = Keyword
        fields = ('id', 'name', 'icon', 'label', 'description', 'image', 'parent', 'numchild', 'numrecipe', 'created_at', 'updated_at')
        read_only_fields = ('id', 'numchild', 'parent', 'image')


class UnitSerializer(UniqueFieldsMixin, serializers.ModelSerializer):

    def create(self, validated_data):
        obj, created = Unit.objects.get_or_create(name=validated_data['name'].strip(), space=self.context['request'].space)
        return obj

    def update(self, instance, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        return super(UnitSerializer, self).update(instance, validated_data)

    class Meta:
        model = Unit
        fields = ('id', 'name', 'description')
        read_only_fields = ('id',)


class SupermarketCategorySerializer(UniqueFieldsMixin, WritableNestedModelSerializer):

    def create(self, validated_data):
        obj, created = SupermarketCategory.objects.get_or_create(name=validated_data['name'], space=self.context['request'].space)
        return obj

    def update(self, instance, validated_data):
        return super(SupermarketCategorySerializer, self).update(instance, validated_data)

    class Meta:
        model = SupermarketCategory
        fields = ('id', 'name')


class SupermarketCategoryRelationSerializer(WritableNestedModelSerializer):
    category = SupermarketCategorySerializer()

    class Meta:
        model = SupermarketCategoryRelation
        fields = ('id', 'category', 'supermarket', 'order')


class SupermarketSerializer(UniqueFieldsMixin, SpacedModelSerializer):
    category_to_supermarket = SupermarketCategoryRelationSerializer(many=True, read_only=True)

    class Meta:
        model = Supermarket
        fields = ('id', 'name', 'category_to_supermarket')


class FoodSerializer(UniqueFieldsMixin, WritableNestedModelSerializer):
    supermarket_category = SupermarketCategorySerializer(allow_null=True, required=False)

    def create(self, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        validated_data['space'] = self.context['request'].space
        obj, created = Food.objects.get_or_create(validated_data)
        return obj

    def update(self, instance, validated_data):
        validated_data['name'] = validated_data['name'].strip()
        return super(FoodSerializer, self).update(instance, validated_data)

    class Meta:
        model = Food
        fields = ('id', 'name', 'recipe', 'ignore_shopping', 'supermarket_category')


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


class StepSerializer(WritableNestedModelSerializer):
    ingredients = IngredientSerializer(many=True)
    ingredients_markdown = serializers.SerializerMethodField('get_ingredients_markdown')
    ingredients_vue = serializers.SerializerMethodField('get_ingredients_vue')
    file = UserFileViewSerializer(allow_null=True, required=False)
    step_recipe_data = serializers.SerializerMethodField('get_step_recipe_data')

    def create(self, validated_data):
        validated_data['space'] = self.context['request'].space
        return super().create(validated_data)

    def get_ingredients_vue(self, obj):
        return obj.get_instruction_render()

    def get_ingredients_markdown(self, obj):
        return obj.get_instruction_render()

    def get_step_recipe_data(self, obj):
        # check if root type is recipe to prevent infinite recursion
        # can be improved later to allow multi level embedding
        if obj.step_recipe and type(self.parent.root) == RecipeSerializer:
            return StepRecipeSerializer(obj.step_recipe).data

    class Meta:
        model = Step
        fields = (
            'id', 'name', 'type', 'instruction', 'ingredients', 'ingredients_markdown',
            'ingredients_vue', 'time', 'order', 'show_as_header', 'file', 'step_recipe', 'step_recipe_data'
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
            rating = obj.cooklog_set.filter(created_by=self.context['request'].user, rating__gt=0).aggregate(Avg('rating'))
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


class RecipeBookSerializer(SpacedModelSerializer):

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
    meal_type_name = serializers.ReadOnlyField(source='meal_type.name')
    note_markdown = serializers.SerializerMethodField('get_note_markdown')
    servings = CustomDecimalField()

    def get_note_markdown(self, obj):
        return markdown(obj.note)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    class Meta:
        model = MealPlan
        fields = (
            'id', 'title', 'recipe', 'servings', 'note', 'note_markdown',
            'date', 'meal_type', 'created_by', 'shared', 'recipe_name',
            'meal_type_name'
        )
        read_only_fields = ('created_by',)


class ShoppingListRecipeSerializer(serializers.ModelSerializer):
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    servings = CustomDecimalField()

    class Meta:
        model = ShoppingListRecipe
        fields = ('id', 'recipe', 'recipe_name', 'servings')
        read_only_fields = ('id',)


class ShoppingListEntrySerializer(WritableNestedModelSerializer):
    food = FoodSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True, required=False)
    amount = CustomDecimalField()

    class Meta:
        model = ShoppingListEntry
        fields = (
            'id', 'list_recipe', 'food', 'unit', 'amount', 'order', 'checked'
        )


class ShoppingListEntryCheckedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListEntry
        fields = ('id', 'checked')


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
        fields = ('id', 'type', 'msg', 'running', 'keyword', 'total_recipes', 'imported_recipes', 'created_by', 'created_at')
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
        fields = ('name', 'ignore_shopping', 'supermarket_category')


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
