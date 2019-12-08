import django_filters

from cookbook.forms import MultiSelectWidget
from cookbook.models import Recipe, Keyword


class RecipeFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    keywords = django_filters.ModelMultipleChoiceFilter(queryset=Keyword.objects.all(), widget=MultiSelectWidget,
                                                        method='filter_keywords')

    @staticmethod
    def filter_keywords(queryset, name, value):
        if not name == 'keywords':
            return queryset
        for x in value:
            queryset = queryset.filter(keywords=x)
        return queryset

    class Meta:
        model = Recipe
        fields = ['name', 'keywords']


class QuickRecipeFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='contains')
    keywords = django_filters.ModelMultipleChoiceFilter(queryset=Keyword.objects.all(), widget=MultiSelectWidget,
                                                        method='filter_keywords')

    class Meta:
        model = Recipe
        fields = ['name', 'keywords']
