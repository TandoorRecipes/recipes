import io
import json
import mimetypes
import re
import uuid
from collections import OrderedDict

import requests
import validators
from PIL import UnidentifiedImageError
from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.postgres.search import TrigramSimilarity
from django.core.exceptions import FieldError, ValidationError
from django.core.files import File
from django.db.models import (Case, Count, Exists, OuterRef, ProtectedError, Q,
                              Subquery, Value, When)
from django.db.models.fields.related import ForeignObjectRel
from django.db.models.functions import Coalesce, Lower
from django.http import FileResponse, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled
from icalendar import Calendar, Event
from requests.exceptions import MissingSchema
from rest_framework import decorators, status, viewsets
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.viewsets import ViewSetMixin
from treebeard.exceptions import InvalidMoveToDescendant, InvalidPosition, PathOverflow
from validators import ValidationFailure

from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.image_processing import handle_image
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.permission_helper import (CustomIsAdmin, CustomIsGuest, CustomIsOwner,
                                               CustomIsShare, CustomIsShared, CustomIsUser,
                                               group_required)
from cookbook.helper.recipe_html_import import get_recipe_from_source
from cookbook.helper.recipe_search import RecipeFacet, RecipeSearch, old_search
from cookbook.helper.shopping_helper import RecipeShoppingEditor, shopping_helper
from cookbook.models import (Automation, BookmarkletImport, CookLog, CustomFilter, ExportLog, Food,
                             FoodInheritField, ImportLog, Ingredient, Keyword, MealPlan, MealType,
                             Recipe, RecipeBook, RecipeBookEntry, ShareLink, ShoppingList,
                             ShoppingListEntry, ShoppingListRecipe, Step, Storage, Supermarket,
                             SupermarketCategory, SupermarketCategoryRelation, Sync, SyncLog, Unit,
                             UserFile, UserPreference, ViewLog)
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
from cookbook.provider.nextcloud import Nextcloud
from cookbook.schemas import FilterSchema, QueryParam, QueryParamAutoSchema, TreeSchema
from cookbook.serializer import (AutomationSerializer, BookmarkletImportSerializer,
                                 CookLogSerializer, CustomFilterSerializer, ExportLogSerializer,
                                 FoodInheritFieldSerializer, FoodSerializer,
                                 FoodShoppingUpdateSerializer, ImportLogSerializer,
                                 IngredientSerializer, KeywordSerializer, MealPlanSerializer,
                                 MealTypeSerializer, RecipeBookEntrySerializer,
                                 RecipeBookSerializer, RecipeImageSerializer,
                                 RecipeOverviewSerializer, RecipeSerializer,
                                 RecipeShoppingUpdateSerializer, RecipeSimpleSerializer,
                                 ShoppingListAutoSyncSerializer, ShoppingListEntrySerializer,
                                 ShoppingListRecipeSerializer, ShoppingListSerializer,
                                 StepSerializer, StorageSerializer,
                                 SupermarketCategoryRelationSerializer,
                                 SupermarketCategorySerializer, SupermarketSerializer,
                                 SyncLogSerializer, SyncSerializer, UnitSerializer,
                                 UserFileSerializer, UserNameSerializer, UserPreferenceSerializer,
                                 ViewLogSerializer, IngredientSimpleSerializer, BookmarkletImportListSerializer)
