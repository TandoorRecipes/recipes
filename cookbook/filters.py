import django_filters
from django.conf import settings
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q
from django.utils.translation import gettext as _

from cookbook.forms import MultiSelectWidget
from cookbook.models import Food, Keyword, Recipe, ShoppingList


class RecipeFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(method='filter_name')
    keywords = django_filters.ModelMultipleChoiceFilter(
        queryset=Keyword.objects.all(),
        widget=MultiSelectWidget,
        method='filter_keywords'
    )
    foods = django_filters.ModelMultipleChoiceFilter(
        queryset=Food.objects.all(),
        widget=MultiSelectWidget,
        method='filter_foods',
        label=_('Ingredients')
    )

    @staticmethod
    def filter_keywords(queryset, name, value):
        if not name == 'keywords':
            return queryset
        for x in value:
            queryset = queryset.filter(keywords=x)
        return queryset

    @staticmethod
    def filter_foods(queryset, name, value):
        if not name == 'foods':
            return queryset
        for x in value:
            queryset = queryset.filter(
                steps__ingredients__food__name=x
            ).distinct()
        return queryset

    @staticmethod
    def filter_name(queryset, name, value):
        if not name == 'name':
            return queryset
        if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql_psycopg2':  # noqa: E501
            queryset = queryset \
                .annotate(similarity=TrigramSimilarity('name', value), ) \
                .filter(Q(similarity__gt=0.1) | Q(name__unaccent__icontains=value)) \
                .order_by('-similarity')
        else:
            queryset = queryset.filter(name__icontains=value)
        return queryset

    class Meta:
        model = Recipe
        fields = ['name', 'keywords', 'foods', 'internal']


class IngredientFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Food
        fields = ['name']


class ShoppingListFilter(django_filters.FilterSet):

    def __init__(self, data=None, *args, **kwargs):
        if data is not None:
            data = data.copy()
            data.setdefault("finished", False)
        super(ShoppingListFilter, self).__init__(data, *args, **kwargs)

    class Meta:
        model = ShoppingList
        fields = ['finished']
