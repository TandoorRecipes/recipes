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
def export_file(request, pk):
    el = get_object_or_404(ExportLog, pk=pk, space=request.space)

    cacheData = cache.get(f'export_file_{el.pk}')

    if cacheData is None:
        el.possibly_not_expired = False
        el.save()
        return JsonResponse({'msg': 'Export Expired or not found'}, status=404)

    response = HttpResponse(cacheData['file'], content_type='application/force-download')
    response['Content-Disposition'] = 'attachment; filename="' + cacheData['filename'] + '"'
    return response
