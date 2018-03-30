import django_tables2 as tables
from django_tables2.utils import A  # alias for Accessor

from .models import *


class RecipeTable(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])
    name = tables.TemplateColumn(
        "<a href='#' onClick='openRecipe({{record.id}})'>{{record.name}}</a>")
    category = tables.Column(
        attrs={'td': {'class': 'd-none d-lg-table-cell'}, 'th': {'class': 'd-none d-lg-table-cell'}})
    all_tags = tables.Column(
        attrs={'td': {'class': 'd-none d-lg-table-cell'}, 'th': {'class': 'd-none d-lg-table-cell'}})

    class Meta:
        model = Recipe
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'category', 'all_tags')


class CategoryTable(tables.Table):
    id = tables.LinkColumn('edit_category', args=[A('id')])

    class Meta:
        model = Category
        template_name = 'generic/table_template.html'
        fields = ('id', 'name')


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_keyword', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'name')


class MonitoredPathTable(tables.Table):
    edit = tables.TemplateColumn("<a href='#' >Löschen</a>")

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('path', 'last_checked')