from recipes import settings


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
            recipe_count = Recipe.objects.filter(**{recipe_filter: OuterRef('id')}, space=space).values(
                recipe_filter).annotate(count=Count('pk')).values('count')
            queryset = queryset.annotate(recipe_count=Coalesce(Subquery(recipe_count), 0))

            # add a recipe image annotation to the query
            image_subquery = Recipe.objects.filter(**{recipe_filter: OuterRef('id')}, space=space).exclude(
                image__isnull=True).exclude(image__exact='').order_by("?").values('image')[:1]
            if tree:
                image_children_subquery = Recipe.objects.filter(
                    **{f"{recipe_filter}__path__startswith": OuterRef('path')},
                    space=space).exclude(image__isnull=True).exclude(image__exact='').order_by("?").values('image')[:1]
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
        fuzzy = self.request.user.searchpreference.lookup or any([self.model.__name__.lower() in x for x in
                                                                  self.request.user.searchpreference.trigram.values_list(
                                                                      'field', flat=True)])

        if query is not None and query not in ["''", '']:
            if fuzzy:
                if any([self.model.__name__.lower() in x for x in
                        self.request.user.searchpreference.unaccent.values_list('field', flat=True)]):
                    self.queryset = self.queryset.annotate(trigram=TrigramSimilarity('name__unaccent', query))
                else:
                    self.queryset = self.queryset.annotate(trigram=TrigramSimilarity('name', query))
                self.queryset = self.queryset.order_by('-trigram')
            else:
                # TODO have this check unaccent search settings or other search preferences?
                filter = Q(name__icontains=query)
                if any([self.model.__name__.lower() in x for x in
                        self.request.user.searchpreference.unaccent.values_list('field', flat=True)]):
                    filter |= Q(name__unaccent__icontains=query)

                self.queryset = (
                    self.queryset
                        .annotate(starts=Case(When(name__istartswith=query, then=(Value(100))),
                                              default=Value(0)))  # put exact matches at the top of the result set
                        .filter(filter).order_by('-starts', Lower('name').asc())
                )

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
                content = {'error': True,
                           'msg': _(f'An error occurred attempting to merge {source.name} with {target.name}')}
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
            return self.annotate_recipe(queryset=super().get_queryset(), request=self.request,
                                        serializer=self.serializer_class, tree=True)
        self.queryset = self.queryset.filter(space=self.request.space).order_by(Lower('name').asc())

        return self.annotate_recipe(queryset=self.queryset, request=self.request, serializer=self.serializer_class,
                                    tree=True)

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
        except (PathOverflow, InvalidMoveToDescendant, InvalidPosition) as e:
            content = {'error': True, 'msg': _('An error occurred attempting to move ') + child.name}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class UserNameViewSet(viewsets.ReadOnlyModelViewSet):
    """
    list:
    optional parameters

    - **filter_list**: array of user id's to get names for
    """
    queryset = User.objects
    serializer_class = UserNameSerializer
    permission_classes = [CustomIsGuest]
    http_method_names = ['get']

    def get_queryset(self):
        queryset = self.queryset.filter(userpreference__space=self.request.space)
        try:
            filter_list = self.request.query_params.get('filter_list', None)
            if filter_list is not None:
                queryset = queryset.filter(pk__in=json.loads(filter_list))
        except ValueError:
            raise APIException('Parameter filter_list incorrectly formatted')

        return queryset


class UserPreferenceViewSet(viewsets.ModelViewSet):
    queryset = UserPreference.objects
    serializer_class = UserPreferenceSerializer
    permission_classes = [CustomIsOwner, ]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class StorageViewSet(viewsets.ModelViewSet):
    # TODO handle delete protect error and adjust test
    queryset = Storage.objects
    serializer_class = StorageSerializer
    permission_classes = [CustomIsAdmin, ]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class SyncViewSet(viewsets.ModelViewSet):
    queryset = Sync.objects
    serializer_class = SyncSerializer
    permission_classes = [CustomIsAdmin, ]

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SyncLog.objects
    serializer_class = SyncLogSerializer
    permission_classes = [CustomIsAdmin, ]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(sync__space=self.request.space)


class SupermarketViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = Supermarket.objects
    serializer_class = SupermarketSerializer
    permission_classes = [CustomIsUser]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space)
        return super().get_queryset()


class SupermarketCategoryViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = SupermarketCategory.objects
    serializer_class = SupermarketCategorySerializer
    permission_classes = [CustomIsUser]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).order_by(Lower('name').asc())
        return super().get_queryset()


class SupermarketCategoryRelationViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = SupermarketCategoryRelation.objects
    serializer_class = SupermarketCategoryRelationSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination

    def get_queryset(self):
        self.queryset = self.queryset.filter(supermarket__space=self.request.space).order_by('order')
        return super().get_queryset()


class KeywordViewSet(viewsets.ModelViewSet, TreeMixin):
    queryset = Keyword.objects
    model = Keyword
    serializer_class = KeywordSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination


class UnitViewSet(viewsets.ModelViewSet, MergeMixin, FuzzyFilterMixin):
    queryset = Unit.objects
    model = Unit
    serializer_class = UnitSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination


class FoodInheritFieldViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FoodInheritField.objects
    serializer_class = FoodInheritFieldSerializer
    permission_classes = [CustomIsUser]

    def get_queryset(self):
        # exclude fields not yet implemented
        self.queryset = Food.inheritable_fields
        return super().get_queryset()


class FoodViewSet(viewsets.ModelViewSet, TreeMixin):
    queryset = Food.objects
    model = Food
    serializer_class = FoodSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination

    def get_queryset(self):
        self.request._shared_users = [x.id for x in list(self.request.user.get_shopping_share())] + [
            self.request.user.id]

        self.queryset = super().get_queryset()
        shopping_status = ShoppingListEntry.objects.filter(space=self.request.space, food=OuterRef('id'),
                                                           checked=False).values('id')
        # onhand_status = self.queryset.annotate(onhand_status=Exists(onhand_users_set__in=[shared_users]))
        return self.queryset.annotate(shopping_status=Exists(shopping_status)).prefetch_related('onhand_users',
                                                                                                'inherit_fields').select_related(
            'recipe', 'supermarket_category')

    @decorators.action(detail=True, methods=['PUT'], serializer_class=FoodShoppingUpdateSerializer, )
    # TODO DRF only allows one action in a decorator action without overriding get_operation_id_base() this should be PUT and DELETE probably
    def shopping(self, request, pk):
        if self.request.space.demo:
            raise PermissionDenied(detail='Not available in demo', code=None)
        obj = self.get_object()
        shared_users = list(self.request.user.get_shopping_share())
        shared_users.append(request.user)
        if request.data.get('_delete', False) == 'true':
            ShoppingListEntry.objects.filter(food=obj, checked=False, space=request.space,
                                             created_by__in=shared_users).delete()
            content = {'msg': _(f'{obj.name} was removed from the shopping list.')}
            return Response(content, status=status.HTTP_204_NO_CONTENT)

        amount = request.data.get('amount', 1)
        unit = request.data.get('unit', None)
        content = {'msg': _(f'{obj.name} was added to the shopping list.')}

        ShoppingListEntry.objects.create(food=obj, amount=amount, unit=unit, space=request.space,
                                         created_by=request.user)
        return Response(content, status=status.HTTP_204_NO_CONTENT)

    def destroy(self, *args, **kwargs):
        try:
            return (super().destroy(self, *args, **kwargs))
        except ProtectedError as e:
            content = {'error': True, 'msg': e.args[0]}
            return Response(content, status=status.HTTP_403_FORBIDDEN)


class RecipeBookViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = RecipeBook.objects
    serializer_class = RecipeBookSerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        self.queryset = self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).filter(
            space=self.request.space).distinct()
        return super().get_queryset()


class RecipeBookEntryViewSet(viewsets.ModelViewSet, viewsets.GenericViewSet):
    """
        list:
        optional parameters

        - **recipe**: id of recipe - only return books for that recipe
        - **book**: id of book - only return recipes in that book

    """
    queryset = RecipeBookEntry.objects
    serializer_class = RecipeBookEntrySerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        queryset = self.queryset.filter(
            Q(book__created_by=self.request.user) | Q(book__shared=self.request.user)).filter(
            book__space=self.request.space).distinct()

        recipe_id = self.request.query_params.get('recipe', None)
        if recipe_id is not None:
            queryset = queryset.filter(recipe__pk=recipe_id)

        book_id = self.request.query_params.get('book', None)
        if book_id is not None:
            queryset = queryset.filter(book__pk=book_id)
        return queryset


class MealPlanViewSet(viewsets.ModelViewSet):
    """
    list:
    optional parameters

    - **from_date**: filter from (inclusive) a certain date onward
    - **to_date**: filter upward to (inclusive) certain date

    """
    queryset = MealPlan.objects
    serializer_class = MealPlanSerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        queryset = self.queryset.filter(
            Q(created_by=self.request.user)
            | Q(shared=self.request.user)
        ).filter(space=self.request.space).distinct().all()

        from_date = self.request.query_params.get('from_date', None)
        if from_date is not None:
            queryset = queryset.filter(date__gte=from_date)

        to_date = self.request.query_params.get('to_date', None)
        if to_date is not None:
            queryset = queryset.filter(date__lte=to_date)
        return queryset


