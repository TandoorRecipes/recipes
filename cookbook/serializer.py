from django.contrib.auth.models import User
from drf_writable_nested import WritableNestedModelSerializer, UniqueFieldsMixin
from rest_framework import serializers
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.fields import CurrentUserDefault

from cookbook.models import MealPlan, MealType, Recipe, ViewLog, UserPreference, Storage, Sync, SyncLog, Keyword, Unit, Ingredient, Comment, RecipeImport, RecipeBook, RecipeBookEntry, ShareLink, CookLog, Food, Step
from cookbook.templatetags.custom_tags import markdown


class CustomDecimalField(serializers.Field):
    """
        Custom decimal field to normalize useless decimal places and allow commas as decimal separators
    """

    def to_representation(self, value):
        return value.normalize()

    def to_internal_value(self, data):
        if type(data) == int or type(data) == float:
            return data
        elif type(data) == str:
            try:
                return float(data.replace(',', ''))
            except ValueError:
                raise ValidationError('A valid number is required')


class UserNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = '__all__'
        read_only_fields = ['user']


class StorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Storage
        fields = ('id', 'name', 'method', 'username', 'created_by')


class SyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sync
        fields = '__all__'


class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = '__all__'


class KeywordSerializer(UniqueFieldsMixin, serializers.ModelSerializer):
    def create(self, validated_data):
        # since multi select tags dont have id's duplicate names might be routed to create
        obj, created = Keyword.objects.get_or_create(**validated_data)
        return obj

    class Meta:
        model = Keyword
        fields = ('id', 'name', 'icon', 'description', 'created_by', 'created_at', 'updated_at')

        read_only_fields = ('id',)


class UnitSerializer(UniqueFieldsMixin, serializers.ModelSerializer):

    def create(self, validated_data):
        # since multi select tags dont have id's duplicate names might be routed to create
        obj, created = Unit.objects.get_or_create(**validated_data)
        return obj

    class Meta:
        model = Unit
        fields = ('id', 'name', 'description')
        read_only_fields = ('id',)


class FoodSerializer(UniqueFieldsMixin, serializers.ModelSerializer):

    def create(self, validated_data):
        # since multi select tags dont have id's duplicate names might be routed to create
        obj, created = Food.objects.get_or_create(**validated_data)
        return obj

    class Meta:
        model = Food
        fields = ('id', 'name', 'recipe')
        read_only_fields = ('id',)


class IngredientSerializer(WritableNestedModelSerializer):
    food = FoodSerializer()
    unit = UnitSerializer()
    amount = CustomDecimalField()

    class Meta:
        model = Ingredient
        fields = ('id', 'food', 'unit', 'amount', 'note', 'order')


class StepSerializer(WritableNestedModelSerializer):
    ingredients = IngredientSerializer(many=True)

    class Meta:
        model = Step
        fields = '__all__'


class RecipeSerializer(WritableNestedModelSerializer):
    steps = StepSerializer(many=True)
    keywords = KeywordSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'image', 'keywords', 'steps', 'working_time', 'waiting_time', 'created_by', 'created_at', 'updated_at', 'internal']
        read_only_fields = ['image', 'created_by', 'created_at']


class RecipeImageSerializer(WritableNestedModelSerializer):
    class Meta:
        model = Recipe
        fields = ['image', ]


class RecipeImportSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImport
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class RecipeBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeBook
        fields = '__all__'
        read_only_fields = ['id', 'created_by']


class RecipeBookEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeBookEntry
        fields = '__all__'


class MealTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealType
        fields = '__all__'


class MealPlanSerializer(serializers.ModelSerializer):
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    meal_type_name = serializers.ReadOnlyField(source='meal_type.name')
    note_markdown = serializers.SerializerMethodField('get_note_markdown')

    def get_note_markdown(self, obj):
        return markdown(obj.note)

    class Meta:
        model = MealPlan
        fields = ('id', 'title', 'recipe', 'note', 'note_markdown', 'date', 'meal_type', 'created_by', 'shared', 'recipe_name', 'meal_type_name')


class ShareLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareLink
        fields = '__all__'


class CookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CookLog
        fields = '__all__'


class ViewLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewLog
        fields = '__all__'
