from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import QuerySet
from drf_writable_nested import (UniqueFieldsMixin,
                                 WritableNestedModelSerializer)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, NotAuthenticated, NotFound, ParseError
from rest_framework.fields import ModelField
from rest_framework.serializers import BaseSerializer, Serializer

from cookbook.models import (Comment, CookLog, Food, Ingredient, Keyword,
                             MealPlan, MealType, NutritionInformation, Recipe,
                             RecipeBook, RecipeBookEntry, RecipeImport,
                             ShareLink, ShoppingList, ShoppingListEntry,
                             ShoppingListRecipe, Step, Storage, Sync, SyncLog,
                             Unit, UserPreference, ViewLog, SupermarketCategory, Supermarket, SupermarketCategoryRelation, ImportLog)
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
        if type(data) == QuerySet and data.query.is_sliced:
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

    def get_label(self, obj):
        return str(obj)

    def create(self, validated_data):
        obj, created = Keyword.objects.get_or_create(name=validated_data['name'], space=self.context['request'].space)
        return obj

    class Meta:
        list_serializer_class = SpaceFilterSerializer
        model = Keyword
        fields = ('id', 'name', 'icon', 'label', 'description', 'created_at', 'updated_at')

        read_only_fields = ('id',)


class UnitSerializer(UniqueFieldsMixin, serializers.ModelSerializer):

    def create(self, validated_data):
        obj, created = Unit.objects.get_or_create(name=validated_data['name'], space=self.context['request'].space)
        return obj

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


class SupermarketCategoryRelationSerializer(SpacedModelSerializer):
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
        obj, created = Food.objects.get_or_create(name=validated_data['name'], space=self.context['request'].space)
        return obj

    def update(self, instance, validated_data):
        return super(FoodSerializer, self).update(instance, validated_data)

    class Meta:
        model = Food
        fields = ('id', 'name', 'recipe', 'ignore_shopping', 'supermarket_category')


class IngredientSerializer(WritableNestedModelSerializer):
    food = FoodSerializer(allow_null=True)
    unit = UnitSerializer(allow_null=True)
    amount = CustomDecimalField()

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

    def get_ingredients_vue(self, obj):
        return obj.get_instruction_render()

    def get_ingredients_markdown(self, obj):
        return obj.get_instruction_render()

    class Meta:
        model = Step
        fields = (
            'id', 'name', 'type', 'instruction', 'ingredients', 'ingredients_markdown',
            'ingredients_vue', 'time', 'order', 'show_as_header'
        )


class NutritionInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionInformation
        fields = ('id', 'carbohydrates', 'fats', 'proteins', 'calories', 'source')


class RecipeOverviewSerializer(WritableNestedModelSerializer):
    keywords = KeywordLabelSerializer(many=True)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at',
            'internal', 'servings', 'file_path'
        )
        read_only_fields = ['image', 'created_by', 'created_at']


class RecipeSerializer(WritableNestedModelSerializer):
    nutrition = NutritionInformationSerializer(allow_null=True, required=False)
    steps = StepSerializer(many=True)
    keywords = KeywordSerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'description', 'image', 'keywords', 'steps', 'working_time',
            'waiting_time', 'created_by', 'created_at', 'updated_at',
            'internal', 'nutrition', 'servings', 'file_path', 'servings_text',
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

    def create(self, validated_data):
        book = validated_data['book']
        if not book.get_owner() == self.context['request'].user:
            raise NotFound(detail=None, code=None)
        return super().create(validated_data)

    class Meta:
        model = RecipeBookEntry
        fields = ('id', 'book', 'recipe',)


class MealPlanSerializer(SpacedModelSerializer, WritableNestedModelSerializer):
    recipe = RecipeOverviewSerializer()
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
        fields = ('id', 'type', 'msg', 'running', 'keyword', 'created_by', 'created_at')
        read_only_fields = ('created_by',)


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

    class Meta:
        model = Ingredient
        fields = ('food', 'unit', 'amount', 'note', 'order', 'is_header', 'no_amount')


class StepExportSerializer(WritableNestedModelSerializer):
    ingredients = IngredientExportSerializer(many=True)

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
