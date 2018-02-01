import django_tables2 as tables
from django_tables2.utils import A  # alias for Accessor

from .models import *


class RecipeTable(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])

    class Meta:
        model = Recipe
        template_name = 'tables/table_template.html'
        fields = ('id', 'name', 'category', 'all_tags')


class CategoryTable(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])

    class Meta:
        model = Category
        template_name = 'tables/table_template.html'
        fields = ('id', 'name')


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'tables/table_template.html'
        fields = ('id', 'name')
