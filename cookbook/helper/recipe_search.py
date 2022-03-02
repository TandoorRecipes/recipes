import json
from collections import Counter
from datetime import date, timedelta

from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector, TrigramSimilarity
from django.core.cache import caches
from django.db.models import Avg, Case, Count, F, Func, Max, OuterRef, Q, Subquery, Sum, Value, When
from django.db.models.functions import Coalesce, Lower, Substr
from django.utils import timezone, translation
from django.utils.translation import gettext as _

from cookbook.filters import RecipeFilter
from cookbook.helper.HelperFunctions import Round, str2bool
from cookbook.helper.permission_helper import has_group_permission
from cookbook.managers import DICTIONARY
from cookbook.models import (CookLog, CustomFilter, Food, Keyword, Recipe, RecipeBook, SearchFields,
                             SearchPreference, ViewLog)
from recipes import settings


# TODO create extensive tests to make sure ORs ANDs and various filters, sorting, etc work as expected
# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch():
    _postgres = settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']

    def __init__(self, request,  **params):
        self._request = request
        self._queryset = None
        if f := params.get('filter', None):
            custom_filter = CustomFilter.objects.filter(id=f, space=self._request.space).filter(Q(created_by=self._request.user) |
                                                                                                Q(shared=self._request.user) | Q(recipebook__shared=self._request.user)).first()
            if custom_filter:
                self._params = {**json.loads(custom_filter.search)}
                self._original_params = {**(params or {})}
            else:
                self._params = {**(params or {})}
        else:
            self._params = {**(params or {})}
        if self._request.user.is_authenticated:
            self._search_prefs = request.user.searchpreference
        else:
            self._search_prefs = SearchPreference()
        self._string = self._params.get('query').strip() if self._params.get('query', None) else None
        self._rating = self._params.get('rating', None)
        self._keywords = {
            'or': self._params.get('keywords_or', None) or self._params.get('keywords', None),
            'and': self._params.get('keywords_and', None),
            'or_not': self._params.get('keywords_or_not', None),
            'and_not': self._params.get('keywords_and_not', None)
        }
        self._foods = {
            'or': self._params.get('foods_or', None) or self._params.get('foods', None),
            'and': self._params.get('foods_and', None),
            'or_not': self._params.get('foods_or_not', None),
            'and_not': self._params.get('foods_and_not', None)
        }
        self._books = {
            'or': self._params.get('books_or', None) or self._params.get('books', None),
            'and': self._params.get('books_and', None),
            'or_not': self._params.get('books_or_not', None),
            'and_not': self._params.get('books_and_not', None)
        }
        self._steps = self._params.get('steps', None)
        self._units = self._params.get('units', None)
        # TODO add created by
        # TODO image exists
        self._sort_order = self._params.get('sort_order', None)
        self._internal = str2bool(self._params.get('internal', None))
        self._random = str2bool(self._params.get('random', False))
        self._new = str2bool(self._params.get('new', False))
        self._num_recent = int(self._params.get('num_recent', 0))
        self._include_children = str2bool(self._params.get('include_children', None))
        self._timescooked = self._params.get('timescooked', None)
        self._cookedon = self._params.get('cookedon', None)
        self._createdon = self._params.get('createdon', None)
        self._updatedon = self._params.get('updatedon', None)
        self._viewedon = self._params.get('viewedon', None)
        self._makenow = self._params.get('makenow', None)
        # this supports hidden feature to find recipes missing X ingredients
        if type(self._makenow) == bool and self._makenow == True:
            self._makenow = 0
        elif type(self._makenow) == str and self._makenow in ["yes", "true"]:
            self._makenow = 0
        else:
            try:
                self._makenow = int(self._makenow)
            except (ValueError, TypeError):
                self._makenow = None

        self._search_type = self._search_prefs.search or 'plain'
        if self._string:
            if self._postgres:
                self._unaccent_include = self._search_prefs.unaccent.values_list('field', flat=True)
            else:
                self._unaccent_include = []
            self._icontains_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.icontains.values_list('field', flat=True)]
            self._istartswith_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.istartswith.values_list('field', flat=True)]
            self._trigram_include = None
            self._fulltext_include = None
        self._trigram = False
        if self._postgres and self._string:
            self._language = DICTIONARY.get(translation.get_language(), 'simple')
            self._trigram_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.trigram.values_list('field', flat=True)]
            self._fulltext_include = self._search_prefs.fulltext.values_list('field', flat=True) or None

            if self._search_type not in ['websearch', 'raw'] and self._trigram_include:
                self._trigram = True
            self.search_query = SearchQuery(
                self._string,
                search_type=self._search_type,
                config=self._language,
            )
            self.search_rank = None
        self.orderby = []
        self._default_sort = ['-favorite']  # TODO add user setting
        self._filters = None
        self._fuzzy_match = None

    def get_queryset(self, queryset):
        self._queryset = queryset
        self._build_sort_order()
        self._recently_viewed(num_recent=self._num_recent)
        self._cooked_on_filter(cooked_date=self._cookedon)
        self._created_on_filter(created_date=self._createdon)
        self._updated_on_filter(updated_date=self._updatedon)
        self._viewed_on_filter(viewed_date=self._viewedon)
        self._favorite_recipes(timescooked=self._timescooked)
        self._new_recipes()
        self.keyword_filters(**self._keywords)
        self.food_filters(**self._foods)
        self.book_filters(**self._books)
        self.rating_filter(rating=self._rating)
        self.internal_filter(internal=self._internal)
        self.step_filters(steps=self._steps)
        self.unit_filters(units=self._units)
        self._makenow_filter(missing=self._makenow)
        self.string_filters(string=self._string)
        return self._queryset.filter(space=self._request.space).distinct().order_by(*self.orderby)

    def _sort_includes(self, *args):
        for x in args:
            if x in self.orderby:
                return True
            elif '-' + x in self.orderby:
                return True
        return False

    def _build_sort_order(self):
        if self._random:
            self._queryset = self._queryset.order_by("?")
        else:
            order = []
            # TODO add userpreference for default sort order and replace '-favorite'
            default_order = ['-favorite']
            # recent and new_recipe are always first; they float a few recipes to the top
            if self._num_recent:
                order += ['-recent']
            if self._new:
                order += ['-new_recipe']

            # if a sort order is provided by user - use that order
            if self._sort_order:

                if not isinstance(self._sort_order, list):
                    order += [self._sort_order]
                else:
                    order += self._sort_order
                if not self._postgres or not self._string:
                    if 'score' in order:
                        order.remove('score')
                    if '-score' in order:
                        order.remove('-score')
            # if no sort order provided prioritize text search, followed by the default search
            elif self._postgres and self._string and (self._trigram or self._fulltext_include):
                order += ['-score', *default_order]
            # otherwise sort by the remaining order_by attributes or favorite by default
            else:
                order += default_order
            order[:] = [Lower('name').asc() if x == 'name' else x for x in order]
            order[:] = [Lower('name').desc() if x == '-name' else x for x in order]
            self.orderby = order

    def string_filters(self, string=None):
        if not string:
            return

        self.build_text_filters(self._string)
        if self._postgres:
            self.build_fulltext_filters(self._string)
            self.build_trigram(self._string)

        query_filter = Q()
        if self._filters:
            for f in self._filters:
                query_filter |= f

            self._queryset = self._queryset.filter(query_filter).distinct()  # this creates duplicate records which can screw up other aggregates, see makenow for workaround
            if self._fulltext_include:
                if self._fuzzy_match is None:
                    self._queryset = self._queryset.annotate(score=Coalesce(Max(self.search_rank), 0.0))
                else:
                    self._queryset = self._queryset.annotate(rank=Coalesce(Max(self.search_rank), 0.0))

            if self._fuzzy_match is not None:
                simularity = self._fuzzy_match.filter(pk=OuterRef('pk')).values('simularity')
                if not self._fulltext_include:
                    self._queryset = self._queryset.annotate(score=Coalesce(Subquery(simularity), 0.0))
                else:
                    self._queryset = self._queryset.annotate(simularity=Coalesce(Subquery(simularity), 0.0))
            if self._sort_includes('score') and self._fulltext_include and self._fuzzy_match is not None:
                self._queryset = self._queryset.annotate(score=F('rank')+F('simularity'))
        else:
            query_filter = Q()
            for f in [x + '__unaccent__iexact' if x in self._unaccent_include else x + '__iexact' for x in SearchFields.objects.all().values_list('field', flat=True)]:
                query_filter |= Q(**{"%s" % f: self._string})
            self._queryset = self._queryset.filter(query_filter).distinct()

    def _cooked_on_filter(self, cooked_date=None):
        if self._sort_includes('lastcooked') or cooked_date:
            lessthan = self._sort_includes('-lastcooked') or '-' in (cooked_date or [])[:1]
            if lessthan:
                default = timezone.now() - timedelta(days=100000)
            else:
                default = timezone.now()
            self._queryset = self._queryset.annotate(lastcooked=Coalesce(
                Max(Case(When(cooklog__created_by=self._request.user, cooklog__space=self._request.space, then='cooklog__created_at'))), Value(default)))
        if cooked_date is None:
            return

        cooked_date = date(*[int(x) for x in cooked_date.split('-') if x != ''])

        if lessthan:
            self._queryset = self._queryset.filter(lastcooked__date__lte=cooked_date).exclude(lastcooked=default)
        else:
            self._queryset = self._queryset.filter(lastcooked__date__gte=cooked_date).exclude(lastcooked=default)

    def _created_on_filter(self, created_date=None):
        if created_date is None:
            return
        lessthan = '-' in created_date[:1]
        created_date = date(*[int(x) for x in created_date.split('-') if x != ''])
        if lessthan:
            self._queryset = self._queryset.filter(created_at__date__lte=created_date)
        else:
            self._queryset = self._queryset.filter(created_at__date__gte=created_date)

    def _updated_on_filter(self, updated_date=None):
        if updated_date is None:
            return
        lessthan = '-' in updated_date[:1]
        updated_date = date(*[int(x) for x in updated_date.split('-') if x != ''])
        if lessthan:
            self._queryset = self._queryset.filter(updated_at__date__lte=updated_date)
        else:
            self._queryset = self._queryset.filter(updated_at__date__gte=updated_date)

    def _viewed_on_filter(self, viewed_date=None):
        if self._sort_includes('lastviewed') or viewed_date:
            longTimeAgo = timezone.now() - timedelta(days=100000)
            self._queryset = self._queryset.annotate(lastviewed=Coalesce(
                Max(Case(When(viewlog__created_by=self._request.user, viewlog__space=self._request.space, then='viewlog__created_at'))), Value(longTimeAgo)))
        if viewed_date is None:
            return
        lessthan = '-' in viewed_date[:1]
        viewed_date = date(*[int(x) for x in viewed_date.split('-') if x != ''])

        if lessthan:
            self._queryset = self._queryset.filter(lastviewed__date__lte=viewed_date).exclude(lastviewed=longTimeAgo)
        else:
            self._queryset = self._queryset.filter(lastviewed__date__gte=viewed_date).exclude(lastviewed=longTimeAgo)

    def _new_recipes(self, new_days=7):
        # TODO make new days a user-setting
        if not self._new:
            return
        self._queryset = (
            self._queryset.annotate(new_recipe=Case(
                When(created_at__gte=(timezone.now() - timedelta(days=new_days)), then=('pk')), default=Value(0), ))
        )

    def _recently_viewed(self, num_recent=None):
        if not num_recent:
            if self._sort_includes('lastviewed'):
                self._queryset = self._queryset.annotate(lastviewed=Coalesce(
                    Max(Case(When(viewlog__created_by=self._request.user, viewlog__space=self._request.space, then='viewlog__pk'))), Value(0)))
            return

        num_recent_recipes = ViewLog.objects.filter(created_by=self._request.user, space=self._request.space).values(
            'recipe').annotate(recent=Max('created_at')).order_by('-recent')[:num_recent]
        self._queryset = self._queryset.annotate(recent=Coalesce(Max(Case(When(pk__in=num_recent_recipes.values('recipe'), then='viewlog__pk'))), Value(0)))

    def _favorite_recipes(self, timescooked=None):
        if self._sort_includes('favorite') or timescooked:
            lessthan = '-' in (timescooked or []) or not self._sort_includes('-favorite')
            if lessthan:
                default = 1000
            else:
                default = 0
            favorite_recipes = CookLog.objects.filter(created_by=self._request.user, space=self._request.space, recipe=OuterRef('pk')
                                                      ).values('recipe').annotate(count=Count('pk', distinct=True)).values('count')
            self._queryset = self._queryset.annotate(favorite=Coalesce(Subquery(favorite_recipes), default))
        if timescooked is None:
            return

        if timescooked == '0':
            self._queryset = self._queryset.filter(favorite=0)
        elif lessthan:
            self._queryset = self._queryset.filter(favorite__lte=int(timescooked[1:])).exclude(favorite=0)
        else:
            self._queryset = self._queryset.filter(favorite__gte=int(timescooked))

    def keyword_filters(self, **kwargs):
        if all([kwargs[x] is None for x in kwargs]):
            return
        for kw_filter in kwargs:
            if not kwargs[kw_filter]:
                continue
            if not isinstance(kwargs[kw_filter], list):
                kwargs[kw_filter] = [kwargs[kw_filter]]

            keywords = Keyword.objects.filter(pk__in=kwargs[kw_filter])
            if 'or' in kw_filter:
                if self._include_children:
                    f_or = Q(keywords__in=Keyword.include_descendants(keywords))
                else:
                    f_or = Q(keywords__in=keywords)
                if 'not' in kw_filter:
                    self._queryset = self._queryset.exclude(f_or)
                else:
                    self._queryset = self._queryset.filter(f_or)
            elif 'and' in kw_filter:
                recipes = Recipe.objects.all()
                for kw in keywords:
                    if self._include_children:
                        f_and = Q(keywords__in=kw.get_descendants_and_self())
                    else:
                        f_and = Q(keywords=kw)
                    if 'not' in kw_filter:
                        recipes = recipes.filter(f_and)
                    else:
                        self._queryset = self._queryset.filter(f_and)
                if 'not' in kw_filter:
                    self._queryset = self._queryset.exclude(id__in=recipes.values('id'))

    def food_filters(self, **kwargs):
        if all([kwargs[x] is None for x in kwargs]):
            return
        for fd_filter in kwargs:
            if not kwargs[fd_filter]:
                continue
            if not isinstance(kwargs[fd_filter], list):
                kwargs[fd_filter] = [kwargs[fd_filter]]

            foods = Food.objects.filter(pk__in=kwargs[fd_filter])
            if 'or' in fd_filter:
                if self._include_children:
                    f_or = Q(steps__ingredients__food__in=Food.include_descendants(foods))
                else:
                    f_or = Q(steps__ingredients__food__in=foods)

                if 'not' in fd_filter:
                    self._queryset = self._queryset.exclude(f_or)
                else:
                    self._queryset = self._queryset.filter(f_or)
            elif 'and' in fd_filter:
                recipes = Recipe.objects.all()
                for food in foods:
                    if self._include_children:
                        f_and = Q(steps__ingredients__food__in=food.get_descendants_and_self())
                    else:
                        f_and = Q(steps__ingredients__food=food)
                    if 'not' in fd_filter:
                        recipes = recipes.filter(f_and)
                    else:
                        self._queryset = self._queryset.filter(f_and)
                if 'not' in fd_filter:
                    self._queryset = self._queryset.exclude(id__in=recipes.values('id'))

    def unit_filters(self, units=None, operator=True):
        if operator != True:
            raise NotImplementedError
        if not units:
            return
        if not isinstance(units, list):
            units = [units]
        self._queryset = self._queryset.filter(steps__ingredients__unit__in=units)

    def rating_filter(self, rating=None):
        if rating or self._sort_includes('rating'):
            lessthan = self._sort_includes('-rating') or '-' in (rating or [])
            if lessthan:
                default = 100
            else:
                default = 0
            # TODO make ratings a settings user-only vs all-users
            self._queryset = self._queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=self._request.user, then='cooklog__rating'), default=default))))
        if rating is None:
            return

        if rating == '0':
            self._queryset = self._queryset.filter(rating=0)
        elif lessthan:
            self._queryset = self._queryset.filter(rating__lte=int(rating[1:])).exclude(rating=0)
        else:
            self._queryset = self._queryset.filter(rating__gte=int(rating))

    def internal_filter(self, internal=None):
        if not internal:
            return
        self._queryset = self._queryset.filter(internal=internal)

    def book_filters(self, **kwargs):
        if all([kwargs[x] is None for x in kwargs]):
            return
        for bk_filter in kwargs:
            if not kwargs[bk_filter]:
                continue
            if not isinstance(kwargs[bk_filter], list):
                kwargs[bk_filter] = [kwargs[bk_filter]]

            if 'or' in bk_filter:
                f = Q(recipebookentry__book__id__in=kwargs[bk_filter])
                if 'not' in bk_filter:
                    self._queryset = self._queryset.exclude(f)
                else:
                    self._queryset = self._queryset.filter(f)
            elif 'and' in bk_filter:
                recipes = Recipe.objects.all()
                for book in kwargs[bk_filter]:
                    if 'not' in bk_filter:
                        recipes = recipes.filter(recipebookentry__book__id=book)
                    else:
                        self._queryset = self._queryset.filter(recipebookentry__book__id=book)
                if 'not' in bk_filter:
                    self._queryset = self._queryset.exclude(id__in=recipes.values('id'))

    def step_filters(self, steps=None, operator=True):
        if operator != True:
            raise NotImplementedError
        if not steps:
            return
        if not isinstance(steps, list):
            steps = [unistepsts]
        self._queryset = self._queryset.filter(steps__id__in=steps)

    def build_fulltext_filters(self, string=None):
        if not string:
            return
        if self._fulltext_include:
            vectors = []
            rank = []
            if 'name' in self._fulltext_include:
                vectors.append('name_search_vector')
                rank.append(SearchRank('name_search_vector', self.search_query, cover_density=True))
            if 'description' in self._fulltext_include:
                vectors.append('desc_search_vector')
                rank.append(SearchRank('desc_search_vector', self.search_query, cover_density=True))
            if 'steps__instruction' in self._fulltext_include:
                vectors.append('steps__search_vector')
                rank.append(SearchRank('steps__search_vector', self.search_query, cover_density=True))
            if 'keywords__name' in self._fulltext_include:
                # explicitly settings unaccent on keywords and foods so that they behave the same as search_vector fields
                vectors.append('keywords__name__unaccent')
                rank.append(SearchRank('keywords__name__unaccent', self.search_query, cover_density=True))
            if 'steps__ingredients__food__name' in self._fulltext_include:
                vectors.append('steps__ingredients__food__name__unaccent')
                rank.append(SearchRank('steps__ingredients__food__name', self.search_query, cover_density=True))

            for r in rank:
                if self.search_rank is None:
                    self.search_rank = r
                else:
                    self.search_rank += r
            # modifying queryset will annotation creates duplicate results
            self._filters.append(Q(id__in=Recipe.objects.annotate(vector=SearchVector(*vectors)).filter(Q(vector=self.search_query))))

    def build_text_filters(self, string=None):
        if not string:
            return

        if not self._filters:
            self._filters = []
        # dynamically build array of filters that will be applied
        for f in self._icontains_include:
            self._filters += [Q(**{"%s__icontains" % f: self._string})]

        for f in self._istartswith_include:
            self._filters += [Q(**{"%s__istartswith" % f: self._string})]

    def build_trigram(self, string=None):
        if not string:
            return
        if self._trigram:
            trigram = None
            for f in self._trigram_include:
                if trigram:
                    trigram += TrigramSimilarity(f, self._string)
                else:
                    trigram = TrigramSimilarity(f, self._string)
            self._fuzzy_match = Recipe.objects.annotate(trigram=trigram).distinct(
            ).annotate(simularity=Max('trigram')).values('id', 'simularity').filter(simularity__gt=self._search_prefs.trigram_threshold)
            self._filters += [Q(pk__in=self._fuzzy_match.values('pk'))]

    def _makenow_filter(self, missing=None):
        if missing is None or (type(missing) == bool and missing == False):
            return
        shopping_users = [*self._request.user.get_shopping_share(), self._request.user]

        onhand_filter = (
            Q(steps__ingredients__food__onhand_users__in=shopping_users)  # food onhand
            | Q(steps__ingredients__food__substitute__onhand_users__in=shopping_users)  # or substitute food onhand
            | Q(steps__ingredients__food__in=self.__children_substitute_filter(shopping_users))
            | Q(steps__ingredients__food__in=self.__sibling_substitute_filter(shopping_users))
        )
        makenow_recipes = Recipe.objects.annotate(
            count_food=Count('steps__ingredients__food__pk', filter=Q(steps__ingredients__food__isnull=False), distinct=True),
            count_onhand=Count('steps__ingredients__food__pk', filter=onhand_filter, distinct=True),
            count_ignore_shopping=Count('steps__ingredients__food__pk', filter=Q(steps__ingredients__food__ignore_shopping=True,
                                                                                 steps__ingredients__food__recipe__isnull=True), distinct=True),
            has_child_sub=Case(When(steps__ingredients__food__in=self.__children_substitute_filter(shopping_users), then=Value(1)), default=Value(0)),
            has_sibling_sub=Case(When(steps__ingredients__food__in=self.__sibling_substitute_filter(shopping_users), then=Value(1)), default=Value(0))
        ).annotate(missingfood=F('count_food')-F('count_onhand')-F('count_ignore_shopping')).filter(missingfood=missing)
        self._queryset = self._queryset.distinct().filter(id__in=makenow_recipes.values('id'))

    @ staticmethod
    def __children_substitute_filter(shopping_users=None):
        children_onhand_subquery = Food.objects.filter(
            path__startswith=Substr(OuterRef('path'), 1, Food.steplen*OuterRef('depth')),
            depth__gt=OuterRef('depth'),
            onhand_users__in=shopping_users
        ).annotate(child_onhand=Coalesce(Func('pk', function='Count'), 0)).values('child_onhand')
        return Food.objects.exclude(  # list of foods that are onhand and children of: foods that are not onhand and are set to use children as substitutes
            Q(onhand_users__in=shopping_users)
            | Q(ignore_shopping=True, recipe__isnull=True)
            | Q(substitute__onhand_users__in=shopping_users)
        ).exclude(depth=1, numchild=0).filter(substitute_children=True
                                              ).annotate(child_onhand=Coalesce(Subquery(children_onhand_subquery), 0)).exclude(child_onhand=0)

    @ staticmethod
    def __sibling_substitute_filter(shopping_users=None):
        sibling_onhand_subquery = Food.objects.filter(
            path__startswith=Substr(OuterRef('path'), 1, Food.steplen*(OuterRef('depth')-1)),
            depth=OuterRef('depth'),
            onhand_users__in=shopping_users
        ).annotate(sibling_onhand=Coalesce(Func('pk', function='Count'), 0)).values('sibling_onhand')
        return Food.objects.exclude(  # list of foods that are onhand and siblings of: foods that are not onhand and are set to use siblings as substitutes
            Q(onhand_users__in=shopping_users)
            | Q(ignore_shopping=True, recipe__isnull=True)
            | Q(substitute__onhand_users__in=shopping_users)
        ).exclude(depth=1, numchild=0).filter(substitute_siblings=True
                                              ).annotate(sibling_onhand=Coalesce(Subquery(sibling_onhand_subquery), 0)).exclude(sibling_onhand=0)


