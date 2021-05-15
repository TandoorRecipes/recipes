import django_tables2 as tables
from django.utils.html import format_html
from django.utils.translation import gettext as _
from django_tables2.utils import A

from .models import (CookLog, InviteLink, Keyword, Recipe, RecipeImport,
                     ShoppingList, Storage, Sync, SyncLog, ViewLog)


class ImageUrlColumn(tables.Column):
    def render(self, value):
        if value.url:
            return value.url
        return None


class RecipeTableSmall(tables.Table):
    id = tables.LinkColumn('edit_recipe', args=[A('id')])
    name = tables.LinkColumn('view_recipe', args=[A('id')])
    all_tags = tables.Column(
        attrs={
            'td': {'class': 'd-none d-lg-table-cell'},
            'th': {'class': 'd-none d-lg-table-cell'}
        }
    )

    class Meta:
        model = Recipe
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'all_tags')


class RecipeTable(tables.Table):
    edit = tables.TemplateColumn(
        "<a style='color: inherit' href='{% url 'edit_recipe' record.id %}' >" + _('Edit') + "</a>"  # noqa: E501
    )
    name = tables.LinkColumn('view_recipe', args=[A('id')])
    all_tags = tables.Column(
        attrs={
            'td': {'class': 'd-none d-lg-table-cell'},
            'th': {'class': 'd-none d-lg-table-cell'}
        }
    )
    image = ImageUrlColumn()

    class Meta:
        model = Recipe
        template_name = 'recipes_table.html'
        fields = (
            'id', 'name', 'all_tags', 'description', 'image', 'instructions',
            'working_time', 'waiting_time', 'internal'
        )


class KeywordTable(tables.Table):
    id = tables.LinkColumn('edit_keyword', args=[A('id')])

    class Meta:
        model = Keyword
        template_name = 'generic/table_template.html'
        fields = ('id', 'icon', 'name')


class IngredientTable(tables.Table):
    id = tables.LinkColumn('edit_food', args=[A('id')])

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
            return format_html(
                '<span class="badge badge-success">%s</span>' % value
            )
        else:
            return format_html(
                '<span class="badge badge-danger">%s</span>' % value
            )

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
        return format_html(
            '<span class="badge badge-success">%s</span>' % value
        )

    class Meta:
        model = Sync
        template_name = 'generic/table_template.html'
        fields = ('id', 'path', 'storage', 'last_checked')


class RecipeImportTable(tables.Table):
    id = tables.LinkColumn('new_recipe_import', args=[A('id')])
    delete = tables.TemplateColumn(
        "<a href='{% url 'delete_recipe_import' record.id %}' >" + _('Delete') + "</a>"  # noqa: E501
    )

    class Meta:
        model = RecipeImport
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'file_path')


class ShoppingListTable(tables.Table):
    id = tables.LinkColumn('view_shopping', args=[A('id')])

    class Meta:
        model = ShoppingList
        template_name = 'generic/table_template.html'
        fields = ('id', 'finished', 'created_by', 'created_at')


class InviteLinkTable(tables.Table):
    link = tables.TemplateColumn(
        "<a href='{% url 'view_signup' record.uuid %}' >" + _('Link') + "</a>"
    )
    delete = tables.TemplateColumn(
        "<a href='{% url 'delete_invite_link' record.id %}' >" + _('Delete') + "</a>"  # noqa: E501
    )

    class Meta:
        model = InviteLink
        template_name = 'generic/table_template.html'
        fields = (
            'username', 'group', 'valid_until', 'created_by', 'created_at'
        )


class ViewLogTable(tables.Table):
    recipe = tables.LinkColumn('view_recipe', args=[A('recipe_id')])

    class Meta:
        model = ViewLog
        template_name = 'generic/table_template.html'
        fields = ('recipe', 'created_at')


class CookLogTable(tables.Table):
    recipe = tables.LinkColumn('view_recipe', args=[A('recipe_id')])

    class Meta:
        model = CookLog
        template_name = 'generic/table_template.html'
        fields = ('recipe', 'rating', 'serving', 'created_at')
