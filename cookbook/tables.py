import django_tables2 as tables
from django.utils.html import format_html
from django.utils.translation import gettext as _
from django_tables2.utils import A  # alias for Accessor

from .models import *


class ImageUrlColumn(tables.Column):
    def render(self, value):
        if value.url:
            return value.url
        return None


class RecipeTable(tables.Table):
    edit = tables.TemplateColumn("<a href='{% url 'edit_recipe' record.id %}' >" + _('Edit') + "</a>")
    name = tables.LinkColumn('view_recipe', args=[A('id')])
    all_tags = tables.Column(
        attrs={'td': {'class': 'd-none d-lg-table-cell'}, 'th': {'class': 'd-none d-lg-table-cell'}})
    image = ImageUrlColumn()

    class Meta:
        model = Recipe
        template_name = 'recipes_table.html'
        fields = ('id', 'name', 'all_tags', 'image', 'instructions', 'working_time', 'waiting_time', 'internal')


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_keyword', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'icon', 'name')


class IngredientTable(tables.Table):
    id = tables.LinkColumn('edit_ingredient', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'name')


class StorageTable(tables.Table):
    id = tables.LinkColumn('edit_storage', args=[A('id')])

    class Meta:
        model = Storage
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'method')


class ImportLogTable(tables.Table):
    sync_id = tables.LinkColumn('edit_sync', args=[A('sync_id')])

    @staticmethod
    def render_status(value):
        if value == 'SUCCESS':
            return format_html('<span class="badge badge-success">%s</span>' % value)
        else:
            return format_html('<span class="badge badge-danger">%s</span>' % value)

    class Meta:
        model = SyncLog
        template_name = 'generic/table_template.html'
        fields = ('status', 'msg', 'sync_id', 'created_at')


class SyncTable(tables.Table):
    id = tables.LinkColumn('edit_sync', args=[A('id')])

    @staticmethod
    def render_path(value):
        return format_html('<code>%s</code>' % value)

    @staticmethod
    def render_storage(value):
        return format_html('<span class="badge badge-success">%s</span>' % value)

    class Meta:
        model = Sync
        template_name = 'generic/table_template.html'
        fields = ('id', 'path', 'storage', 'last_checked')


class RecipeImportTable(tables.Table):
    id = tables.LinkColumn('new_recipe_import', args=[A('id')])
    delete = tables.TemplateColumn("<a href='{% url 'delete_recipe_import' record.id %}' >" + _('Delete') + "</a>")

    class Meta:
        model = RecipeImport
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'file_path')
