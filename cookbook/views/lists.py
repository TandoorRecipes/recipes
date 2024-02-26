from datetime import datetime

from django.db.models import Sum
from django.shortcuts import render
from django.utils.translation import gettext as _
from django_tables2 import RequestConfig

from cookbook.helper.permission_helper import group_required
from cookbook.models import InviteLink, RecipeImport, Storage, SyncLog, UserFile, ConnectorConfig
from cookbook.tables import ImportLogTable, InviteLinkTable, RecipeImportTable, StorageTable, ConnectorConfigTable


@group_required('admin')
def sync_log(request):
    table = ImportLogTable(
        SyncLog.objects.filter(sync__space=request.space).all().order_by('-created_at')
    )
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {'title': _("Import Log"), 'table': table}
    )


@group_required('user')
def recipe_import(request):
    table = RecipeImportTable(RecipeImport.objects.filter(space=request.space).all())

    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {'title': _("Discovery"), 'table': table, 'import_btn': True}
    )


@group_required('user')
def shopping_list(request):
    return render(
        request,
        'shoppinglist_template.html',
        {
            "title": _("Shopping List"),

        }
    )


@group_required('admin')
def storage(request):
    table = StorageTable(Storage.objects.filter(space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {
            'title': _("Storage Backend"),
            'table': table,
            'create_url': 'new_storage'
        }
    )


@group_required('admin')
def connector_config(request):
    table = ConnectorConfigTable(ConnectorConfig.objects.filter(space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {
            'title': _("Connector Config Backend"),
            'table': table,
            'create_url': 'new_connector_config'
        }
    )


@group_required('admin')
def invite_link(request):
    table = InviteLinkTable(
        InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {
        'title': _("Invite Links"),
        'table': table,
        'create_url': 'new_invite_link'
    })


@group_required('user')
def keyword(request):
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Keywords"),
            "config": {
                'model': "KEYWORD",
                'recipe_param': 'keywords'
            }
        }
    )


@group_required('user')
def food(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Foods"),
            "config": {
                'model': "FOOD",  # *REQUIRED* name of the model in models.js
                'recipe_param': 'foods'  # *OPTIONAL* name of the listRecipes parameter if filtering on this attribute
            }
        }
    )


@group_required('user')
def unit(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Units"),
            "config": {
                'model': "UNIT",  # *REQUIRED* name of the model in models.js
                'recipe_param': 'units',  # *OPTIONAL* name of the listRecipes parameter if filtering on this attribute
            }
        }
    )


@group_required('user')
def supermarket(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Supermarkets"),
            "config": {
                'model': "SUPERMARKET",  # *REQUIRED* name of the model in models.js
            }
        }
    )


@group_required('user')
def supermarket_category(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Shopping Categories"),
            "config": {
                'model': "SHOPPING_CATEGORY",  # *REQUIRED* name of the model in models.js
            }
        }
    )


@group_required('user')
def automation(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Automations"),
            "config": {
                'model': "AUTOMATION",  # *REQUIRED* name of the model in models.js
            }
        }
    )


@group_required('user')
def custom_filter(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Custom Filters"),
            "config": {
                'model': "CUSTOM_FILTER",  # *REQUIRED* name of the model in models.js
            }
        }
    )


@group_required('user')
def user_file(request):
    try:
        current_file_size_mb = UserFile.objects.filter(space=request.space).aggregate(Sum('file_size_kb'))[
            'file_size_kb__sum'] / 1000
    except TypeError:
        current_file_size_mb = 0

    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Files"),
            "config": {
                'model': "USERFILE",  # *REQUIRED* name of the model in models.js
            },
            'current_file_size_mb': current_file_size_mb, 'max_file_size_mb': request.space.max_file_storage_mb
        }
    )


@group_required('user')
def step(request):
    # recipe-param is the name of the parameters used when filtering recipes by this attribute
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Steps"),
            "config": {
                'model': "STEP",  # *REQUIRED* name of the model in models.js
                'recipe_param': 'steps',
            }
        }
    )


@group_required('user')
def unit_conversion(request):
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Unit Conversions"),
            "config": {
                'model': "UNIT_CONVERSION",  # *REQUIRED* name of the model in models.js
            }
        }
    )


@group_required('user')
def property_type(request):
    # model-name is the models.js name of the model, probably ALL-CAPS
    return render(
        request,
        'generic/model_template.html',
        {
            "title": _("Property Types"),
            "config": {
                'model': "PROPERTY_TYPE",  # *REQUIRED* name of the model in models.js
            }
        }
    )