class MealTypeViewSet(viewsets.ModelViewSet):
    """
    returns list of meal types created by the
    requesting user ordered by the order field.
    """
    queryset = MealType.objects
    serializer_class = MealTypeSerializer
    permission_classes = [CustomIsOwner]

    def get_queryset(self):
        queryset = self.queryset.order_by('order', 'id').filter(created_by=self.request.user).filter(
            space=self.request.space).all()
        return queryset


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects
    serializer_class = IngredientSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination

    def get_serializer_class(self):
        if self.request and self.request.query_params.get('simple', False):
            return IngredientSimpleSerializer
        return IngredientSerializer

    def get_queryset(self):
        queryset = self.queryset.filter(step__recipe__space=self.request.space)
        food = self.request.query_params.get('food', None)
        if food and re.match(r'^(\d)+$', food):
            queryset = queryset.filter(food_id=food)

        unit = self.request.query_params.get('unit', None)
        if unit and re.match(r'^(\d)+$', unit):
            queryset = queryset.filter(unit_id=unit)

        return queryset


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects
    serializer_class = StepSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination
    query_params = [
        QueryParam(name='recipe', description=_('ID of recipe a step is part of. For multiple repeat parameter.'),
                   qtype='int'),
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
        self.facets = RecipeFacet(request, queryset=queryset)
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data),
            ('facets', self.facets.get_facets(from_cache=True))
        ]))


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects
    serializer_class = RecipeSerializer
    # TODO split read and write permission for meal plan guest
    permission_classes = [CustomIsShare | CustomIsGuest]
    pagination_class = RecipePagination

    query_params = [
        QueryParam(name='query', description=_(
            'Query string matched (fuzzy) against recipe name. In the future also fulltext search.')),
        QueryParam(name='keywords', description=_(
            'ID of keyword a recipe should have. For multiple repeat parameter. Equivalent to keywords_or'),
                   qtype='int'),
        QueryParam(name='keywords_or',
                   description=_('Keyword IDs, repeat for multiple. Return recipes with any of the keywords'),
                   qtype='int'),
        QueryParam(name='keywords_and',
                   description=_('Keyword IDs, repeat for multiple. Return recipes with all of the keywords.'),
                   qtype='int'),
        QueryParam(name='keywords_or_not',
                   description=_('Keyword IDs, repeat for multiple. Exclude recipes with any of the keywords.'),
                   qtype='int'),
        QueryParam(name='keywords_and_not',
                   description=_('Keyword IDs, repeat for multiple. Exclude recipes with all of the keywords.'),
                   qtype='int'),
        QueryParam(name='foods', description=_('ID of food a recipe should have. For multiple repeat parameter.'),
                   qtype='int'),
        QueryParam(name='foods_or',
                   description=_('Food IDs, repeat for multiple. Return recipes with any of the foods'), qtype='int'),
        QueryParam(name='foods_and',
                   description=_('Food IDs, repeat for multiple. Return recipes with all of the foods.'), qtype='int'),
        QueryParam(name='foods_or_not',
                   description=_('Food IDs, repeat for multiple. Exclude recipes with any of the foods.'), qtype='int'),
        QueryParam(name='foods_and_not',
                   description=_('Food IDs, repeat for multiple. Exclude recipes with all of the foods.'), qtype='int'),
        QueryParam(name='units', description=_('ID of unit a recipe should have.'), qtype='int'),
        QueryParam(name='rating', description=_(
            'Rating a recipe should have or greater. [0 - 5] Negative value filters rating less than.'), qtype='int'),
        QueryParam(name='books', description=_('ID of book a recipe should be in. For multiple repeat parameter.')),
        QueryParam(name='books_or',
                   description=_('Book IDs, repeat for multiple. Return recipes with any of the books'), qtype='int'),
        QueryParam(name='books_and',
                   description=_('Book IDs, repeat for multiple. Return recipes with all of the books.'), qtype='int'),
        QueryParam(name='books_or_not',
                   description=_('Book IDs, repeat for multiple. Exclude recipes with any of the books.'), qtype='int'),
        QueryParam(name='books_and_not',
                   description=_('Book IDs, repeat for multiple. Exclude recipes with all of the books.'), qtype='int'),
        QueryParam(name='internal',
                   description=_('If only internal recipes should be returned. [''true''/''<b>false</b>'']')),
        QueryParam(name='random',
                   description=_('Returns the results in randomized order. [''true''/''<b>false</b>'']')),
        QueryParam(name='new',
                   description=_('Returns new results first in search results. [''true''/''<b>false</b>'']')),
        QueryParam(name='timescooked', description=_(
            'Filter recipes cooked X times or more.  Negative values returns cooked less than X times'), qtype='int'),
        QueryParam(name='cookedon', description=_(
            'Filter recipes last cooked on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='createdon', description=_(
            'Filter recipes created on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='updatedon', description=_(
            'Filter recipes updated on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='viewedon', description=_(
            'Filter recipes lasts viewed on or after YYYY-MM-DD. Prepending ''-'' filters on or before date.')),
        QueryParam(name='makenow',
                   description=_('Filter recipes that can be made with OnHand food. [''true''/''<b>false</b>'']')),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        share = self.request.query_params.get('share', None)

        if self.detail:
            if not share:
                self.queryset = self.queryset.filter(space=self.request.space)
            return super().get_queryset()

        if not (share and self.detail):
            self.queryset = self.queryset.filter(space=self.request.space)

        params = {x: self.request.GET.get(x) if len({**self.request.GET}[x]) == 1 else self.request.GET.getlist(x) for x
                  in list(self.request.GET)}
        search = RecipeSearch(self.request, **params)
        self.queryset = search.get_queryset(self.queryset).prefetch_related('cooklog_set')
        return self.queryset

    def list(self, request, *args, **kwargs):
        if self.request.GET.get('debug', False):
            return JsonResponse({
                'new': str(self.get_queryset().query),
                'old': str(old_search(request).query)
            })
        return super().list(request, *args, **kwargs)

    # TODO write extensive tests for permissions

    def get_serializer_class(self):
        if self.action == 'list':
            return RecipeOverviewSerializer
        return self.serializer_class

    @decorators.action(
        detail=True,
        methods=['PUT'],
        serializer_class=RecipeImageSerializer,
        parser_classes=[MultiPartParser],
    )
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
                    if validators.url(url, public=True):
                        response = requests.get(url)
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
                obj.image = File(img, name=f'{uuid.uuid4()}_{obj.pk}{filetype}')
                obj.save()
                return Response(serializer.data)

        return Response(serializer.errors, 400)

    # TODO: refactor API to use post/put/delete or leave as put and change VUE to use list_recipe after creating
    # DRF only allows one action in a decorator action without overriding get_operation_id_base()
    @decorators.action(
        detail=True,
        methods=['PUT'],
        serializer_class=RecipeShoppingUpdateSerializer,
    )
    def shopping(self, request, pk):
        if self.request.space.demo:
            raise PermissionDenied(detail='Not available in demo', code=None)
        obj = self.get_object()
        ingredients = request.data.get('ingredients', None)
        servings = request.data.get('servings', None)
        list_recipe = request.data.get('list_recipe', None)
        mealplan = request.data.get('mealplan', None)
        SLR = RecipeShoppingEditor(request.user, request.space, id=list_recipe, recipe=obj, mealplan=mealplan)

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

    @decorators.action(
        detail=True,
        methods=['GET'],
        serializer_class=RecipeSimpleSerializer
    )
    def related(self, request, pk):
        obj = self.get_object()
        if obj.get_space() != request.space:
            raise PermissionDenied(detail='You do not have the required permission to perform this action', code=403)
        try:
            levels = int(request.query_params.get('levels', 1))
        except (ValueError, TypeError):
            levels = 1
        qs = obj.get_related_recipes(
            levels=levels)  # TODO: make levels a user setting, included in request data?, keep solely in the backend?
        return Response(self.serializer_class(qs, many=True).data)


class ShoppingListRecipeViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListRecipe.objects
    serializer_class = ShoppingListRecipeSerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        self.queryset = self.queryset.filter(
            Q(shoppinglist__space=self.request.space) | Q(entries__space=self.request.space))
        return self.queryset.filter(
            Q(shoppinglist__created_by=self.request.user)
            | Q(shoppinglist__shared=self.request.user)
            | Q(entries__created_by=self.request.user)
            | Q(entries__created_by__in=list(self.request.user.get_shopping_share()))
        ).distinct().all()


class ShoppingListEntryViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListEntry.objects
    serializer_class = ShoppingListEntrySerializer
    permission_classes = [CustomIsOwner | CustomIsShared]
    query_params = [
        QueryParam(name='id',
                   description=_('Returns the shopping list entry with a primary key of id.  Multiple values allowed.'),
                   qtype='int'),
        QueryParam(
            name='checked',
            description=_(
                'Filter shopping list entries on checked.  [''true'', ''false'', ''both'', ''<b>recent</b>'']<br>  - ''recent'' includes unchecked items and recently completed items.')
        ),
        QueryParam(name='supermarket',
                   description=_('Returns the shopping list entries sorted by supermarket category order.'),
                   qtype='int'),
    ]
    schema = QueryParamAutoSchema()

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space)

        self.queryset = self.queryset.filter(
            Q(created_by=self.request.user)
            | Q(shoppinglist__shared=self.request.user)
            | Q(created_by__in=list(self.request.user.get_shopping_share()))
        ).distinct().all()

        if pk := self.request.query_params.getlist('id', []):
            self.queryset = self.queryset.filter(food__id__in=[int(i) for i in pk])

        if 'checked' in self.request.query_params or 'recent' in self.request.query_params:
            return shopping_helper(self.queryset, self.request)

        # TODO once old shopping list is removed this needs updated to sharing users in preferences
        return self.queryset


