import django_tables2 as tables
from django_tables2.utils import A  # alias for Accessor
from django.utils.translation import gettext as _

from .models import *


class RecipeTable(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])
    name = tables.TemplateColumn(
        "<a href='#' onClick='openRecipe({{record.id}})'>{{record.name}}</a>")
    category = tables.Column(
        attrs={'td': {'class': 'd-none d-lg-table-cell'}, 'th': {'class': 'd-none d-lg-table-cell'}})
    all_tags = tables.Column(
        attrs={'td': {'class': 'd-none d-lg-table-cell'}, 'th': {'class': 'd-none d-lg-table-cell'}})
    delete = tables.TemplateColumn("<a href='{% url 'delete_recipe' record.id %}' >" + _('Delete') + "</a>")  # TODO remove and put into edit page

    class Meta:
        model = Recipe
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'category', 'all_tags')


class CategoryTable(tables.Table):
    id = tables.LinkColumn('edit_category', args=[A('id')])
    delete = tables.TemplateColumn("<a href='{% url 'delete_category' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = Category
        template_name = 'generic/table_template.html'
        fields = ('id', 'name')


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_keyword', args=[A('id')])
    delete = tables.TemplateColumn("<a href='{% url 'delete_keyword' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'name')


class ImportLogTable(tables.Table):
    monitor_id = tables.LinkColumn('edit_monitor', args=[A('monitor_id')])

    class Meta:
        model = ImportLog
        template_name = 'generic/table_template.html'
        fields = ('status', 'msg', 'monitor_id', 'created_at')


class MonitoredPathTable(tables.Table):
    id = tables.LinkColumn('edit_monitor', args=[A('id')])
    delete = tables.TemplateColumn("<a href='{% url 'delete_monitor' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = Monitor
        template_name = 'generic/table_template.html'
        fields = ('id', 'path', 'last_checked')


class NewRecipeTable(tables.Table):
    delete = tables.TemplateColumn("<a href='{% url 'delete_new_recipe' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = NewRecipe
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'path')
