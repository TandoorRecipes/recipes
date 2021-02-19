import re

from django.contrib import messages
from django.shortcuts import render
from django.utils.translation import gettext as _

from cookbook.forms import ExportForm, ImportForm, ImportExportBase
from cookbook.helper.permission_helper import group_required
from cookbook.integration.chowdown import Chowdown
from cookbook.integration.default import Default
from cookbook.integration.mealie import Mealie
from cookbook.integration.nextcloud_cookbook import NextcloudCookbook
from cookbook.integration.paprika import Paprika
from cookbook.integration.safron import Safron
from cookbook.models import Recipe


def get_integration(request, export_type):
    if export_type == ImportExportBase.DEFAULT:
        return Default(request)
    if export_type == ImportExportBase.PAPRIKA:
        return Paprika(request)
    if export_type == ImportExportBase.NEXTCLOUD:
        return NextcloudCookbook(request)
    if export_type == ImportExportBase.MEALIE:
        return Mealie(request)
    if export_type == ImportExportBase.CHOWDOWN:
        return Chowdown(request)
    if export_type == ImportExportBase.SAFRON:
        return Safron(request)


@group_required('user')
def import_recipe(request):
    if request.method == "POST":
        form = ImportForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                integration = get_integration(request, form.cleaned_data['type'])
                return integration.do_import(request.FILES.getlist('files'))
            except NotImplementedError:
                messages.add_message(request, messages.ERROR, _('Importing is not implemented for this provider'))
    else:
        form = ImportForm()

    return render(request, 'import.html', {'form': form})


@group_required('user')
def export_recipe(request):
    if request.method == "POST":
        form = ExportForm(request.POST, user=request.user)
        if form.is_valid():
            try:
                integration = get_integration(request, form.cleaned_data['type'])
                return integration.do_export(form.cleaned_data['recipes'])
            except NotImplementedError:
                messages.add_message(request, messages.ERROR, _('Exporting is not implemented for this provider'))

    else:
        form = ExportForm(user=request.user)
        recipe = request.GET.get('r')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                if recipe := Recipe.objects.filter(pk=int(recipe)).first():
                    form = ExportForm(initial={'recipes': recipe}, user=request.user)

    return render(request, 'export.html', {'form': form})