# TODO deprecate
class ShoppingListViewSet(viewsets.ModelViewSet):
    queryset = ShoppingList.objects
    serializer_class = ShoppingListSerializer
    permission_classes = [CustomIsOwner | CustomIsShared]

    def get_queryset(self):
        return self.queryset.filter(
            Q(created_by=self.request.user)
            | Q(shared=self.request.user)
            | Q(created_by__in=list(self.request.user.get_shopping_share()))
        ).filter(space=self.request.space).distinct()

    def get_serializer_class(self):
        try:
            autosync = self.request.query_params.get('autosync', False)
            if autosync:
                return ShoppingListAutoSyncSerializer
        except AttributeError:  # Needed for the openapi schema to determine a serializer without a request
            pass
        return self.serializer_class


class ViewLogViewSet(viewsets.ModelViewSet):
    queryset = ViewLog.objects
    serializer_class = ViewLogSerializer
    permission_classes = [CustomIsOwner]
    pagination_class = DefaultPagination

    def get_queryset(self):
        # working backwards from the test - this is supposed to be limited to user view logs only??
        return self.queryset.filter(created_by=self.request.user).filter(space=self.request.space)


class CookLogViewSet(viewsets.ModelViewSet):
    queryset = CookLog.objects
    serializer_class = CookLogSerializer
    permission_classes = [CustomIsOwner]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class ImportLogViewSet(viewsets.ModelViewSet):
    queryset = ImportLog.objects
    serializer_class = ImportLogSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class ExportLogViewSet(viewsets.ModelViewSet):
    queryset = ExportLog.objects
    serializer_class = ExportLogSerializer
    permission_classes = [CustomIsUser]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space)


