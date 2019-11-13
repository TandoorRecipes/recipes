from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render
from django.urls import reverse_lazy
from django_tables2 import RequestConfig
from django.utils.translation import gettext as _

from cookbook.models import Keyword, SyncLog, RecipeImport, Storage
from cookbook.tables import KeywordTable, ImportLogTable, RecipeImportTable, StorageTable


@login_required
def keyword(request):
    table = KeywordTable(Keyword.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Keyword"), 'table': table, 'create_url': 'new_keyword'})


@login_required
def sync_log(request):
    table = ImportLogTable(SyncLog.objects.all().order_by(Lower('created_at').desc()))
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Import Log"), 'table': table})


@login_required
def recipe_import(request):
    table = RecipeImportTable(RecipeImport.objects.all())

    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Import"), 'table': table})


@login_required
def storage(request):
    table = StorageTable(Storage.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Storage Backend"), 'table': table, 'create_url': 'new_storage'})
