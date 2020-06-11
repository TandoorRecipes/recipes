import json
import re

from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpResponse, FileResponse
from django.shortcuts import redirect
from django.utils.translation import gettext as _
from rest_framework import viewsets, permissions
from rest_framework.exceptions import APIException

from cookbook.helper.permission_helper import group_required
from cookbook.models import Recipe, Sync, Storage, CookLog, MealPlan, MealType, ViewLog
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud
from cookbook.serializer import MealPlanSerializer, MealTypeSerializer, RecipeSerializer, ViewLogSerializer, UserNameSerializer


class UserNameViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserNameSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', ]

    def get_queryset(self):
        queryset = User.objects.all()
        try:
            filter_list = self.request.query_params.get('filter_list', None)
            if filter_list is not None:
                queryset = queryset.filter(pk__in=json.loads(filter_list))
        except ValueError as e:
            raise APIException(_('Parameter filter_list incorrectly formatted'))

        return queryset


class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MealPlan.objects.filter(Q(created_by=self.request.user) or Q(shared=self.request.user)).all()
        week = self.request.query_params.get('html_week', None)
        if week is not None:
            y, w = week.replace('-W', ' ').split()
            queryset = queryset.filter(date__week=w, date__year=y)
        return queryset


class MealTypeViewSet(viewsets.ModelViewSet):
    queryset = MealType.objects.order_by('order').all()
    serializer_class = MealTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MealType.objects.order_by('order', 'id').filter(created_by=self.request.user).all()
        return queryset


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        query = self.request.query_params.get('query', None)
        if query is not None:
            queryset = queryset.filter(name__icontains=query)

        limit = self.request.query_params.get('limit', None)
        if limit is not None:
            queryset = queryset[:int(limit)]
        return queryset


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