class BookmarkletImportViewSet(viewsets.ModelViewSet):
    queryset = BookmarkletImport.objects
    serializer_class = BookmarkletImportSerializer
    permission_classes = [CustomIsUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return BookmarkletImportListSerializer
        return self.serializer_class

    def get_queryset(self):
        return self.queryset.filter(space=self.request.space).all()


class UserFileViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = UserFile.objects
    serializer_class = UserFileSerializer
    permission_classes = [CustomIsUser]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).all()
        return super().get_queryset()


class AutomationViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = Automation.objects
    serializer_class = AutomationSerializer
    permission_classes = [CustomIsUser]

    def get_queryset(self):
        self.queryset = self.queryset.filter(space=self.request.space).all()
        return super().get_queryset()


class CustomFilterViewSet(viewsets.ModelViewSet, StandardFilterMixin):
    queryset = CustomFilter.objects
    serializer_class = CustomFilterSerializer
    permission_classes = [CustomIsOwner]

    def get_queryset(self):
        self.queryset = self.queryset.filter(Q(created_by=self.request.user) | Q(shared=self.request.user)).filter(
            space=self.request.space).distinct()
        return super().get_queryset()


# -------------- non django rest api views --------------------


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
        messages.add_message(request, messages.ERROR,
                             _('This feature is not yet available in the hosted version of tandoor!'))
        return redirect('index')

    monitors = Sync.objects.filter(active=True).filter(space=request.user.userpreference.space)

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
        messages.add_message(
            request, messages.SUCCESS, _('Sync successful!')
        )
        return redirect('list_recipe_import')
    else:
        messages.add_message(
            request, messages.ERROR, _('Error synchronizing with Storage')
        )
        return redirect('list_recipe_import')


