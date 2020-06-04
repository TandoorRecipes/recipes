from rest_framework import serializers

from cookbook.models import MealPlan, MealType


class MealPlanSerializer(serializers.ModelSerializer):
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    meal_type_name = serializers.ReadOnlyField(source='meal_type.name')

    class Meta:
        model = MealPlan
        fields = ('id', 'title', 'recipe', 'date', 'meal_type', 'recipe_name', 'meal_type_name')


class MealTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealType
        fields = '__all__'
