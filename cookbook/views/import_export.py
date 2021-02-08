import re

from django.shortcuts import render

from cookbook.forms import ExportForm, ExportForm, ImportForm
from cookbook.helper.permission_helper import group_required
from cookbook.integration.default import Default
from cookbook.models import Recipe


def get_integration(request, export_type):
    return Default(request)


@group_required('user')
def import_recipe(request):
    if request.method == "POST":
        form = ImportForm(request.POST, request.FILES)
        if form.is_valid():
            integration = Default(request)
            return integration.do_import(request.FILES.getlist('files'))
    else:
        form = ImportForm()

    return render(request, 'import.html', {'form': form})


@group_required('user')
def export_recipe(request):
    if request.method == "POST":
        form = ExportForm(request.POST)
        if form.is_valid():
            integration = Default(request)
            return integration.do_export(form.cleaned_data['recipes'])
    else:
        form = ExportForm()
        recipe = request.GET.get('r')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                if recipe := Recipe.objects.filter(pk=int(recipe)).first():
                    form = ExportForm(initial={'recipes': recipe})

    return render(request, 'export.html', {'form': form})