@group_required('user')
def share_link(request, pk):
    if request.space.allow_sharing:
        recipe = get_object_or_404(Recipe, pk=pk, space=request.space)
        link = ShareLink.objects.create(recipe=recipe, created_by=request.user, space=request.space)
        return JsonResponse({'pk': pk, 'share': link.uuid,
                             'link': request.build_absolute_uri(reverse('view_recipe', args=[pk, link.uuid]))})
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


@group_required('user')
def get_plan_ical(request, from_date, to_date):
    queryset = MealPlan.objects.filter(
        Q(created_by=request.user) | Q(shared=request.user)
    ).filter(space=request.user.userpreference.space).distinct().all()

    if from_date is not None:
        queryset = queryset.filter(date__gte=from_date)

    if to_date is not None:
        queryset = queryset.filter(date__lte=to_date)

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
    response["Content-Disposition"] = f'attachment; filename=meal_plan_{from_date}-{to_date}.ics'  # noqa: E501

    return response


@group_required('user')
def recipe_from_source(request):
    """
    function to retrieve a recipe from a given url or source string
    :param request: standard request with additional post parameters
            - url: url to use for importing recipe
            - data: if no url is given recipe is imported from provided source data
            - (optional) bookmarklet: id of bookmarklet import to use, overrides URL and data attributes
    :return: JsonResponse containing the parsed json, original html,json and images
    """
    if request.method == 'GET':
        return HttpResponse(status=405)
    request_payload = json.loads(request.body.decode('utf-8'))
    url = request_payload.get('url', None)
    data = request_payload.get('data', None)
    bookmarklet = request_payload.get('bookmarklet', None)

    if bookmarklet := BookmarkletImport.objects.filter(pk=bookmarklet).first():
        url = bookmarklet.url
        data = bookmarklet.html
        bookmarklet.delete()

    # headers to use for request to external sites
    external_request_headers = {"User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7"}

    if not url and not data:
        return JsonResponse({
            'error': True,
            'msg': _('Nothing to do.')
        }, status=400)

    # in manual mode request complete page to return it later
    if url:
        try:
            if validators.url(url, public=True):
                data = requests.get(url, headers=external_request_headers).content
            else:
                return JsonResponse({
                    'error': True,
                    'msg': _('Invalid Url')
                }, status=400)
        except requests.exceptions.ConnectionError:
            return JsonResponse({
                'error': True,
                'msg': _('Connection Refused.')
            }, status=400)
        except requests.exceptions.MissingSchema:
            return JsonResponse({
                'error': True,
                'msg': _('Bad URL Schema.')
            }, status=400)

    recipe_json, recipe_tree, recipe_html, recipe_images = get_recipe_from_source(data, url, request)
    if len(recipe_tree) == 0 and len(recipe_json) == 0:
        return JsonResponse({
            'error': True,
            'msg': _('No usable data could be found.')
        }, status=400)
    else:
        return JsonResponse({
            'recipe_json': recipe_json,
            'recipe_tree': recipe_tree,
            'recipe_html': recipe_html,
            'recipe_images': list(dict.fromkeys(recipe_images)),
        })


@group_required('admin')
def get_backup(request):
    if not request.user.is_superuser:
        return HttpResponse('', status=403)


@group_required('user')
def ingredient_from_string(request):
    text = request.POST['text']

    ingredient_parser = IngredientParser(request, False)
    amount, unit, food, note = ingredient_parser.parse(text)

    return JsonResponse(
        {
            'amount': amount,
            'unit': unit,
            'food': food,
            'note': note
        },
        status=200
    )


@group_required('user')
def get_facets(request):
    key = request.GET.get('hash', None)
    food = request.GET.get('food', None)
    keyword = request.GET.get('keyword', None)
    facets = RecipeFacet(request, hash_key=key)

    if food:
        results = facets.add_food_children(food)
    elif keyword:
        results = facets.add_keyword_children(keyword)
    else:
        results = facets.get_facets()

    return JsonResponse(
        {
            'facets': results,
        },
        status=200
    )
