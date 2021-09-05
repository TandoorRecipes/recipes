from datetime import datetime

from django.db.models import Q
from django.shortcuts import render
from django.utils.translation import gettext as _
from django_tables2 import RequestConfig

from cookbook.filters import ShoppingListFilter
from cookbook.helper.permission_helper import group_required
from cookbook.models import (InviteLink, RecipeImport,
                             ShoppingList, Storage, SyncLog)
from cookbook.tables import (ImportLogTable, InviteLinkTable,
                             RecipeImportTable, ShoppingListTable, StorageTable)


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


# @group_required('user')
# def food(request):
#     f = FoodFilter(request.GET, queryset=Food.objects.filter(space=request.space).all().order_by('pk'))

#     table = IngredientTable(f.qs)
#     RequestConfig(request, paginate={'per_page': 25}).configure(table)

#     return render(
#         request,
#         'generic/list_template.html',
#         {'title': _("Ingredients"), 'table': table, 'filter': f}
#     )


@group_required('user')
def shopping_list(request):
    f = ShoppingListFilter(request.GET, queryset=ShoppingList.objects.filter(space=request.space).filter(
        Q(created_by=request.user) | Q(shared=request.user)).all().order_by('finished', 'created_at'))

    table = ShoppingListTable(f.qs)
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {
            'title': _("Shopping Lists"),
            'table': table,
            'filter': f,
            'create_url': 'view_shopping'
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
                'model': "FOOD",         # *REQUIRED* name of the model in models.js
                'recipe_param': 'foods'  # *OPTIONAL* name of the listRecipes parameter if filtering on this attribute
            }
        }
    )
