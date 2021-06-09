from datetime import datetime

from django.db.models import Q
from django.db.models.functions import Lower
from django.shortcuts import render
from django.utils.translation import gettext as _
from django_tables2 import RequestConfig

from cookbook.filters import FoodFilter, ShoppingListFilter
from cookbook.helper.permission_helper import group_required
from cookbook.models import (Food, InviteLink, Keyword, RecipeImport,
                             ShoppingList, Storage, SyncLog)
from cookbook.tables import (ImportLogTable, IngredientTable, InviteLinkTable,
                             KeywordTable, RecipeImportTable,
                             ShoppingListTable, StorageTable)


@group_required('user')
def keyword(request):
    table = KeywordTable(Keyword.objects.filter(space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {'title': _("Keyword"), 'table': table, 'create_url': 'new_keyword'}
    )


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
def food(request):
    f = FoodFilter(request.GET, queryset=Food.objects.filter(space=request.space).all().order_by('pk'))

    table = IngredientTable(f.qs)
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(
        request,
        'generic/list_template.html',
        {'title': _("Ingredients"), 'table': table, 'filter': f}
    )


@group_required('user')
def shopping_list(request):
    f = ShoppingListFilter(request.GET, queryset=ShoppingList.objects.filter(
        Q(created_by=request.user) |
        Q(shared=request.user), space=request.space
    ).all().order_by('finished', 'created_at'))

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
    table = InviteLinkTable(InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {
        'title': _("Invite Links"),
        'table': table,
        'create_url': 'new_invite_link'
    })
