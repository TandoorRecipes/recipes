import django_tables2 as tables
from django.utils.html import format_html
from django.utils.translation import gettext as _
from django_tables2.utils import A

from .models import CookLog, InviteLink, RecipeImport, Storage, Sync, SyncLog, ViewLog, ConnectorConfig


class StorageTable(tables.Table):
    id = tables.LinkColumn('edit_storage', args=[A('id')])

    class Meta:
        model = Storage
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'method')


class ConnectorConfigTable(tables.Table):
    id = tables.LinkColumn('edit_connector_config', args=[A('id')])

    class Meta:
        model = ConnectorConfig
        template_name = 'generic/table_template.html'
        fields = ('id', 'name', 'type', 'enabled')


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


class InviteLinkTable(tables.Table):
    link = tables.TemplateColumn(
        "<input value='{{ request.scheme }}://{{ request.get_host }}{% url 'view_invite' record.uuid %}' class='form-control' />"
    )
    delete_link = tables.TemplateColumn(
        "<a href='{% url 'delete_invite_link' record.pk %}' >" + _('Delete') + "</a>", verbose_name=_('Delete')
    )

    class Meta:
        model = InviteLink
        template_name = 'generic/table_template.html'
        fields = (
            'username', 'group', 'valid_until',
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
