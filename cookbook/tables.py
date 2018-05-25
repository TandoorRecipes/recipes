import django_tables2 as tables
from django.utils.html import format_html
from django.utils.translation import gettext as _
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
        fields = ('id', 'icon', 'name')


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_keyword', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'icon', 'name')


class ImportLogTable(tables.Table):
    monitor_id = tables.LinkColumn('edit_monitor', args=[A('monitor_id')])

    @staticmethod
    def render_status(value):
        if value == 'SUCCESS':
            return format_html('<span class="badge badge-success">%s</span>' % value)
        else:
            return format_html('<span class="badge badge-error">%s</span>' % value)

    class Meta:
        model = SyncLog
        template_name = 'generic/table_template.html'
        fields = ('status', 'msg', 'monitor_id', 'created_at')


class MonitoredPathTable(tables.Table):
    id = tables.LinkColumn('edit_monitor', args=[A('id')])

    @staticmethod
    def render_path(value):
        return format_html('<code>%s</code>' % value)

    class Meta:
        model = Sync
        template_name = 'generic/table_template.html'
        fields = ('id', 'path', 'last_checked')


class RecipeImportTable(tables.Table):
    id = tables.LinkColumn('new_recipe_import', args=[A('id')])
    delete = tables.TemplateColumn("<a href='{% url 'delete_import' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = RecipeImport
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'path')
