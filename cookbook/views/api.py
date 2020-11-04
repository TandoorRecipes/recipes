import io
import json
import re
import uuid

import requests
from PIL import Image
from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from django.contrib import messages
from django.contrib.auth.models import User
from django.core import management
from django.core.files import File
from django.db.models import Q
from django.http import HttpResponse, FileResponse, JsonResponse
from django.shortcuts import redirect
from django.utils import timezone, dateformat
from django.utils.formats import date_format
from django.utils.translation import gettext as _
from django.views.generic.base import View
from icalendar import Calendar, Event
from rest_framework import viewsets, permissions, decorators
from rest_framework.exceptions import APIException
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin, ListModelMixin
from rest_framework.parsers import JSONParser, FileUploadParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.viewsets import ViewSetMixin

from cookbook.helper.permission_helper import group_required, CustomIsOwner, CustomIsAdmin, CustomIsUser, CustomIsGuest, CustomIsShare, CustomIsShared
from cookbook.helper.recipe_url_import import get_from_html
from cookbook.models import Recipe, Sync, Storage, CookLog, MealPlan, MealType, ViewLog, UserPreference, RecipeBook, Ingredient, Food, Step, Keyword, Unit, SyncLog, ShoppingListRecipe, ShoppingList, ShoppingListEntry
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud
from cookbook.serializer import MealPlanSerializer, MealTypeSerializer, RecipeSerializer, ViewLogSerializer, UserNameSerializer, UserPreferenceSerializer, RecipeBookSerializer, IngredientSerializer, FoodSerializer, StepSerializer, \
    KeywordSerializer, RecipeImageSerializer, StorageSerializer, SyncSerializer, SyncLogSerializer, UnitSerializer, ShoppingListSerializer, ShoppingListRecipeSerializer, ShoppingListEntrySerializer, ShoppingListEntryCheckedSerializer, \
    ShoppingListAutoSyncSerializer


class UserNameViewSet(viewsets.ReadOnlyModelViewSet):
    """
    list:
    optional parameters

    - **filter_list**: array of user id's to get names for
    """
    queryset = User.objects.all()
    serializer_class = UserNameSerializer
    permission_classes = [CustomIsGuest]
    http_method_names = ['get']

    def get_queryset(self):
        queryset = self.queryset
        try:
            filter_list = self.request.query_params.get('filter_list', None)
            if filter_list is not None:
                queryset = queryset.filter(pk__in=json.loads(filter_list))
        except ValueError as e:
            raise APIException(_('Parameter filter_list incorrectly formatted'))

        return queryset


class UserPreferenceViewSet(viewsets.ModelViewSet):
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer
    permission_classes = [CustomIsOwner, ]

    def perform_create(self, serializer):
        if UserPreference.objects.filter(user=self.request.user).exists():
            raise APIException(_('Preference for given user already exists'))
        serializer.save(user=self.request.user)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        return self.queryset.filter(user=self.request.user)


class StorageViewSet(viewsets.ModelViewSet):
    # TODO handle delete protect error and adjust test
    queryset = Storage.objects.all()
    serializer_class = StorageSerializer
    permission_classes = [CustomIsAdmin, ]


class SyncViewSet(viewsets.ModelViewSet):
    queryset = Sync.objects.all()
    serializer_class = SyncSerializer
    permission_classes = [CustomIsAdmin, ]


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SyncLog.objects.all()
    serializer_class = SyncLogSerializer
    permission_classes = [CustomIsAdmin, ]


class StandardFilterMixin(ViewSetMixin):

    def get_queryset(self):
        queryset = self.queryset
        query = self.request.query_params.get('query', None)
        if query is not None:
            queryset = queryset.filter(name__icontains=query)

        limit = self.request.query_params.get('limit', None)
        if limit is not None:
            queryset = queryset[:int(limit)]
        return queryset


class KeywordViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    """
       list:
       optional parameters

       - **query**: search keywords for a string contained in the keyword name (case in-sensitive)
       - **limit**: limits the amount of returned results
       """
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [CustomIsUser]


class UnitViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [CustomIsUser]


class FoodViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = [CustomIsUser]


class RecipeBookViewSet(RetrieveModelMixin, UpdateModelMixin, ListModelMixin, viewsets.GenericViewSet):
    queryset = RecipeBook.objects.all()
    serializer_class = RecipeBookSerializer
    permission_classes = [CustomIsOwner, CustomIsAdmin]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        return self.queryset.filter(created_by=self.request.user)


class MealPlanViewSet(viewsets.ModelViewSet):
    """
    list:
    optional parameters

    - **html_week**: filter for a calendar week (format 2020-W24 as html input type week)

    """
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]  # TODO fix permissions

    def get_queryset(self):
        queryset = MealPlan.objects.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).distinct().all()
        week = self.request.query_params.get('html_week', None)
        if week is not None:
            y, w = week.replace('-W', ' ').split()
            queryset = queryset.filter(date__week=w, date__year=y)
        return queryset


class MealTypeViewSet(viewsets.ModelViewSet):
    """
    list:
    returns list of meal types created by the requesting user ordered by the order field
    """
    queryset = MealType.objects.order_by('order').all()
    serializer_class = MealTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MealType.objects.order_by('order', 'id').filter(created_by=self.request.user).all()
        return queryset


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [CustomIsUser]


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [CustomIsUser]


class RecipeViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    """
    list:
    optional parameters

    - **query**: search recipes for a string contained in the recipe name (case in-sensitive)
    - **limit**: limits the amount of returned results
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [CustomIsShare | CustomIsGuest]  # TODO split read and write permission for meal plan guest

    def get_queryset(self):
        queryset = self.queryset

        internal = self.request.query_params.get('internal', None)
        if internal:
            queryset = queryset.filter(internal=True)
        random = self.request.query_params.get('random', False)
        if random:
            queryset = queryset.random(5)

        return queryset

    # TODO write extensive tests for permissions

    @decorators.action(
        detail=True,
        methods=['PUT'],
        serializer_class=RecipeImageSerializer,
        parser_classes=[MultiPartParser],
    )
    def image(self, request, pk):
        obj = self.get_object()
        serializer = self.serializer_class(obj, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            img = Image.open(obj.image)

            basewidth = 720
            wpercent = (basewidth / float(img.size[0]))
            hsize = int((float(img.size[1]) * float(wpercent)))
            img = img.resize((basewidth, hsize), Image.ANTIALIAS)

            im_io = io.BytesIO()
            img.save(im_io, 'PNG', quality=70)
            obj.image = File(im_io, name=f'{uuid.uuid4()}_{obj.pk}.png')
            obj.save()

            return Response(serializer.data)
        return Response(serializer.errors, 400)


class ShoppingListRecipeViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListRecipe.objects.all()
    serializer_class = ShoppingListRecipeSerializer
    permission_classes = [CustomIsUser, ]  # TODO add custom validation

    # TODO custom get qs


class ShoppingListEntryViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListEntry.objects.all()
    serializer_class = ShoppingListEntrySerializer
    permission_classes = [CustomIsOwner, ]  # TODO add custom validation

    # TODO custom get qs


class ShoppingListViewSet(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        return self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).all()

    def get_serializer_class(self):
        autosync = self.request.query_params.get('autosync', None)
        if autosync:
            return ShoppingListAutoSyncSerializer
        return self.serializer_class


class ViewLogViewSet(viewsets.ModelViewSet):
    queryset = ViewLog.objects.all()
    serializer_class = ViewLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ViewLog.objects.filter(created_by=self.request.user).all()[:5]
        return queryset


# -------------- non django rest api views --------------------

def get_recipe_provider(recipe):
    if recipe.storage.method == Storage.DROPBOX:
        return Dropbox
    elif recipe.storage.method == Storage.NEXTCLOUD:
        return Nextcloud
    else:
        raise Exception('Provider not implemented')


def update_recipe_links(recipe):
    if not recipe.link:
        recipe.link = get_recipe_provider(recipe).get_share_link(recipe)  # TODO response validation in apis

    recipe.save()


@group_required('user')
def get_external_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.link:
        update_recipe_links(recipe)

    return HttpResponse(recipe.link)


@group_required('user')
def get_recipe_file(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.cors_link:
        update_recipe_links(recipe)

    return FileResponse(get_recipe_provider(recipe).get_file(recipe))


@group_required('user')
def sync_all(request):
    monitors = Sync.objects.filter(active=True)

    error = False
    for monitor in monitors:
        if monitor.storage.method == Storage.DROPBOX:
            ret = Dropbox.import_all(monitor)
            if not ret:
                error = True
        if monitor.storage.method == Storage.NEXTCLOUD:
            ret = Nextcloud.import_all(monitor)
            if not ret:
                error = True

    if not error:
        messages.add_message(request, messages.SUCCESS, _('Sync successful!'))
        return redirect('list_recipe_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('list_recipe_import')


@group_required('user')
@ajax_request
def log_cooking(request, recipe_id):
    recipe = get_object_or_None(Recipe, id=recipe_id)
    if recipe:
        log = CookLog.objects.create(created_by=request.user, recipe=recipe)
        servings = request.GET['s'] if 's' in request.GET else None
        if servings and re.match(r'^([1-9])+$', servings):
            log.servings = int(servings)

        rating = request.GET['r'] if 'r' in request.GET else None
        if rating and re.match(r'^([1-9])+$', rating):
            log.rating = int(rating)
        log.save()
        return {'msg': 'updated successfully'}

    return {'error': 'recipe does not exist'}


@group_required('user')
def get_plan_ical(request, html_week):
    queryset = MealPlan.objects.filter(Q(created_by=request.user) | Q(shared=request.user)).distinct().all()

    y, w = html_week.replace('-W', ' ').split()
    queryset = queryset.filter(date__week=w, date__year=y)

    cal = Calendar()

    for p in queryset:
        event = Event()
        event['uid'] = p.id
        event.add('dtstart', p.date)
        event.add('dtend', p.date)
        event['summary'] = f'{p.meal_type.name}: {p.get_label()}'
        event['description'] = p.note
        cal.add_component(event)

    response = FileResponse(io.BytesIO(cal.to_ical()))
    response["Content-Disposition"] = f'attachment; filename=meal_plan_{html_week}.ics'

    return response


@group_required('user')
def recipe_from_url(request):
    url = request.POST['url']

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36'}
    try:
        response = requests.get(url, headers=headers)
    except requests.exceptions.ConnectionError:
        return JsonResponse({'error': True, 'msg': _('The requested page could not be found.')}, status=400)

    if response.status_code == 403:
        return JsonResponse({'error': True, 'msg': _('The requested page refused to provide any information (Status Code 403).')}, status=400)
    return get_from_html(response.text, url)


def get_backup(request):
    if not request.user.is_superuser:
        return HttpResponse('', status=403)

    buf = io.StringIO()
    management.call_command('dumpdata', exclude=['contenttypes', 'auth'], stdout=buf)

    response = FileResponse(buf.getvalue())
    response["Content-Disposition"] = f'attachment; filename=backup{date_format(timezone.now(), format="SHORT_DATETIME_FORMAT", use_l10n=True)}.json'

    return response
