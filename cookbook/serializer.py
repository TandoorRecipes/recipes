from django.contrib.auth.models import User
from rest_framework import serializers

from cookbook.models import MealPlan, MealType, Recipe, ViewLog
from cookbook.templatetags.custom_tags import markdown


class UserNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class MealPlanSerializer(serializers.ModelSerializer):
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    meal_type_name = serializers.ReadOnlyField(source='meal_type.name')
    note_markdown = serializers.SerializerMethodField('get_note_markdown')

    def get_note_markdown(self, obj):
        return markdown(obj.note)

    class Meta:
        model = MealPlan
        fields = ('id', 'title', 'recipe', 'note', 'note_markdown', 'date', 'meal_type', 'created_by', 'shared', 'recipe_name', 'meal_type_name')


class MealTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealType
        fields = '__all__'


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'


class ViewLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewLog
        fields = '__all__'
