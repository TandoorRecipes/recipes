import django_filters

from cookbook.models import Recipe


class RecipeFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='iexact')

    class Meta:
        model = Recipe
        fields = ['name', 'category', 'keywords']
