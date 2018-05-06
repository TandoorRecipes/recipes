from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render
from django_tables2 import RequestConfig
from django.utils.translation import gettext as _

from cookbook.models import Category, Keyword, ImportLog
from cookbook.tables import CategoryTable, KeywordTable, ImportLogTable


@login_required
def category(request):
    table = CategoryTable(Category.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Category"), 'table': table})


@login_required
def keyword(request):
    table = KeywordTable(Keyword.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Keyword"), 'table': table})


@login_required
def import_log(request):
    table = ImportLogTable(ImportLog.objects.all().order_by(Lower('created_at').desc()))
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Import Log"), 'table': table})
