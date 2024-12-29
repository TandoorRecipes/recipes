import datetime
import io
import json
import mimetypes
import pathlib
import re
import threading
import traceback
import uuid
from collections import OrderedDict
from json import JSONDecodeError
from urllib.parse import unquote
from zipfile import ZipFile

import redis
import requests
from PIL import UnidentifiedImageError
from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from django.contrib import messages
from django.contrib.auth.models import Group, User
from django.contrib.postgres.search import TrigramSimilarity
from django.core.cache import caches
from django.core.exceptions import FieldError, ValidationError
from django.core.files import File
from django.db.models import Case, Count, Exists, OuterRef, ProtectedError, Q, Subquery, Value, When
from django.db.models.fields.related import ForeignObjectRel
from django.db.models.functions import Coalesce, Lower
from django.db.models.signals import post_save
from django.http import FileResponse, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils import timezone
from django.utils.datetime_safe import date
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled
from icalendar import Calendar, Event
from oauth2_provider.models import AccessToken
from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import NoSchemaFoundInWildMode
from requests.exceptions import MissingSchema
from rest_framework import decorators, status, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSetMixin
from treebeard.exceptions import InvalidMoveToDescendant, InvalidPosition, PathOverflow

from cookbook.forms import ImportForm
from cookbook.helper import recipe_url_import as helper
from cookbook.helper.HelperFunctions import str2bool, validate_import_url
from cookbook.helper.image_processing import handle_image
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.open_data_importer import OpenDataImporter
from cookbook.helper.permission_helper import (
    CustomIsAdmin, CustomIsOwner, CustomIsOwnerReadOnly, CustomIsShared, CustomIsSpaceOwner, CustomIsUser, CustomRecipePermission, CustomTokenHasReadWriteScope,
    CustomTokenHasScope, CustomUserPermission, IsReadOnlyDRF, above_space_limit, group_required, has_group_permission, is_space_owner, switch_user_active_space, CustomIsGuest,
)
from cookbook.helper.recipe_search import RecipeSearch
from cookbook.helper.recipe_url_import import clean_dict, get_from_youtube_scraper, get_images_from_soup
from cookbook.helper.shopping_helper import RecipeShoppingEditor, shopping_helper
from cookbook.models import (Automation, BookmarkletImport, CookLog, CustomFilter, ExportLog, Food,
                             FoodInheritField, FoodProperty, ImportLog, Ingredient, InviteLink,
                             Keyword, MealPlan, MealType, Property, PropertyType, Recipe,
                             RecipeBook, RecipeBookEntry, ShareLink, ShoppingListEntry, ShoppingListRecipe, Space, Step, Storage,
                             Supermarket, SupermarketCategory, SupermarketCategoryRelation, Sync,
                             SyncLog, Unit, UnitConversion, UserFile, UserPreference, UserSpace,
                             ViewLog, ConnectorConfig)
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
from cookbook.provider.nextcloud import Nextcloud
from cookbook.schemas import FilterSchema, QueryParam, QueryParamAutoSchema, TreeSchema
from cookbook.serializer import (AccessTokenSerializer, AutomationSerializer,
                                 AutoMealPlanSerializer, BookmarkletImportListSerializer,
                                 BookmarkletImportSerializer, CookLogSerializer,
                                 CustomFilterSerializer, ExportLogSerializer,
                                 FoodInheritFieldSerializer, FoodSerializer,
                                 FoodShoppingUpdateSerializer, FoodSimpleSerializer,
                                 GroupSerializer, ImportLogSerializer, IngredientSerializer,
                                 IngredientSimpleSerializer, InviteLinkSerializer,
                                 KeywordSerializer, MealPlanSerializer, MealTypeSerializer,
                                 PropertySerializer, PropertyTypeSerializer,
                                 RecipeBookEntrySerializer, RecipeBookSerializer,
                                 RecipeExportSerializer, RecipeFromSourceSerializer,
                                 RecipeImageSerializer, RecipeOverviewSerializer, RecipeSerializer,
                                 RecipeShoppingUpdateSerializer, RecipeSimpleSerializer,
                                 ShoppingListEntrySerializer,
                                 ShoppingListRecipeSerializer, SpaceSerializer, StepSerializer, StorageSerializer,
                                 SupermarketCategoryRelationSerializer,
                                 SupermarketCategorySerializer, SupermarketSerializer,
                                 SyncLogSerializer, SyncSerializer, UnitConversionSerializer,
                                 UnitSerializer, UserFileSerializer, UserPreferenceSerializer,
                                 UserSerializer, UserSpaceSerializer, ViewLogSerializer,
                                 ShoppingListEntryBulkSerializer, ConnectorConfigConfigSerializer)
from cookbook.views.import_export import get_integration
from recipes import settings
from recipes.settings import DRF_THROTTLE_RECIPE_URL_IMPORT, FDC_API_KEY


class LoggingMixin(object):
    """
    logs request counts to redis cache total/per user/
    """

    def initial(self, request, *args, **kwargs):
        super(LoggingMixin, self).initial(request, *args, **kwargs)

        if settings.REDIS_HOST:
            try:
                d = date.today().isoformat()
                space = request.space
                endpoint = request.resolver_match.url_name

                r = redis.StrictRedis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    username=settings.REDIS_USERNAME,
                    password=settings.REDIS_PASSWORD,
                    db=settings.REDIS_DATABASES['STATS'],
                )

                pipe = r.pipeline()

                # Global and daily tallies for all URLs.
                pipe.incr('api:request-count')
                pipe.incr(f'api:request-count:{d}')

                # Use a sorted set to store the user stats, with the score representing
                # the number of queries the user made total or on a given day.
                pipe.zincrby(f'api:space-request-count', 1, space.pk)
                pipe.zincrby(f'api:space-request-count:{d}', 1, space.pk)

                # Use a sorted set to store all the endpoints with score representing
                # the number of queries the endpoint received total or on a given day.
                pipe.zincrby(f'api:endpoint-request-count', 1, endpoint)
                pipe.zincrby(f'api:endpoint-request-count:{d}', 1, endpoint)

                pipe.execute()
            except:
                pass


class StandardFilterMixin(ViewSetMixin):

    def get_queryset(self):
        queryset = self.queryset
        query = self.request.query_params.get('query', None)
        if query is not None:
            queryset = queryset.filter(name__icontains=query)

        updated_at = self.request.query_params.get('updated_at', None)
        if updated_at is not None:
            try:
                queryset = queryset.filter(updated_at__gte=updated_at)
            except FieldError:
                pass
            except ValidationError:
                raise APIException(_('Parameter updated_at incorrectly formatted'))

        limit = self.request.query_params.get('limit', None)
        random = self.request.query_params.get('random', False)
        if limit is not None:
            if random:
                queryset = queryset.order_by("?")[:int(limit)]
            else:
                queryset = queryset[:int(limit)]
        return queryset


class DefaultPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class ExtendedRecipeMixin():
    '''
    ExtendedRecipe annotates a queryset with recipe_image and recipe_count values
    '''

    @classmethod
    def annotate_recipe(self, queryset=None, request=None, serializer=None, tree=False):
        extended = str2bool(request.query_params.get('extended', None))
        if extended:
            recipe_filter = serializer.recipe_filter
            images = serializer.images
            space = request.space

            # add a recipe count annotation to the query
            #  explanation on construction https://stackoverflow.com/a/43771738/15762829
            recipe_count = Recipe.objects.filter(**{recipe_filter: OuterRef('id')}, space=space).values(recipe_filter).annotate(count=Count('pk', distinct=True)).values('count')
            queryset = queryset.annotate(recipe_count=Coalesce(Subquery(recipe_count), 0))

            # add a recipe image annotation to the query
            image_subquery = Recipe.objects.filter(**{
                recipe_filter: OuterRef('id')
            }, space=space).exclude(image__isnull=True).exclude(image__exact='').order_by("?").values('image')[:1]
            if tree:
                image_children_subquery = Recipe.objects.filter(**{
                    f"{recipe_filter}__path__startswith": OuterRef('path')
                }, space=space).exclude(image__isnull=True).exclude(image__exact='').order_by("?").values('image')[:1]
            else:
                image_children_subquery = None
            if images:
                queryset = queryset.annotate(recipe_image=Coalesce(*images, image_subquery, image_children_subquery))
            else:
                queryset = queryset.annotate(recipe_image=Coalesce(image_subquery, image_children_subquery))
        return queryset


