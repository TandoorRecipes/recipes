import re
import threading

from django.core.cache import cache
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils.translation import gettext as _

from cookbook.forms import ExportForm, ImportExportBase
from cookbook.helper.permission_helper import group_required
from cookbook.helper.recipe_search import RecipeSearch
from cookbook.integration.cheftap import ChefTap
from cookbook.integration.chowdown import Chowdown
from cookbook.integration.cookbookapp import CookBookApp
from cookbook.integration.cookmate import Cookmate
from cookbook.integration.copymethat import CopyMeThat
from cookbook.integration.default import Default
from cookbook.integration.domestica import Domestica
from cookbook.integration.mealie import Mealie
from cookbook.integration.mealmaster import MealMaster
from cookbook.integration.melarecipes import MelaRecipes
from cookbook.integration.nextcloud_cookbook import NextcloudCookbook
from cookbook.integration.openeats import OpenEats
from cookbook.integration.paprika import Paprika
from cookbook.integration.pdfexport import PDFexport
from cookbook.integration.pepperplate import Pepperplate
from cookbook.integration.plantoeat import Plantoeat
from cookbook.integration.recettetek import RecetteTek
from cookbook.integration.recipekeeper import RecipeKeeper
from cookbook.integration.recipesage import RecipeSage
from cookbook.integration.rezeptsuitede import Rezeptsuitede
from cookbook.integration.rezkonv import RezKonv
from cookbook.integration.saffron import Saffron
from cookbook.integration.gourmet import Gourmet
from cookbook.models import ExportLog, Recipe
from recipes import settings


def get_integration(request, export_type):
    if export_type == ImportExportBase.DEFAULT:
        return Default(request, export_type)
    if export_type == ImportExportBase.PAPRIKA:
        return Paprika(request, export_type)
    if export_type == ImportExportBase.NEXTCLOUD:
        return NextcloudCookbook(request, export_type)
    if export_type == ImportExportBase.MEALIE:
        return Mealie(request, export_type)
    if export_type == ImportExportBase.CHOWDOWN:
        return Chowdown(request, export_type)
    if export_type == ImportExportBase.SAFFRON:
        return Saffron(request, export_type)
    if export_type == ImportExportBase.CHEFTAP:
        return ChefTap(request, export_type)
    if export_type == ImportExportBase.PEPPERPLATE:
        return Pepperplate(request, export_type)
    if export_type == ImportExportBase.DOMESTICA:
        return Domestica(request, export_type)
    if export_type == ImportExportBase.RECIPEKEEPER:
        return RecipeKeeper(request, export_type)
    if export_type == ImportExportBase.RECETTETEK:
        return RecetteTek(request, export_type)
    if export_type == ImportExportBase.RECIPESAGE:
        return RecipeSage(request, export_type)
    if export_type == ImportExportBase.REZKONV:
        return RezKonv(request, export_type)
    if export_type == ImportExportBase.MEALMASTER:
        return MealMaster(request, export_type)
    if export_type == ImportExportBase.OPENEATS:
        return OpenEats(request, export_type)
    if export_type == ImportExportBase.PLANTOEAT:
        return Plantoeat(request, export_type)
    if export_type == ImportExportBase.COOKBOOKAPP:
        return CookBookApp(request, export_type)
    if export_type == ImportExportBase.COPYMETHAT:
        return CopyMeThat(request, export_type)
    if export_type == ImportExportBase.PDF:
        return PDFexport(request, export_type)
    if export_type == ImportExportBase.MELARECIPES:
        return MelaRecipes(request, export_type)
    if export_type == ImportExportBase.COOKMATE:
        return Cookmate(request, export_type)
    if export_type == ImportExportBase.REZEPTSUITEDE:
        return Rezeptsuitede(request, export_type)
    if export_type == ImportExportBase.GOURMET:
        return Gourmet(request, export_type)


@group_required('user')
def export_recipe(request):
    if request.method == "POST":
        form = ExportForm(request.POST, space=request.space)
        if form.is_valid():
            try:
                recipes = form.cleaned_data['recipes']
                if form.cleaned_data['all']:
                    recipes = Recipe.objects.filter(space=request.space, internal=True).all()
                elif custom_filter := form.cleaned_data['custom_filter']:
                    search = RecipeSearch(request, filter=custom_filter)
                    recipes = search.get_queryset(Recipe.objects.filter(space=request.space, internal=True))

                integration = get_integration(request, form.cleaned_data['type'])

                if form.cleaned_data['type'] == ImportExportBase.PDF and not settings.ENABLE_PDF_EXPORT:
                    return JsonResponse({'error': _('The PDF Exporter is not enabled on this instance as it is still in an experimental state.')})

                el = ExportLog.objects.create(type=form.cleaned_data['type'], created_by=request.user, space=request.space)

                t = threading.Thread(target=integration.do_export, args=[recipes, el])
                t.setDaemon(True)
                t.start()

                return JsonResponse({'export_id': el.pk})
            except NotImplementedError:
                return JsonResponse(
                    {
                        'error': True,
                        'msg': _('Importing is not implemented for this provider')
                    },
                    status=400
                )
    else:
        pk = ''
        recipe = request.GET.get('r')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                pk = Recipe.objects.filter(pk=int(recipe), space=request.space).first().pk

    return render(request, 'export.html', {'pk': pk})


@group_required('user')
def import_response(request, pk):
    return render(request, 'import_response.html', {'pk': pk})


@group_required('user')
def export_response(request, pk):
    return render(request, 'export_response.html', {'pk': pk})


@group_required('user')
def export_file(request, pk):
    el = get_object_or_404(ExportLog, pk=pk, space=request.space)

    cacheData = cache.get(f'export_file_{el.pk}')

    if cacheData is None:
        el.possibly_not_expired = False
        el.save()
        return render(request, 'export_response.html', {'pk': pk})

    response = HttpResponse(cacheData['file'], content_type='application/force-download')
    response['Content-Disposition'] = 'attachment; filename="' + cacheData['filename'] + '"'
    return response
