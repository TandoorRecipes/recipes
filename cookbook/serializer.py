from django.contrib.auth.models import User
from rest_framework import serializers

from cookbook.models import MealPlan, MealType, Recipe, ViewLog, UserPreference, Storage, Sync, SyncLog, Keyword, Ingredient, Unit, RecipeIngredient, Comment, RecipeImport, RecipeBook, RecipeBookEntry, ShareLink, CookLog
from cookbook.templatetags.custom_tags import markdown


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
        fields = '__all__'


class SyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sync
        fields = '__all__'


class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = '__all__'


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = '__all__'


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class RecipeImportSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImport
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