class FuzzyFilterMixin(ViewSetMixin, ExtendedRecipeMixin):
    schema = FilterSchema()

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).order_by(Lower('name').asc())
        query = self.request.query_params.get('query', None)
        if self.request.user.is_authenticated:
            fuzzy = self.request.user.searchpreference.lookup or any(
                [self.model.__name__.lower() in x for x in self.request.user.searchpreference.trigram.values_list('field', flat=True)])
        else:
            fuzzy = True

        if query is not None and query not in ["''", '']:
            if fuzzy and (settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'):
                if self.request.user.is_authenticated and any(
                        [self.model.__name__.lower() in x for x in self.request.user.searchpreference.unaccent.values_list('field', flat=True)]
                ):
                    self.queryset = self.queryset.annotate(trigram=TrigramSimilarity('name__unaccent', query))
                else:
                    self.queryset = self.queryset.annotate(trigram=TrigramSimilarity('name', query))
                self.queryset = self.queryset.order_by('-trigram')
            else:
                # TODO have this check unaccent search settings or other search preferences?
                filter = Q(name__icontains=query)
                if self.request.user.is_authenticated:
                    if any([self.model.__name__.lower() in x for x in self.request.user.searchpreference.unaccent.values_list('field', flat=True)]):
                        filter |= Q(name__unaccent__icontains=query)

                self.queryset = (
                    self.queryset.annotate(starts=Case(When(name__istartswith=query, then=(Value(100))), default=Value(0)))  # put exact matches at the top of the result set
                    .filter(filter).order_by('-starts',
                                             Lower('name').asc()))

        updated_at = self.request.query_params.get('updated_at', None)
        if updated_at is not None:
            try:
                self.queryset = self.queryset.filter(updated_at__gte=updated_at)
            except FieldError:
                pass
            except ValidationError:
                raise APIException(_('Parameter updated_at incorrectly formatted'))

        limit = self.request.query_params.get('limit', None)
        random = self.request.query_params.get('random', False)
        if random:
            self.queryset = self.queryset.order_by("?")
        if limit is not None:
            self.queryset = self.queryset[:int(limit)]
        return self.annotate_recipe(queryset=self.queryset, request=self.request, serializer=self.serializer_class)


class MergeMixin(ViewSetMixin):

    @decorators.action(detail=True, url_path='merge/(?P<target>[^/.]+)', methods=['PUT'], )
    @decorators.renderer_classes((TemplateHTMLRenderer, JSONRenderer))
    def merge(self, request, pk, target):
        self.description = f"Merge {self.basename} onto target {self.basename} with ID of [int]."

        try:
            source = self.model.objects.get(pk=pk, space=self.request.space)
        except (self.model.DoesNotExist):
            content = {'error': True, 'msg': _(f'No {self.basename} with id {pk} exists')}
            return Response(content, status=status.HTTP_404_NOT_FOUND)

        if int(target) == source.id:
            content = {'error': True, 'msg': _('Cannot merge with the same object!')}
            return Response(content, status=status.HTTP_403_FORBIDDEN)

        else:
            try:
                target = self.model.objects.get(pk=target, space=self.request.space)
            except (self.model.DoesNotExist):
                content = {'error': True, 'msg': _(f'No {self.basename} with id {target} exists')}
                return Response(content, status=status.HTTP_404_NOT_FOUND)

            try:
                if target in source.get_descendants_and_self():
                    content = {'error': True, 'msg': _('Cannot merge with child object!')}
                    return Response(content, status=status.HTTP_403_FORBIDDEN)
                isTree = True
            except AttributeError:
                # AttributeError probably means its not a tree, so can safely ignore
                isTree = False

            try:
                if isinstance(source, Food):
                    source.properties.all().delete()
                    source.properties.clear()
                    UnitConversion.objects.filter(food=source).delete()

                for link in [field for field in source._meta.get_fields() if issubclass(type(field), ForeignObjectRel)]:
                    linkManager = getattr(source, link.get_accessor_name())
                    related = linkManager.all()
                    # link to foreign relationship could be OneToMany or ManyToMany
                    if link.one_to_many:
                        for r in related:
                            setattr(r, link.field.name, target)
                            r.save()
                    elif link.many_to_many:
                        for r in related:
                            getattr(r, link.field.name).add(target)
                            getattr(r, link.field.name).remove(source)
                            r.save()
                    else:
                        # a new scenario exists and needs to be handled
                        raise NotImplementedError
                if isTree:
                    if self.model.node_order_by:
                        node_location = 'sorted-child'
                    else:
                        node_location = 'last-child'

                    children = source.get_children().exclude(id=target.id)
                    for c in children:
                        c.move(target, node_location)
                content = {'msg': _(f'{source.name} was merged successfully with {target.name}')}
                source.delete()
                return Response(content, status=status.HTTP_200_OK)
            except Exception:
                traceback.print_exc()
                content = {'error': True, 'msg': _(f'An error occurred attempting to merge {source.name} with {target.name}')}
                return Response(content, status=status.HTTP_400_BAD_REQUEST)


class TreeMixin(MergeMixin, FuzzyFilterMixin, ExtendedRecipeMixin):
    schema = TreeSchema()
    model = None

    def get_queryset(self):
        root = self.request.query_params.get('root', None)
        tree = self.request.query_params.get('tree', None)

        if root:
            if root.isnumeric():
                try:
                    root = int(root)
                except ValueError:
                    self.queryset = self.model.objects.none()

                if root == 0:
                    self.queryset = self.model.get_root_nodes()
                else:
                    self.queryset = self.model.objects.get(id=root).get_children()
        elif tree:
            if tree.isnumeric():
                try:
                    self.queryset = self.model.objects.get(id=int(tree)).get_descendants_and_self()
                except self.model.DoesNotExist:
                    self.queryset = self.model.objects.none()
        else:
            return self.annotate_recipe(queryset=super().get_queryset(), request=self.request, serializer=self.serializer_class, tree=True)
        self.queryset = self.queryset.filter(space=self.request.space).order_by(Lower('name').asc())

        return self.annotate_recipe(queryset=self.queryset, request=self.request, serializer=self.serializer_class, tree=True)

    @decorators.action(detail=True, url_path='move/(?P<parent>[^/.]+)', methods=['PUT'], )
    @decorators.renderer_classes((TemplateHTMLRenderer, JSONRenderer))
    def move(self, request, pk, parent):
        self.description = f"Move {self.basename} to be a child of {self.basename} with ID of [int].  Use ID: 0 to move {self.basename} to the root."
        if self.model.node_order_by:
            node_location = 'sorted'
        else:
            node_location = 'last'

        try:
            child = self.model.objects.get(pk=pk, space=self.request.space)
        except (self.model.DoesNotExist):
            content = {'error': True, 'msg': _(f'No {self.basename} with id {pk} exists')}
            return Response(content, status=status.HTTP_404_NOT_FOUND)

        parent = int(parent)
        # parent 0 is root of the tree
        if parent == 0:
            try:
                with scopes_disabled():
                    child.move(self.model.get_first_root_node(), f'{node_location}-sibling')
                content = {'msg': _(f'{child.name} was moved successfully to the root.')}
                return Response(content, status=status.HTTP_200_OK)
            except (PathOverflow, InvalidMoveToDescendant, InvalidPosition):
                content = {'error': True, 'msg': _('An error occurred attempting to move ') + child.name}
                return Response(content, status=status.HTTP_400_BAD_REQUEST)
        elif parent == child.id:
            content = {'error': True, 'msg': _('Cannot move an object to itself!')}
            return Response(content, status=status.HTTP_403_FORBIDDEN)

        try:
            parent = self.model.objects.get(pk=parent, space=self.request.space)
        except (self.model.DoesNotExist):
            content = {'error': True, 'msg': _(f'No {self.basename} with id {parent} exists')}
            return Response(content, status=status.HTTP_404_NOT_FOUND)

        try:
            with scopes_disabled():
                child.move(parent, f'{node_location}-child')
            content = {'msg': _(f'{child.name} was moved successfully to parent {parent.name}')}
            return Response(content, status=status.HTTP_200_OK)
        except (PathOverflow, InvalidMoveToDescendant, InvalidPosition):
            content = {'error': True, 'msg': _('An error occurred attempting to move ') + child.name}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(LoggingMixin, viewsets.ModelViewSet):
    """
    list:
    optional parameters

    - **filter_list**: array of user id's to get names for
    """
    queryset = User.objects
    serializer_class = UserSerializer
    permission_classes = [CustomUserPermission & CustomTokenHasReadWriteScope]
    http_method_names = ['get', 'patch']

    def get_queryset(self):
        queryset = self.queryset.filter(userspace__space=self.request.space)
        try:
            filter_list = self.request.query_params.get('filter_list', None)
            if filter_list is not None:
                queryset = queryset.filter(pk__in=json.loads(filter_list))
        except ValueError:
            raise APIException('Parameter filter_list incorrectly formatted')

        return queryset


class GroupViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]
    http_method_names = ['get', ]


class SpaceViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Space.objects
    serializer_class = SpaceSerializer
    permission_classes = [IsReadOnlyDRF & CustomIsGuest | CustomIsOwner & CustomIsAdmin & CustomTokenHasReadWriteScope]
    http_method_names = ['get', 'patch']

    def get_queryset(self):
        return self.queryset.filter(id=self.request.space.id)


class UserSpaceViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = UserSpace.objects
    serializer_class = UserSpaceSerializer
    permission_classes = [(CustomIsSpaceOwner | CustomIsOwnerReadOnly) & CustomTokenHasReadWriteScope]
    http_method_names = ['get', 'patch', 'delete']
    pagination_class = DefaultPagination

    def destroy(self, request, *args, **kwargs):
        if request.space.created_by == UserSpace.objects.get(pk=kwargs['pk']).user:
            raise APIException('Cannot delete Space owner permission.')
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        internal_note = self.request.query_params.get('internal_note', None)
        if internal_note is not None:
            self.queryset = self.queryset.filter(internal_note=internal_note)

        if is_space_owner(self.request.user, self.request.space):
            return self.queryset.filter(space=self.request.space)
        else:
            return self.queryset.filter(user=self.request.user, space=self.request.space)


class UserPreferenceViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = UserPreference.objects
    serializer_class = UserPreferenceSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]
    http_method_names = ['get', 'patch', ]

    def get_queryset(self):
        with scopes_disabled():  # need to disable scopes as user preference is no longer a spaced method
            return self.queryset.filter(user=self.request.user)


class StorageViewSet(LoggingMixin, viewsets.ModelViewSet):
    # TODO handle delete protect error and adjust test
    queryset = Storage.objects
    serializer_class = StorageSerializer
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class ConnectorConfigConfigViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ConnectorConfig.objects
    serializer_class = ConnectorConfigConfigSerializer
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class SyncViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Sync.objects
    serializer_class = SyncSerializer
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class SyncLogViewSet(LoggingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = SyncLog.objects
    serializer_class = SyncLogSerializer
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(sync__space=self.request.space)


class SupermarketViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    schema = FilterSchema()
    queryset = Supermarket.objects
    serializer_class = SupermarketSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space)
        return super().get_queryset()


class SupermarketCategoryViewSet(LoggingMixin, viewsets.ModelViewSet, FuzzyFilterMixin, MergeMixin):
    queryset = SupermarketCategory.objects
    model = SupermarketCategory
    serializer_class = SupermarketCategorySerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).order_by(Lower('name').asc())
        return super().get_queryset()


class SupermarketCategoryRelationViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    queryset = SupermarketCategoryRelation.objects
    serializer_class = SupermarketCategoryRelationSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        self.queryset = self.queryset.filter(supermarket__space=self.request.space).order_by('order')
        return super().get_queryset()


