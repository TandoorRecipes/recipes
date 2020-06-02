from rest_framework import serializers

from cookbook.models import MealPlan


class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = ['recipe', 'title', 'note', 'meal_type']