class RecipeFacet():
    class CacheEmpty(Exception):
        pass

    def __init__(self, request, queryset=None, hash_key=None, cache_timeout=3600):
        if hash_key is None and queryset is None:
            raise ValueError(_("One of queryset or hash_key must be provided"))

        self._request = request
        self._queryset = queryset
        self.hash_key = hash_key or str(hash(frozenset(self._queryset.values_list('pk'))))
        self._SEARCH_CACHE_KEY = f"recipes_filter_{self.hash_key}"
        self._cache_timeout = cache_timeout
        self._cache = caches['default'].get(self._SEARCH_CACHE_KEY, {})
        if self._cache is None and self._queryset is None:
            raise self.CacheEmpty("No queryset provided and cache empty")

        self.Keywords = self._cache.get('Keywords', None)
        self.Foods = self._cache.get('Foods', None)
        self.Books = self._cache.get('Books', None)
        self.Ratings = self._cache.get('Ratings', None)
        # TODO Move Recent to recipe annotation/serializer:  requrires change in RecipeSearch(), RecipeSearchView.vue and serializer
        self.Recent = self._cache.get('Recent', None)

        if self._queryset is not None:
            self._recipe_list = list(self._queryset.values_list('id', flat=True))
            self._search_params = {
                'keyword_list': self._request.query_params.getlist('keywords', []),
                'food_list': self._request.query_params.getlist('foods', []),
                'book_list': self._request.query_params.getlist('book', []),
                'search_keywords_or': str2bool(self._request.query_params.get('keywords_or', True)),
                'search_foods_or': str2bool(self._request.query_params.get('foods_or', True)),
                'search_books_or': str2bool(self._request.query_params.get('books_or', True)),
                'space': self._request.space,
            }
        elif self.hash_key is not None:
            self._recipe_list = self._cache.get('recipe_list', [])
            self._search_params = {
                'keyword_list': self._cache.get('keyword_list', None),
                'food_list': self._cache.get('food_list', None),
                'book_list': self._cache.get('book_list', None),
                'search_keywords_or': self._cache.get('search_keywords_or', None),
                'search_foods_or': self._cache.get('search_foods_or', None),
                'search_books_or': self._cache.get('search_books_or', None),
                'space': self._cache.get('space', None),
            }

        self._cache = {
            **self._search_params,
            'recipe_list': self._recipe_list,
            'Ratings': self.Ratings,
            'Recent': self.Recent,
            'Keywords': self.Keywords,
            'Foods': self.Foods,
            'Books': self.Books

        }
        caches['default'].set(self._SEARCH_CACHE_KEY, self._cache, self._cache_timeout)

    def get_facets(self, from_cache=False):
        if from_cache:
            return {
                'cache_key': self.hash_key or '',
                'Ratings': self.Ratings or {},
                'Recent': self.Recent or [],
                'Keywords': self.Keywords or [],
                'Foods': self.Foods or [],
                'Books': self.Books or []
            }
        return {
            'cache_key': self.hash_key,
            'Ratings': self.get_ratings(),
            'Recent': self.get_recent(),
            'Keywords': self.get_keywords(),
            'Foods': self.get_foods(),
            'Books': self.get_books()
        }

    def set_cache(self, key, value):
        self._cache = {**self._cache, key: value}
        caches['default'].set(
            self._SEARCH_CACHE_KEY,
            self._cache,
            self._cache_timeout
        )

    def get_books(self):
        if self.Books is None:
            self.Books = []
        return self.Books

    def get_keywords(self):
        if self.Keywords is None:
            if self._search_params['search_keywords_or']:
                keywords = Keyword.objects.filter(space=self._request.space).distinct()
            else:
                keywords = Keyword.objects.filter(Q(recipe__in=self._recipe_list) | Q(depth=1)).filter(space=self._request.space).distinct()

            # set keywords to root objects only
            keywords = self._keyword_queryset(keywords)
            self.Keywords = [{**x, 'children': None} if x['numchild'] > 0 else x for x in list(keywords)]
            self.set_cache('Keywords', self.Keywords)
        return self.Keywords

    def get_foods(self):
        if self.Foods is None:
            # # if using an OR search, will annotate all keywords, otherwise, just those that appear in results
            if self._search_params['search_foods_or']:
                foods = Food.objects.filter(space=self._request.space).distinct()
            else:
                foods = Food.objects.filter(Q(ingredient__step__recipe__in=self._recipe_list) | Q(depth=1)).filter(space=self._request.space).distinct()

            # set keywords to root objects only
            foods = self._food_queryset(foods)

            self.Foods = [{**x, 'children': None} if x['numchild'] > 0 else x for x in list(foods)]
            self.set_cache('Foods', self.Foods)
        return self.Foods

    def get_books(self):
        if self.Books is None:
            self.Books = []
        return self.Books

    def get_ratings(self):
        if self.Ratings is None:
            if not self._request.space.demo and self._request.space.show_facet_count:
                if self._queryset is None:
                    self._queryset = Recipe.objects.filter(id__in=self._recipe_list)
                rating_qs = self._queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=self._request.user, then='cooklog__rating'), default=Value(0)))))
                self.Ratings = dict(Counter(r.rating for r in rating_qs))
            else:
                self.Rating = {}
            self.set_cache('Ratings', self.Ratings)
        return self.Ratings

    def get_recent(self):
        if self.Recent is None:
            # TODO make days of recent recipe a setting
            recent_recipes = ViewLog.objects.filter(created_by=self._request.user, space=self._request.space, created_at__gte=timezone.now() - timedelta(days=14)
                                                    ).values_list('recipe__pk', flat=True)
            self.Recent = list(recent_recipes)
            self.set_cache('Recent', self.Recent)
        return self.Recent

    def add_food_children(self, id):
        try:
            food = Food.objects.get(id=id)
            nodes = food.get_ancestors()
        except Food.DoesNotExist:
            return self.get_facets()
        foods = self._food_queryset(food.get_children(), food)
        deep_search = self.Foods
        for node in nodes:
            index = next((i for i, x in enumerate(deep_search) if x["id"] == node.id), None)
            deep_search = deep_search[index]['children']
        index = next((i for i, x in enumerate(deep_search) if x["id"] == food.id), None)
        deep_search[index]['children'] = [{**x, 'children': None} if x['numchild'] > 0 else x for x in list(foods)]
        self.set_cache('Foods', self.Foods)
        return self.get_facets()

    def add_keyword_children(self, id):
        try:
            keyword = Keyword.objects.get(id=id)
            nodes = keyword.get_ancestors()
        except Keyword.DoesNotExist:
            return self.get_facets()
        keywords = self._keyword_queryset(keyword.get_children(), keyword)
        deep_search = self.Keywords
        for node in nodes:
            index = next((i for i, x in enumerate(deep_search) if x["id"] == node.id), None)
            deep_search = deep_search[index]['children']
        index = next((i for i, x in enumerate(deep_search) if x["id"] == keyword.id), None)
        deep_search[index]['children'] = [{**x, 'children': None} if x['numchild'] > 0 else x for x in list(keywords)]
        self.set_cache('Keywords', self.Keywords)
        return self.get_facets()

    def _recipe_count_queryset(self, field, depth=1, steplen=4):
        return Recipe.objects.filter(**{f'{field}__path__startswith': OuterRef('path')}, id__in=self._recipe_list, space=self._request.space
                                     ).values(child=Substr(f'{field}__path',  1, steplen*depth)
                                              ).annotate(count=Count('pk', distinct=True)).values('count')

    def _keyword_queryset(self, queryset, keyword=None):
        depth = getattr(keyword, 'depth', 0) + 1
        steplen = depth * Keyword.steplen

        if not self._request.space.demo and self._request.space.show_facet_count:
            return queryset.annotate(count=Coalesce(Subquery(self._recipe_count_queryset('keywords', depth, steplen)), 0)
                                     ).filter(depth=depth, count__gt=0
                                              ).values('id', 'name', 'count', 'numchild').order_by(Lower('name').asc())[:200]
        else:
            return queryset.filter(depth=depth).values('id', 'name',  'numchild').order_by(Lower('name').asc())

    def _food_queryset(self, queryset, food=None):
        depth = getattr(food, 'depth', 0) + 1
        steplen = depth * Food.steplen

        if not self._request.space.demo and self._request.space.show_facet_count:
            return queryset.annotate(count=Coalesce(Subquery(self._recipe_count_queryset('steps__ingredients__food', depth, steplen)), 0)
                                     ).filter(depth__lte=depth, count__gt=0
                                              ).values('id', 'name', 'count', 'numchild').order_by(Lower('name').asc())[:200]
        else:
            return queryset.filter(depth__lte=depth).values('id', 'name', 'numchild').order_by(Lower('name').asc())


def old_search(request):
    if has_group_permission(request.user, ('guest',)):
        params = dict(request.GET)
        params['internal'] = None
        f = RecipeFilter(params,
                         queryset=Recipe.objects.filter(space=request.user.userpreference.space).all().order_by(Lower('name').asc()),
                         space=request.space)
        return f.qs