class KeywordViewSet(LoggingMixin, viewsets.ModelViewSet, TreeMixin):
    queryset = Keyword.objects
    model = Keyword
    serializer_class = KeywordSerializer
    permission_classes = [(CustomIsGuest & IsReadOnlyDRF | CustomIsUser) & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination


class UnitViewSet(LoggingMixin, viewsets.ModelViewSet, MergeMixin, FuzzyFilterMixin):
    queryset = Unit.objects
    model = Unit
    serializer_class = UnitSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination


class FoodInheritFieldViewSet(LoggingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = FoodInheritField.objects
    serializer_class = FoodInheritFieldSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        # exclude fields not yet implemented
        self.queryset = Food.inheritable_fields
        return super().get_queryset()


class FoodViewSet(LoggingMixin, viewsets.ModelViewSet, TreeMixin):
    queryset = Food.objects
    model = Food
    serializer_class = FoodSerializer
    permission_classes = [(CustomIsGuest & IsReadOnlyDRF | CustomIsUser) & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        shared_users = []
        if c := caches['default'].get(f'shopping_shared_users_{self.request.space.id}_{self.request.user.id}', None):
            shared_users = c
        else:
            try:
                shared_users = [x.id for x in list(self.request.user.get_shopping_share())] + [self.request.user.id]
                caches['default'].set(f'shopping_shared_users_{self.request.space.id}_{self.request.user.id}', shared_users, timeout=5 * 60)
                # TODO ugly hack that improves API performance significantly, should be done properly
            except AttributeError:  # Anonymous users (using share links) don't have shared users
                pass

        self.queryset = super().get_queryset()
        shopping_status = ShoppingListEntry.objects.filter(space=self.request.space, food=OuterRef('id'), checked=False).values('id')
        # onhand_status = self.queryset.annotate(onhand_status=Exists(onhand_users_set__in=[shared_users]))
        return self.queryset \
            .annotate(shopping_status=Exists(shopping_status)) \
            .prefetch_related('onhand_users', 'inherit_fields', 'child_inherit_fields', 'substitute') \
            .select_related('recipe', 'supermarket_category')

    def get_serializer_class(self):
        if self.request and self.request.query_params.get('simple', False):
            return FoodSimpleSerializer
        return self.serializer_class

    @decorators.action(detail=True, methods=['PUT'], serializer_class=FoodShoppingUpdateSerializer, )
    # TODO DRF only allows one action in a decorator action without overriding get_operation_id_base() this should be PUT and DELETE probably
    def shopping(self, request, pk):
        if self.request.space.demo:
            raise PermissionDenied(detail='Not available in demo', code=None)
        obj = self.get_object()
        shared_users = list(self.request.user.get_shopping_share())
        shared_users.append(request.user)
        if request.data.get('_delete', False) == 'true':
            ShoppingListEntry.objects.filter(food=obj, checked=False, space=request.space, created_by__in=shared_users).delete()
            content = {'msg': _(f'{obj.name} was removed from the shopping list.')}
            return Response(content, status=status.HTTP_204_NO_CONTENT)

        amount = request.data.get('amount', 1)
        unit = request.data.get('unit', None)
        content = {'msg': _(f'{obj.name} was added to the shopping list.')}

        ShoppingListEntry.objects.create(food=obj, amount=amount, unit=unit, space=request.space, created_by=request.user)
        return Response(content, status=status.HTTP_204_NO_CONTENT)

    @decorators.action(detail=True, methods=['POST'], )
    def fdc(self, request, pk):
        """
        updates the food with all possible data from the FDC Api
        if properties with a fdc_id already exist they will be overridden, if existing properties don't have a fdc_id they won't be changed
        """
        food = self.get_object()
        if not food.fdc_id:
            return JsonResponse({'msg': 'Food has no FDC ID associated.'}, status=400, json_dumps_params={'indent': 4})

        response = requests.get(f'https://api.nal.usda.gov/fdc/v1/food/{food.fdc_id}?api_key={FDC_API_KEY}')
        if response.status_code == 429:
            return JsonResponse(
                {
                    'msg':
                        'API Key Rate Limit reached/exceeded, see https://api.data.gov/docs/rate-limits/ for more information. \
                            Configure your key in Tandoor using environment FDC_API_KEY variable.'
                },
                status=429,
                json_dumps_params={'indent': 4})
        if response.status_code != 200:
            return JsonResponse({'msg': f'Error while requesting FDC data using url https://api.nal.usda.gov/fdc/v1/food/{food.fdc_id}?api_key=****'},
                                status=response.status_code,
                                json_dumps_params={'indent': 4})

        food.properties_food_amount = 100
        food.properties_food_unit = Unit.objects.get_or_create(base_unit__iexact='g',
                                                               space=self.request.space,
                                                               defaults={
                                                                   'name': 'g',
                                                                   'base_unit': 'g',
                                                                   'space': self.request.space
                                                               })[0]

        food.save()

        try:
            data = json.loads(response.content)

            food_property_list = []

            # delete all properties where the property type has a fdc_id as these should be overridden
            for fp in food.properties.all():
                if fp.property_type.fdc_id:
                    fp.delete()

            for pt in PropertyType.objects.filter(space=request.space, fdc_id__gte=0).all():
                if pt.fdc_id:
                    property_found = False
                    for fn in data['foodNutrients']:
                        if fn['nutrient']['id'] == pt.fdc_id:
                            property_found = True
                            food_property_list.append(Property(
                                property_type_id=pt.id,
                                property_amount=max(0, round(fn['amount'], 2)),  # sometimes FDC might return negative values which make no sense, set to 0
                                space=self.request.space,
                            ))
                    if not property_found:
                        food_property_list.append(Property(
                            property_type_id=pt.id,
                            property_amount=0,  # if field not in FDC data the food does not have that property
                            space=self.request.space,
                        ))

            properties = Property.objects.bulk_create(food_property_list, unique_fields=('space', 'property_type',))

            property_food_relation_list = []
            for p in properties:
                property_food_relation_list.append(Food.properties.through(food_id=food.id, property_id=p.pk))

            FoodProperty.objects.bulk_create(property_food_relation_list, ignore_conflicts=True, unique_fields=('food_id', 'property_id',))

            return self.retrieve(request, pk)
        except Exception:
            traceback.print_exc()
            return JsonResponse({'msg': 'there was an error parsing the FDC data, please check the server logs'}, status=500, json_dumps_params={'indent': 4})

    def destroy(self, *args, **kwargs):
        try:
            return (super().destroy(self, *args, **kwargs))
        except ProtectedError as e:
            content = {'error': True, 'msg': e.args[0]}
            return Response(content, status=status.HTTP_403_FORBIDDEN)


class RecipeBookViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    queryset = RecipeBook.objects
    serializer_class = RecipeBookSerializer
    permission_classes = [(CustomIsOwner | CustomIsShared) & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        order_field = self.request.GET.get('order_field')
        order_direction = self.request.GET.get('order_direction')

        if not order_field:
            order_field = 'id'

        ordering = f"{'' if order_direction == 'asc' else '-'}{order_field}"

        self.queryset = self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).filter(space=self.request.space).distinct().order_by(ordering)
        return super().get_queryset()


class RecipeBookEntryViewSet(LoggingMixin, viewsets.ModelViewSet, viewsets.GenericViewSet):
    """
        list:
        optional parameters

        - **recipe**: id of recipe - only return books for that recipe
        - **book**: id of book - only return recipes in that book

    """
    queryset = RecipeBookEntry.objects
    serializer_class = RecipeBookEntrySerializer
    permission_classes = [(CustomIsOwner | CustomIsShared) & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        queryset = self.queryset.filter(Q(book__created_by=self.request.user) | Q(book__shared=self.request.user)).filter(book__space=self.request.space).distinct()

        recipe_id = self.request.query_params.get('recipe', None)
        if recipe_id is not None:
            queryset = queryset.filter(recipe__pk=recipe_id)

        book_id = self.request.query_params.get('book', None)
        if book_id is not None:
            queryset = queryset.filter(book__pk=book_id)
        return queryset


class MealPlanViewSet(LoggingMixin, viewsets.ModelViewSet):
    """
    list:
    optional parameters

    - **from_date**: filter from (inclusive) a certain date onward
    - **to_date**: filter upward to (inclusive) certain date
    - **meal_type**: filter meal plans based on meal_type ID

    """
    queryset = MealPlan.objects
    serializer_class = MealPlanSerializer
    permission_classes = [(CustomIsOwner | CustomIsShared) & CustomTokenHasReadWriteScope]
    query_params = [
        QueryParam(name='from_date', description=_('Filter meal plans from date (inclusive) in the format of YYYY-MM-DD.'), qtype='string'),
        QueryParam(name='to_date', description=_('Filter meal plans to date (inclusive) in the format of YYYY-MM-DD.'), qtype='string'),
        QueryParam(name='meal_type', description=_('Filter meal plans with MealType ID. For multiple repeat parameter.'), qtype='integer'),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        queryset = self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).filter(space=self.request.space).distinct().all()

        from_date = self.request.query_params.get('from_date', None)
        if from_date is not None:
            queryset = queryset.filter(to_date__gte=from_date)

        to_date = self.request.query_params.get('to_date', None)
        if to_date is not None:
            queryset = queryset.filter(to_date__lte=to_date)

        meal_type = self.request.query_params.getlist('meal_type', [])
        if meal_type:
            queryset = queryset.filter(meal_type__in=meal_type)

        return queryset


class AutoPlanViewSet(LoggingMixin, viewsets.ViewSet):

    def create(self, request):
        serializer = AutoMealPlanSerializer(data=request.data)

        if serializer.is_valid():
            keyword_ids = serializer.validated_data['keyword_ids']
            start_date = serializer.validated_data['start_date']
            end_date = serializer.validated_data['end_date']
            servings = serializer.validated_data['servings']
            shared = serializer.get_initial().get('shared', None)
            shared_pks = list()
            if shared is not None:
                for i in range(len(shared)):
                    shared_pks.append(shared[i]['id'])

            days = min((end_date - start_date).days + 1, 14)

            recipes = Recipe.objects.values('id', 'name')
            meal_plans = list()

            for keyword_id in keyword_ids:
                recipes = recipes.filter(keywords__id=keyword_id)

            if len(recipes) == 0:
                return Response(serializer.data)
            recipes = list(recipes.order_by('?')[:days])

            for i in range(0, days):
                day = start_date + datetime.timedelta(i)
                recipe = recipes[i % len(recipes)]
                args = {
                    'recipe_id': recipe['id'],
                    'servings': servings,
                    'created_by': request.user,
                    'meal_type_id': serializer.validated_data['meal_type_id'],
                    'note': '',
                    'from_date': day,
                    'to_date': day,
                    'space': request.space
                }

                m = MealPlan(**args)
                meal_plans.append(m)

            MealPlan.objects.bulk_create(meal_plans)

            for m in meal_plans:
                m.shared.set(shared_pks)

                if request.data.get('addshopping', False):
                    SLR = RecipeShoppingEditor(user=request.user, space=request.space)
                    SLR.create(mealplan=m, servings=servings)

                else:
                    post_save.send(sender=m.__class__, instance=m, created=True, update_fields=None, )

            return Response(serializer.data)

        return Response(serializer.errors, 400)


class MealTypeViewSet(LoggingMixin, viewsets.ModelViewSet):
    """
    returns list of meal types created by the
    requesting user ordered by the order field.
    """
    queryset = MealType.objects
    serializer_class = MealTypeSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        queryset = self.queryset.order_by('order', 'id').filter(created_by=self.request.user).filter(space=self.request.space).all()
        return queryset


class IngredientViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Ingredient.objects
    serializer_class = IngredientSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_serializer_class(self):
        if self.request and self.request.query_params.get('simple', False):
            return IngredientSimpleSerializer
        return self.serializer_class

    def get_queryset(self):
        queryset = self.queryset.filter(step__recipe__space=self.request.space)
        food = self.request.query_params.get('food', None)
        if food and re.match(r'^(\d)+$', food):
            queryset = queryset.filter(food_id=food)

        unit = self.request.query_params.get('unit', None)
        if unit and re.match(r'^(\d)+$', unit):
            queryset = queryset.filter(unit_id=unit)

        return queryset.select_related('food')


class StepViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Step.objects
    serializer_class = StepSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination
    query_params = [
        QueryParam(name='recipe', description=_('ID of recipe a step is part of. For multiple repeat parameter.'), qtype='integer'),
        QueryParam(name='query', description=_('Query string matched (fuzzy) against object name.'), qtype='string'),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        recipes = self.request.query_params.getlist('recipe', [])
        query = self.request.query_params.get('query', None)
        if len(recipes) > 0:
            self.queryset = self.queryset.filter(recipe__in=recipes)
        if query is not None:
            self.queryset = self.queryset.filter(Q(name__icontains=query) | Q(recipe__name__icontains=query))
        return self.queryset.filter(recipe__space=self.request.space)


class RecipePagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if queryset is None:
            raise Exception
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(OrderedDict([('count', self.page.paginator.count), ('next', self.get_next_link()), ('previous', self.get_previous_link()), ('results', data), ]))


class RecipeViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Recipe.objects
    serializer_class = RecipeSerializer
    # TODO split read and write permission for meal plan guest
    permission_classes = [CustomRecipePermission & CustomTokenHasReadWriteScope]
    pagination_class = RecipePagination

    query_params = [
        QueryParam(name='query', description=_('Query string matched (fuzzy) against recipe name. In the future also fulltext search.')),
        QueryParam(name='keywords', description=_('ID of keyword a recipe should have. For multiple repeat parameter. Equivalent to keywords_or'), qtype='integer'),
        QueryParam(name='keywords_or', description=_('Keyword IDs, repeat for multiple. Return recipes with any of the keywords'), qtype='integer'),
        QueryParam(name='keywords_and', description=_('Keyword IDs, repeat for multiple. Return recipes with all of the keywords.'), qtype='integer'),
        QueryParam(name='keywords_or_not', description=_('Keyword IDs, repeat for multiple. Exclude recipes with any of the keywords.'), qtype='integer'),
        QueryParam(name='keywords_and_not', description=_('Keyword IDs, repeat for multiple. Exclude recipes with all of the keywords.'), qtype='integer'),
        QueryParam(name='foods', description=_('ID of food a recipe should have. For multiple repeat parameter.'), qtype='integer'),
        QueryParam(name='foods_or', description=_('Food IDs, repeat for multiple. Return recipes with any of the foods'), qtype='integer'),
        QueryParam(name='foods_and', description=_('Food IDs, repeat for multiple. Return recipes with all of the foods.'), qtype='integer'),
        QueryParam(name='foods_or_not', description=_('Food IDs, repeat for multiple. Exclude recipes with any of the foods.'), qtype='integer'),
        QueryParam(name='foods_and_not', description=_('Food IDs, repeat for multiple. Exclude recipes with all of the foods.'), qtype='integer'),
        QueryParam(name='units', description=_('ID of unit a recipe should have.'), qtype='integer'),
        QueryParam(name='rating', description=_('Rating a recipe should have or greater. [0 - 5] Negative value filters rating less than.'), qtype='integer'),
        QueryParam(name='books', description=_('ID of book a recipe should be in. For multiple repeat parameter.')),
        QueryParam(name='books_or', description=_('Book IDs, repeat for multiple. Return recipes with any of the books'), qtype='integer'),
        QueryParam(name='books_and', description=_('Book IDs, repeat for multiple. Return recipes with all of the books.'), qtype='integer'),
        QueryParam(name='books_or_not', description=_('Book IDs, repeat for multiple. Exclude recipes with any of the books.'), qtype='integer'),
        QueryParam(name='books_and_not', description=_('Book IDs, repeat for multiple. Exclude recipes with all of the books.'), qtype='integer'),
        QueryParam(name='internal', description=_('If only internal recipes should be returned. [''true''/''<b>false</b>'']')),
        QueryParam(name='random', description=_('Returns the results in randomized order. [''true''/''<b>false</b>'']')),
        QueryParam(name='new', description=_('Returns new results first in search results. [''true''/''<b>false</b>'']')),
        QueryParam(name='timescooked', description=_('Filter recipes cooked X times or more.  Negative values returns cooked less than X times'), qtype='integer'),
        QueryParam(name='cookedon', description=_('Filter recipes last cooked on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='createdon', description=_('Filter recipes created on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='updatedon', description=_('Filter recipes updated on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='viewedon', description=_('Filter recipes lasts viewed on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='makenow', description=_('Filter recipes that can be made with OnHand food. [''true''/''<b>false</b>'']')),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        share = self.request.query_params.get('share', None)

        if self.detail:  # if detail request and not list, private condition is verified by permission class
            if not share:  # filter for space only if not shared
                self.queryset = self.queryset.filter(
                    space=self.request.space).prefetch_related('keywords', 'shared', 'properties', 'properties__property_type', 'steps', 'steps__ingredients',
                                                               'steps__ingredients__step_set', 'steps__ingredients__step_set__recipe_set', 'steps__ingredients__food',
                                                               'steps__ingredients__food__properties', 'steps__ingredients__food__properties__property_type',
                                                               'steps__ingredients__food__inherit_fields', 'steps__ingredients__food__supermarket_category',
                                                               'steps__ingredients__food__onhand_users', 'steps__ingredients__food__substitute',
                                                               'steps__ingredients__food__child_inherit_fields', 'steps__ingredients__unit',
                                                               'steps__ingredients__unit__unit_conversion_base_relation',
                                                               'steps__ingredients__unit__unit_conversion_base_relation__base_unit',
                                                               'steps__ingredients__unit__unit_conversion_converted_relation',
                                                               'steps__ingredients__unit__unit_conversion_converted_relation__converted_unit', 'cooklog_set',
                                                               ).select_related('nutrition')

            return super().get_queryset()

        self.queryset = self.queryset.filter(
            space=self.request.space).filter(Q(private=False) | (Q(private=True) & (Q(created_by=self.request.user) | Q(shared=self.request.user))))

        params = {x: self.request.GET.get(x) if len({**self.request.GET}[x]) == 1 else self.request.GET.getlist(x) for x in list(self.request.GET)}
        search = RecipeSearch(self.request, **params)
        self.queryset = search.get_queryset(self.queryset).prefetch_related('keywords', 'cooklog_set')
        return self.queryset

    def list(self, request, *args, **kwargs):
        if self.request.GET.get('debug', False):
            return JsonResponse({'new': str(self.get_queryset().query), })
        return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == 'list':
            return RecipeOverviewSerializer
        return self.serializer_class

    @decorators.action(detail=True, methods=['PUT'], serializer_class=RecipeImageSerializer, parser_classes=[MultiPartParser], )
    def image(self, request, pk):
        obj = self.get_object()

        if obj.get_space() != request.space:
            raise PermissionDenied(detail='You do not have the required permission to perform this action', code=403)

        serializer = self.serializer_class(obj, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            image = None
            filetype = ".jpeg"  # fall-back to .jpeg, even if wrong, at least users will know it's an image and most image viewers can open it correctly anyways

            if 'image' in serializer.validated_data:
                image = obj.image
                filetype = mimetypes.guess_extension(serializer.validated_data['image'].content_type) or filetype
            elif 'image_url' in serializer.validated_data:
                try:
                    url = serializer.validated_data['image_url']
                    if validate_import_url(url):
                        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0"})
                        image = File(io.BytesIO(response.content))
                        filetype = mimetypes.guess_extension(response.headers['content-type']) or filetype
                except UnidentifiedImageError as e:
                    print(e)
                    pass
                except MissingSchema as e:
                    print(e)
                    pass
                except Exception as e:
                    print(e)
                    pass

            if image is not None:
                img = handle_image(request, image, filetype)
                obj.image.save(f'{uuid.uuid4()}_{obj.pk}{filetype}', img)
                obj.save()
                return Response(serializer.data)
            else:
                obj.image = None
                obj.save()
                return Response(serializer.data)

        return Response(serializer.errors, 400)

    # TODO: refactor API to use post/put/delete or leave as put and change VUE to use list_recipe after creating
    # DRF only allows one action in a decorator action without overriding get_operation_id_base()
    @decorators.action(detail=True, methods=['PUT'], serializer_class=RecipeShoppingUpdateSerializer, )
    def shopping(self, request, pk):
        if self.request.space.demo:
            raise PermissionDenied(detail='Not available in demo', code=None)
        obj = self.get_object()
        ingredients = request.data.get('ingredients', None)

        servings = request.data.get('servings', None)
        list_recipe = request.data.get('list_recipe', None)
        mealplan = request.data.get('mealplan', None)
        SLR = RecipeShoppingEditor(request.user, request.space, id=list_recipe, recipe=obj, mealplan=mealplan, servings=servings)

        content = {'msg': _(f'{obj.name} was added to the shopping list.')}
        http_status = status.HTTP_204_NO_CONTENT
        if servings and servings <= 0:
            result = SLR.delete()
        elif list_recipe:
            result = SLR.edit(servings=servings, ingredients=ingredients)
        else:
            result = SLR.create(servings=servings, ingredients=ingredients)

        if not result:
            content = {'msg': ('An error occurred')}
            http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        else:
            content = {'msg': _(f'{obj.name} was added to the shopping list.')}
            http_status = status.HTTP_204_NO_CONTENT

        return Response(content, status=http_status)

    @decorators.action(detail=True, methods=['GET'], serializer_class=RecipeSimpleSerializer)
    def related(self, request, pk):
        obj = self.get_object()
        if obj.get_space() != request.space:
            raise PermissionDenied(detail='You do not have the required permission to perform this action', code=403)
        try:
            levels = int(request.query_params.get('levels', 1))
        except (ValueError, TypeError):
            levels = 1
        qs = obj.get_related_recipes(levels=levels)  # TODO: make levels a user setting, included in request data?, keep solely in the backend?
        return Response(self.serializer_class(qs, many=True).data)


class UnitConversionViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = UnitConversion.objects
    serializer_class = UnitConversionSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    query_params = [
        QueryParam(name='food_id', description='ID of food to filter for', qtype='integer'),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        food_id = self.request.query_params.get('food_id', None)
        if food_id is not None:
            self.queryset = self.queryset.filter(food_id=food_id)

        return self.queryset.filter(space=self.request.space)


class PropertyTypeViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = PropertyType.objects
    serializer_class = PropertyTypeSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class PropertyViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Property.objects
    serializer_class = PropertySerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class ShoppingListRecipeViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ShoppingListRecipe.objects
    serializer_class = ShoppingListRecipeSerializer
    permission_classes = [(CustomIsOwner | CustomIsShared) & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        self.queryset = self.queryset.filter(Q(entries__space=self.request.space) | Q(recipe__space=self.request.space))
        return self.queryset.filter(
            Q(entries__isnull=True)
            | Q(entries__created_by=self.request.user)
            | Q(entries__created_by__in=list(self.request.user.get_shopping_share()))
        ).distinct().all()


class ShoppingListEntryViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ShoppingListEntry.objects
    serializer_class = ShoppingListEntrySerializer
    permission_classes = [(CustomIsOwner | CustomIsShared) & CustomTokenHasReadWriteScope]
    query_params = [
        QueryParam(name='id', description=_('Returns the shopping list entry with a primary key of id.  Multiple values allowed.'), qtype='integer'),
        QueryParam(
            name='checked',
            description=_('Filter shopping list entries on checked.  [''true'', ''false'', ''both'', ''<b>recent</b>'']<br>  \
                - ''recent'' includes unchecked items and recently completed items.')
        ),
        QueryParam(name='supermarket', description=_('Returns the shopping list entries sorted by supermarket category order.'), qtype='integer'),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space)

        self.queryset = self.queryset.filter(
            Q(created_by=self.request.user)
            | Q(created_by__in=list(self.request.user.get_shopping_share()))).prefetch_related('created_by', 'food', 'food__properties', 'food__properties__property_type',
                                                                                               'food__inherit_fields', 'food__supermarket_category', 'food__onhand_users',
                                                                                               'food__substitute', 'food__child_inherit_fields', 'unit', 'list_recipe',
                                                                                               'list_recipe__mealplan', 'list_recipe__mealplan__recipe',
                                                                                               ).distinct().all()

        if pk := self.request.query_params.getlist('id', []):
            self.queryset = self.queryset.filter(food__id__in=[int(i) for i in pk])

        if 'checked' in self.request.query_params:
            return shopping_helper(self.queryset, self.request)
        elif not self.detail:
            today_start = timezone.now().replace(hour=0, minute=0, second=0)
            week_ago = today_start - datetime.timedelta(days=min(self.request.user.userpreference.shopping_recent_days, 14))
            self.queryset = self.queryset.filter(Q(checked=False) | Q(completed_at__gte=week_ago))

        try:
            last_autosync = self.request.query_params.get('last_autosync', None)
            if last_autosync:
                last_autosync = datetime.datetime.fromtimestamp(int(last_autosync) / 1000, datetime.timezone.utc)
                self.queryset = self.queryset.filter(updated_at__gte=last_autosync)
        except Exception:
            traceback.print_exc()

        # TODO once old shopping list is removed this needs updated to sharing users in preferences
        if self.detail:
            return self.queryset
        else:
            return self.queryset[:1000]

    @decorators.action(detail=False, methods=['POST'], serializer_class=ShoppingListEntryBulkSerializer, permission_classes=[CustomIsUser])
    def bulk(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            print(serializer.validated_data)
            bulk_entries = ShoppingListEntry.objects.filter(
                Q(created_by=self.request.user) | Q(created_by__in=list(self.request.user.get_shopping_share()))
            ).filter(space=request.space, id__in=serializer.validated_data['ids'])
            bulk_entries.update(checked=(checked := serializer.validated_data['checked']), updated_at=timezone.now(), )

            # update the onhand for food if shopping_add_onhand is True
            if request.user.userpreference.shopping_add_onhand:
                foods = Food.objects.filter(id__in=bulk_entries.values('food'))
                if checked:
                    for f in foods:
                        f.onhand_users.add(*request.user.userpreference.shopping_share.all(), request.user)
                elif checked == False:
                    for f in foods:
                        f.onhand_users.remove(*request.user.userpreference.shopping_share.all(), request.user)

            return Response(serializer.data)
        else:
            return Response(serializer.errors, 400)


class ViewLogViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ViewLog.objects
    serializer_class = ViewLogSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        # working backwards from the test - this is supposed to be limited to user view logs only??
        return self.queryset.filter(created_by=self.request.user).filter(space=self.request.space)


class CookLogViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = CookLog.objects
    serializer_class = CookLogSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination
    query_params = [
        QueryParam(name='recipe', description=_('Filter for entries with the given recipe'), qtype='integer'),
    ]

    def get_queryset(self):
        if self.request.query_params.get('recipe', None):
            self.queryset = self.queryset.filter(recipe=self.request.query_params.get('recipe'))
        return self.queryset.filter(space=self.request.space)


class ImportLogViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ImportLog.objects
    serializer_class = ImportLogSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class ExportLogViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = ExportLog.objects
    serializer_class = ExportLogSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class BookmarkletImportViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = BookmarkletImport.objects
    serializer_class = BookmarkletImportSerializer
    permission_classes = [CustomIsUser & CustomTokenHasScope]
    required_scopes = ['bookmarklet']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookmarkletImportListSerializer
        return self.serializer_class

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space).all()


class UserFileViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    schema = FilterSchema()
    queryset = UserFile.objects
    serializer_class = UserFileSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).all()
        return super().get_queryset()


class AutomationViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    """
    list:
    optional parameters

    - **automation_type**: Return the Automations matching the automation type.  Multiple values allowed.

    *Automation Types:*
    - FS: Food Alias
    - UA: Unit Alias
    - KA: Keyword Alias
    - DR: Description Replace
    - IR: Instruction Replace
    - NU: Never Unit
    - TW: Transpose Words
    - FR: Food Replace
    - UR: Unit Replace
    - NR: Name Replace
    """

    queryset = Automation.objects
    serializer_class = AutomationSerializer
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    query_params = [
        QueryParam(name='automation_type', description=_('Return the Automations matching the automation type.  Multiple values allowed.'), qtype='string'),
    ]
    schema = QueryParamAutoSchema()

    auto_type = {
        'FS': 'FOOD_ALIAS',
        'UA': 'UNIT_ALIAS',
        'KA': 'KEYWORD_ALIAS',
        'DR': 'DESCRIPTION_REPLACE',
        'IR': 'INSTRUCTION_REPLACE',
        'NU': 'NEVER_UNIT',
        'TW': 'TRANSPOSE_WORDS',
        'FR': 'FOOD_REPLACE',
        'UR': 'UNIT_REPLACE',
        'NR': 'NAME_REPLACE'
    }

    def get_queryset(self):
        automation_type = self.request.query_params.getlist('automation_type', [])
        if automation_type:
            self.queryset = self.queryset.filter(type__in=[self.auto_type[x.upper()] for x in automation_type])
        self.queryset = self.queryset.filter(space=self.request.space).all()
        return super().get_queryset()


class InviteLinkViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    queryset = InviteLink.objects
    serializer_class = InviteLinkSerializer
    permission_classes = [CustomIsSpaceOwner & CustomIsAdmin & CustomTokenHasReadWriteScope]

    def get_queryset(self):

        internal_note = self.request.query_params.get('internal_note', None)
        if internal_note is not None:
            self.queryset = self.queryset.filter(internal_note=internal_note)

        if is_space_owner(self.request.user, self.request.space):
            self.queryset = self.queryset.filter(space=self.request.space).all()
            return super().get_queryset()
        else:
            return None


class CustomFilterViewSet(LoggingMixin, viewsets.ModelViewSet, StandardFilterMixin):
    queryset = CustomFilter.objects
    serializer_class = CustomFilterSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]
    pagination_class = DefaultPagination

    def get_queryset(self):
        self.queryset = self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).filter(space=self.request.space).distinct()
        return super().get_queryset()


class AccessTokenViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = AccessToken.objects
    serializer_class = AccessTokenSerializer
    permission_classes = [CustomIsOwner & CustomTokenHasReadWriteScope]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


# -------------- DRF custom views --------------------


class AuthTokenThrottle(AnonRateThrottle):
    rate = '10/day'


class RecipeImportThrottle(UserRateThrottle):
    rate = DRF_THROTTLE_RECIPE_URL_IMPORT


class CustomAuthToken(ObtainAuthToken):
    throttle_classes = [AuthTokenThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        if token := AccessToken.objects.filter(user=user, expires__gt=timezone.now(), scope__contains='read').filter(scope__contains='write').first():
            access_token = token
        else:
            access_token = AccessToken.objects.create(user=user,
                                                      token=f'tda_{str(uuid.uuid4()).replace("-", "_")}',
                                                      expires=(timezone.now() + timezone.timedelta(days=365 * 5)),
                                                      scope='read write app')
        return Response({
            'id': access_token.id,
            'token': access_token.token,
            'scope': access_token.scope,
            'expires': access_token.expires,
            'user_id': access_token.user.pk,
            'test': user.pk
        })


class RecipeUrlImportView(APIView):
    throttle_classes = [RecipeImportThrottle]
    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]

    def post(self, request, *args, **kwargs):
        """
        function to retrieve a recipe from a given url or source string
        :param request: standard request with additional post parameters
                - url: url to use for importing recipe
                - data: if no url is given recipe is imported from provided source data
                - (optional) bookmarklet: id of bookmarklet import to use, overrides URL and data attributes
        :return: JsonResponse containing the parsed json and images
        """
        scrape = None
        serializer = RecipeFromSourceSerializer(data=request.data)
        if serializer.is_valid():

            if (b_pk := serializer.validated_data.get('bookmarklet', None)) and (bookmarklet := BookmarkletImport.objects.filter(pk=b_pk).first()):
                serializer.validated_data['url'] = bookmarklet.url
                serializer.validated_data['data'] = bookmarklet.html
                bookmarklet.delete()

            url = serializer.validated_data.get('url', None)
            data = unquote(serializer.validated_data.get('data', None))

            duplicate = False
            if url:
                # Check for existing recipes with provided url
                existing_recipe = Recipe.objects.filter(source_url=url).first()
                if existing_recipe:
                    duplicate = True

            if not url and not data:
                return Response({'error': True, 'msg': _('Nothing to do.')}, status=status.HTTP_400_BAD_REQUEST)

            elif url and not data:
                if re.match('^(https?://)?(www\\.youtube\\.com|youtu\\.be)/.+$', url):
                    if validate_import_url(url):
                        return Response({'recipe_json': get_from_youtube_scraper(url, request), 'recipe_images': [], 'duplicate': duplicate}, status=status.HTTP_200_OK)
                if re.match('^(.)*/view/recipe/[0-9]+/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', url):
                    recipe_json = requests.get(
                        url.replace('/view/recipe/', '/api/recipe/').replace(re.split('/view/recipe/[0-9]+', url)[1], '') + '?share='
                        + re.split('/view/recipe/[0-9]+', url)[1].replace('/', '')).json()
                    recipe_json = clean_dict(recipe_json, 'id')
                    serialized_recipe = RecipeExportSerializer(data=recipe_json, context={'request': request})
                    if serialized_recipe.is_valid():
                        recipe = serialized_recipe.save()
                        if validate_import_url(recipe_json['image']):
                            recipe.image = File(handle_image(request,
                                                             File(io.BytesIO(requests.get(recipe_json['image']).content), name='image'),
                                                             filetype=pathlib.Path(recipe_json['image']).suffix),
                                                name=f'{uuid.uuid4()}_{recipe.pk}{pathlib.Path(recipe_json["image"]).suffix}')
                        recipe.save()
                        return Response({'link': request.build_absolute_uri(reverse('view_recipe', args={recipe.pk})), 'duplicate': duplicate}, status=status.HTTP_201_CREATED)
                else:
                    try:
                        if validate_import_url(url):
                            html = requests.get(
                                url,
                                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0"}
                            ).content
                            scrape = scrape_html(org_url=url, html=html, supported_only=False)
                        else:
                            return Response({'error': True, 'msg': _('Invalid Url')}, status=status.HTTP_400_BAD_REQUEST)
                    except NoSchemaFoundInWildMode:
                        pass
                    except requests.exceptions.ConnectionError:
                        return Response({'error': True, 'msg': _('Connection Refused.')}, status=status.HTTP_400_BAD_REQUEST)
                    except requests.exceptions.MissingSchema:
                        return Response({'error': True, 'msg': _('Bad URL Schema.')}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    data_json = json.loads(data)
                    if '@context' not in data_json:
                        data_json['@context'] = 'https://schema.org'
                    if '@type' not in data_json:
                        data_json['@type'] = 'Recipe'
                    data = "<script type='application/ld+json'>" + json.dumps(data_json) + "</script>"
                except JSONDecodeError:
                    pass
                scrape = scrape_html(html=data, org_url='https://urlnotfound.none', supported_only=False)
                if not url and (found_url := scrape.schema.data.get('url', 'https://urlnotfound.none')):
                    scrape = scrape_html(html=data, org_url=found_url, supported_only=False)

            if scrape:
                return Response({
                    'recipe_json': helper.get_from_scraper(scrape, request),
                    'recipe_images': list(dict.fromkeys(get_images_from_soup(scrape.soup, url))),
                    'duplicate': duplicate
                },
                    status=status.HTTP_200_OK)

            else:
                return Response({'error': True, 'msg': _('No usable data could be found.')}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
# @schema(AutoSchema()) #TODO add proper schema
@permission_classes([CustomIsAdmin & CustomTokenHasReadWriteScope])
# TODO add rate limiting
def reset_food_inheritance(request):
    """
    function to reset inheritance from api, see food method for docs
    """
    try:
        Food.reset_inheritance(space=request.space)
        return Response({'message': 'success', }, status=status.HTTP_200_OK)
    except Exception:
        traceback.print_exc()
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
# @schema(AutoSchema()) #TODO add proper schema
@permission_classes([CustomIsAdmin & CustomTokenHasReadWriteScope])
# TODO add rate limiting
def switch_active_space(request, space_id):
    """
    api endpoint to switch space function
    """
    try:
        space = get_object_or_404(Space, id=space_id)
        user_space = switch_user_active_space(request.user, space)
        if user_space:
            return Response(UserSpaceSerializer().to_representation(instance=user_space), status=status.HTTP_200_OK)
        else:
            return Response("not found", status=status.HTTP_404_NOT_FOUND)
    except Exception:
        traceback.print_exc()
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
# @schema(AutoSchema()) #TODO add proper schema
@permission_classes([CustomIsUser & CustomTokenHasReadWriteScope])
def download_file(request, file_id):
    """
    function to download a user file securely (wrapping as zip to prevent any context based XSS problems)
    temporary solution until a real file manager is implemented
    """
    try:
        uf = UserFile.objects.get(space=request.space, pk=file_id)

        in_memory = io.BytesIO()
        zf = ZipFile(in_memory, mode="w")
        zf.writestr(uf.file.name, uf.file.file.read())
        zf.close()

        response = HttpResponse(in_memory.getvalue(), content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename="' + uf.name + '.zip"'
        return response

    except Exception:
        traceback.print_exc()
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
# @schema(AutoSchema()) #TODO add proper schema
@permission_classes([CustomIsUser & CustomTokenHasReadWriteScope])
def import_files(request):
    """
    function to handle files passed by application importer
    """
    limit, msg = above_space_limit(request.space)
    if limit:
        return Response({'error': True, 'msg': _('File is above space limit')}, status=status.HTTP_400_BAD_REQUEST)

    form = ImportForm(request.POST, request.FILES)
    if form.is_valid() and request.FILES != {}:
        try:
            integration = get_integration(request, form.cleaned_data['type'])

            il = ImportLog.objects.create(type=form.cleaned_data['type'], created_by=request.user, space=request.space)
            files = []
            for f in request.FILES.getlist('files'):
                files.append({'file': io.BytesIO(f.read()), 'name': f.name})
            t = threading.Thread(target=integration.do_import, args=[files, il, form.cleaned_data['duplicates']])
            t.setDaemon(True)
            t.start()

            return Response({'import_id': il.pk}, status=status.HTTP_200_OK)
        except NotImplementedError:
            return Response({'error': True, 'msg': _('Importing is not implemented for this provider')}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': True, 'msg': form.errors}, status=status.HTTP_400_BAD_REQUEST)


class ImportOpenData(APIView):
    permission_classes = [CustomIsAdmin & CustomTokenHasReadWriteScope]

    def get(self, request, format=None):
        response = requests.get('https://raw.githubusercontent.com/TandoorRecipes/open-tandoor-data/main/build/meta.json')
        metadata = json.loads(response.content)
        return Response(metadata)

    def post(self, request, *args, **kwargs):
        # TODO validate data
        print(request.data)
        selected_version = request.data['selected_version']
        selected_datatypes = request.data['selected_datatypes']
        update_existing = str2bool(request.data['update_existing'])
        use_metric = str2bool(request.data['use_metric'])

        response = requests.get(f'https://raw.githubusercontent.com/TandoorRecipes/open-tandoor-data/main/build/{selected_version}.json')  # TODO catch 404, timeout, ...
        data = json.loads(response.content)

        response_obj = {}

        data_importer = OpenDataImporter(request, data, update_existing=update_existing, use_metric=use_metric)

        if selected_datatypes['unit']['selected']:
            response_obj['unit'] = data_importer.import_units().to_dict()
        if selected_datatypes['category']['selected']:
            response_obj['category'] = data_importer.import_category().to_dict()
        if selected_datatypes['property']['selected']:
            response_obj['property'] = data_importer.import_property().to_dict()
        if selected_datatypes['store']['selected']:
            response_obj['store'] = data_importer.import_supermarket().to_dict()
        if selected_datatypes['food']['selected']:
            response_obj['food'] = data_importer.import_food().to_dict()
        if selected_datatypes['conversion']['selected']:
            response_obj['conversion'] = data_importer.import_conversion().to_dict()

        return Response(response_obj)


def get_recipe_provider(recipe):
    if recipe.storage.method == Storage.DROPBOX:
        return Dropbox
    elif recipe.storage.method == Storage.NEXTCLOUD:
        return Nextcloud
    elif recipe.storage.method == Storage.LOCAL:
        return Local
    else:
        raise Exception('Provider not implemented')


def update_recipe_links(recipe):
    if not recipe.link:
        # TODO response validation in apis
        recipe.link = get_recipe_provider(recipe).get_share_link(recipe)

    recipe.save()


@group_required('user')
def get_external_file_link(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id, space=request.space)
    if not recipe.link:
        update_recipe_links(recipe)

    return HttpResponse(recipe.link)


@group_required('guest')
def get_recipe_file(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id, space=request.space)
    if recipe.storage:
        return FileResponse(get_recipe_provider(recipe).get_file(recipe))
    else:
        return FileResponse()


@group_required('user')
def sync_all(request):
    if request.space.demo or settings.HOSTED:
        messages.add_message(request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
        return redirect('index')

    monitors = Sync.objects.filter(active=True).filter(space=request.user.userspace_set.filter(active=1).first().space)

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
        if monitor.storage.method == Storage.LOCAL:
            ret = Local.import_all(monitor)
            if not ret:
                error = True

    if not error:
        messages.add_message(request, messages.SUCCESS, _('Sync successful!'))
        return redirect('list_recipe_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('list_recipe_import')


@api_view(['GET'])
# @schema(AutoSchema()) #TODO add proper schema
@permission_classes([CustomIsUser & CustomTokenHasReadWriteScope])
def share_link(request, pk):
    if request.space.allow_sharing and has_group_permission(request.user, ('user',)):
        recipe = get_object_or_404(Recipe, pk=pk, space=request.space)
        link = ShareLink.objects.create(recipe=recipe, created_by=request.user, space=request.space)
        return JsonResponse({'pk': pk, 'share': link.uuid, 'link': request.build_absolute_uri(reverse('view_recipe', args=[pk, link.uuid]))})
    else:
        return JsonResponse({'error': 'sharing_disabled'}, status=403)


@group_required('user')
@ajax_request
def log_cooking(request, recipe_id):
    recipe = get_object_or_None(Recipe, id=recipe_id)
    if recipe:
        log = CookLog.objects.create(created_by=request.user, recipe=recipe, space=request.space)
        servings = request.GET['s'] if 's' in request.GET else None
        if servings and re.match(r'^([1-9])+$', servings):
            log.servings = int(servings)

        rating = request.GET['r'] if 'r' in request.GET else None
        if rating and re.match(r'^([1-9])+$', rating):
            log.rating = int(rating)
        log.save()
        return {'msg': 'updated successfully'}

    return {'error': 'recipe does not exist'}


@api_view(['GET'])
@permission_classes([CustomIsUser & CustomTokenHasReadWriteScope])
def get_plan_ical(request, from_date=datetime.date.today(), to_date=None):
    queryset = MealPlan.objects.filter(Q(created_by=request.user)
                                       | Q(shared=request.user)).filter(space=request.user.userspace_set.filter(active=1).first().space).distinct().all()

    if from_date is not None:
        queryset = queryset.filter(from_date__gte=from_date)

    if to_date is not None:
        queryset = queryset.filter(to_date__lte=to_date)

    cal = Calendar()

    for p in queryset:
        event = Event()
        event['uid'] = p.id
        event.add('dtstart', p.from_date)
        if p.to_date:
            event.add('dtend', p.to_date)
        else:
            event.add('dtend', p.from_date)
        event['summary'] = f'{p.meal_type.name}: {p.get_label()}'
        event['description'] = p.note
        cal.add_component(event)

    response = FileResponse(io.BytesIO(cal.to_ical()))
    response["Content-Disposition"] = f'attachment; filename=meal_plan_{from_date}-{to_date}.ics'  # noqa: E501

    return response


@group_required('admin')
def get_backup(request):
    if not request.user.is_superuser:
        return HttpResponse('', status=403)


@group_required('user')
def ingredient_from_string(request):
    text = request.POST['text']

    ingredient_parser = IngredientParser(request, False)
    amount, unit, food, note = ingredient_parser.parse(text)

    return JsonResponse({'amount': amount, 'unit': unit, 'food': food, 'note': note}, status=200)
