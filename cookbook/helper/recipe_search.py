import json
from collections import Counter
from datetime import timedelta

from django.contrib.postgres.search import SearchQuery, SearchRank, TrigramSimilarity
from django.core.cache import caches
from django.db.models import Avg, Case, Count, F, Func, Max, OuterRef, Q, Subquery, Sum, Value, When
from django.db.models.functions import Coalesce, Substr
from django.utils import timezone, translation
from django.utils.translation import gettext as _

from cookbook.filters import RecipeFilter
from cookbook.helper.HelperFunctions import Round, str2bool
from cookbook.helper.permission_helper import has_group_permission
from cookbook.managers import DICTIONARY
from cookbook.models import CookLog, CustomFilter, Food, Keyword, Recipe, SearchPreference, ViewLog
from recipes import settings


# TODO create extensive tests to make sure ORs ANDs and various filters, sorting, etc work as expected
# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch():
    _postgres = settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']

    def __init__(self, request,  **params):
        self._request = request
        self._queryset = None
        if filter := params.get('filter', None):
            try:
                self._params = {**json.loads(CustomFilter.objects.get(id=filter).search)}
            except CustomFilter.DoesNotExist:
                self._params = {**(params or {})}
        else:
            self._params = {**(params or {})}
        self._query = self._params.get('query', {}) or {}
        if self._request.user.is_authenticated:
            self._search_prefs = request.user.searchpreference
        else:
            self._search_prefs = SearchPreference()
        self._string = params.get('query').strip() if params.get('query', None) else None
        self._rating = self._params.get('rating', None)
        self._keywords = {
            'or': self._params.get('keywords_or', None),
            'and': self._params.get('keywords_and', None),
            'or_not': self._params.get('keywords_or_not', None),
            'and_not': self._params.get('keywords_and_not', None)
        }
        self._foods = {
            'or': self._params.get('foods_or', None),
            'and': self._params.get('foods_and', None),
            'or_not': self._params.get('foods_or_not', None),
            'and_not': self._params.get('foods_and_not', None)
        }
        self._books = {
            'or': self._params.get('books_or', None),
            'and': self._params.get('books_and', None),
            'or_not': self._params.get('books_or_not', None),
            'and_not': self._params.get('books_and_not', None)
        }
        self._steps = self._params.get('steps', None)
        self._units = self._params.get('units', None)
        # TODO add created by
        # TODO image exists
        self._sort_order = self._params.get('sort_order', None) or self._query.get('sort_order', 0)
        self._internal = str2bool(self._params.get('internal', False))
        self._random = str2bool(self._params.get('random', False))
        self._new = str2bool(self._params.get('new', False))
        self._last_viewed = int(self._params.get('last_viewed', 0) or self._query.get('last_viewed', 0))
        self._timescooked = self._params.get('timescooked', None)
        self._lastcooked = self._params.get('lastcooked', None)
        self._makenow = self._params.get('makenow', None)

        self._search_type = self._search_prefs.search or 'plain'
        if self._string:
            unaccent_include = self._search_prefs.unaccent.values_list('field', flat=True)
            self._icontains_include = [x + '__unaccent' if x in unaccent_include else x for x in self._search_prefs.icontains.values_list('field', flat=True)]
            self._istartswith_include = [x + '__unaccent' if x in unaccent_include else x for x in self._search_prefs.istartswith.values_list('field', flat=True)]
            self._trigram_include = None
            self._fulltext_include = None
        self._trigram = False
        if self._postgres and self._string:
            self._language = DICTIONARY.get(translation.get_language(), 'simple')
            self._trigram_include = [x + '__unaccent' if x in unaccent_include else x for x in self._search_prefs.trigram.values_list('field', flat=True)]
            self._fulltext_include = self._search_prefs.fulltext.values_list('field', flat=True)

            if self._search_type not in ['websearch', 'raw'] and self._trigram_include:
                self._trigram = True
            self.search_query = SearchQuery(
                self._string,
                search_type=self._search_type,
                config=self._language,
            )
            self.search_rank = (
                SearchRank('name_search_vector', self.search_query, cover_density=True)
                + SearchRank('desc_search_vector', self.search_query, cover_density=True)
                # + SearchRank('steps__search_vector', self.search_query, cover_density=True)  # Is a large performance drag
            )
        self.orderby = []
        self._default_sort = ['-favorite']  # TODO add user setting
        self._filters = None
        self._fuzzy_match = None

    def get_queryset(self, queryset):
        self._queryset = queryset
        self._build_sort_order()
        self._recently_viewed(num_recent=self._last_viewed)
        self._last_cooked(lastcooked=self._lastcooked)
        self._favorite_recipes(timescooked=self._timescooked)
        self._new_recipes()
        self.keyword_filters(**self._keywords)
        self.food_filters(**self._foods)
        self.book_filters(**self._books)
        self.rating_filter(rating=self._rating)
        self.internal_filter()
        self.step_filters(steps=self._steps)
        self.unit_filters(units=self._units)
        self.string_filters(string=self._string)
        self._makenow_filter()

        # self._queryset = self._queryset.distinct()  # TODO 2x check. maybe add filter of recipe__in after orderby
        return self._queryset.filter(space=self._request.space).order_by(*self.orderby)

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
            if self._last_viewed:
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
            elif self._postgres and self._string:
                order += ['-score', *default_order]
            # otherwise sort by the remaining order_by attributes or favorite by default
            else:
                order += default_order
            self.orderby = order

    def string_filters(self, string=None):
        if not string:
            return

        self.build_text_filters(self._string)
        if self._postgres:
            self.build_fulltext_filters(self._string)
            self.build_trigram(self._string)

        if self._filters:
            query_filter = None
            for f in self._filters:
                if query_filter:
                    query_filter |= f
                else:
                    query_filter = f
            self._queryset = self._queryset.filter(query_filter)
            if self._fulltext_include:
                if self._fuzzy_match is None:
                    self._queryset = self._queryset.annotate(score=self.search_rank)
                else:
                    self._queryset = self._queryset.annotate(rank=self.search_rank)

            if self._fuzzy_match is not None:
                simularity = self._fuzzy_match.filter(pk=OuterRef('pk')).values('simularity')
                if not self._fulltext_include:
                    self._queryset = self._queryset.annotate(score=Coalesce(Subquery(simularity), 0.0))
                else:
                    self._queryset = self._queryset.annotate(simularity=Coalesce(Subquery(simularity), 0.0))
            if self._sort_includes('score') and self._fulltext_include and self._fuzzy_match is not None:
                self._queryset = self._queryset.annotate(score=Sum(F('rank')+F('simularity')))
        else:
            self._queryset = self._queryset.filter(name__icontains=self._string)

    def _last_cooked(self, lastcooked=None):
        if self._sort_includes('lastcooked') or lastcooked:
            longTimeAgo = timezone.now() - timedelta(days=100000)
            self._queryset = self._queryset.annotate(lastcooked=Coalesce(
                Max(Case(When(created_by=self._request.user, space=self._request.space, then='cooklog__created_at'))), Value(longTimeAgo)))
        if lastcooked is None:
            return
        lessthan = '-' in lastcooked[:1]

        if lessthan:
            self._queryset = self._queryset.filter(lastcooked__lte=lastcooked[1:]).exclude(lastcooked=longTimeAgo)
        else:
            self._queryset = self._queryset.filter(lastcooked__gte=lastcooked).exclude(lastcooked=longTimeAgo)

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
                    Max(Case(When(created_by=self._request.user, space=self._request.space, then='viewlog__pk'))), Value(0)))
            return

        last_viewed_recipes = ViewLog.objects.filter(created_by=self._request.user, space=self._request.space).values(
            'recipe').annotate(recent=Max('created_at')).order_by('-recent')[:num_recent]
        self._queryset = self._queryset.annotate(recent=Coalesce(Max(Case(When(pk__in=last_viewed_recipes.values('recipe'), then='viewlog__pk'))), Value(0)))

    def _favorite_recipes(self, timescooked=None):
        if self._sort_includes('favorite') or timescooked:
            favorite_recipes = CookLog.objects.filter(created_by=self._request.user, space=self._request.space, recipe=OuterRef('pk')
                                                      ).values('recipe').annotate(count=Count('pk', distinct=True)).values('count')
            self._queryset = self._queryset.annotate(favorite=Coalesce(Subquery(favorite_recipes), 0))
            if timescooked is None:
                return
            lessthan = '-' in timescooked
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
                f = Q(keywords__in=Keyword.include_descendants(keywords))
                if 'not' in kw_filter:
                    self._queryset = self._queryset.exclude(f)
                else:
                    self._queryset = self._queryset.filter(f)
            elif 'and' in kw_filter:
                recipes = Recipe.objects.all()
                for kw in keywords:
                    if 'not' in kw_filter:
                        recipes = recipes.filter(keywords__in=kw.get_descendants_and_self())
                    else:
                        self._queryset = self._queryset.filter(keywords__in=kw.get_descendants_and_self())
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
                f = Q(steps__ingredients__food__in=Food.include_descendants(foods))
                if 'not' in fd_filter:
                    self._queryset = self._queryset.exclude(f)
                else:
                    self._queryset = self._queryset.filter(f)
            elif 'and' in fd_filter:
                recipes = Recipe.objects.all()
                for food in foods:
                    if 'not' in fd_filter:
                        recipes = recipes.filter(steps__ingredients__food__in=food.get_descendants_and_self())
                    else:
                        self._queryset = self._queryset.filter(steps__ingredients__food__in=food.get_descendants_and_self())
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
            # TODO make ratings a settings user-only vs all-users
            self._queryset = self._queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=self._request.user, then='cooklog__rating'), default=Value(0)))))
        if rating is None:
            return
        lessthan = '-' in rating

        if rating == '0':
            self._queryset = self._queryset.filter(rating=0)
        elif lessthan:
            self._queryset = self._queryset.filter(rating__lte=int(rating[1:])).exclude(rating=0)
        else:
            self._queryset = self._queryset.filter(rating__gte=int(rating))

    def internal_filter(self):
        self._queryset = self._queryset.filter(internal=True)

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
            if not self._filters:
                self._filters = []
            if 'name' in self._fulltext_include:
                self._filters += [Q(name_search_vector=self.search_query)]
            if 'description' in self._fulltext_include:
                self._filters += [Q(desc_search_vector=self.search_query)]
            if 'steps__instruction' in self._fulltext_include:
                self._filters += [Q(steps__search_vector=self.search_query)]
            if 'keywords__name' in self._fulltext_include:
                self._filters += [Q(keywords__in=Keyword.objects.filter(name__search=self.search_query))]
            if 'steps__ingredients__food__name' in self._fulltext_include:
                self._filters += [Q(steps__ingredients__food__in=Food.objects.filter(name__search=self.search_query))]

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

    def _makenow_filter(self):
        if not self._makenow:
            return
        shopping_users = [*self._request.user.get_shopping_share(), self._request.user]
        self._queryset = self._queryset.annotate(
            count_food=Count('steps__ingredients__food'),
            count_onhand=Count('pk', filter=Q(steps__ingredients__food__onhand_users__in=shopping_users, steps__ingredients__food__ignore_shopping=False)),
            count_ignore=Count('pk', filter=Q(steps__ingredients__food__ignore_shopping=True))
        ).annotate(missingfood=F('count_food')-F('count_onhand')-F('count_ignore')).filter(missingfood=0)


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
        foods = self._food_queryset(Food.objects.filter(path__startswith=food.path, depth=food.depth+1), food)
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
        keywords = self._keyword_queryset(Keyword.objects.filter(path__startswith=keyword.path, depth=keyword.depth+1), keyword)
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
                                     ).values(child=Substr(f'{field}__path',  1, steplen)
                                              ).annotate(count=Count('pk', distinct=True)).values('count')

    def _keyword_queryset(self, queryset, keyword=None):
        depth = getattr(keyword, 'depth', 0) + 1
        steplen = depth * Keyword.steplen

        if not self._request.space.demo and self._request.space.show_facet_count:
            return queryset.annotate(count=Coalesce(Subquery(self._recipe_count_queryset('keywords', depth, steplen)), 0)
                                     ).filter(depth=depth, count__gt=0
                                              ).values('id', 'name', 'count', 'numchild').order_by('name')[:200]
        else:
            return queryset.filter(depth=depth).values('id', 'name',  'numchild').order_by('name')

    def _food_queryset(self, queryset, food=None):
        depth = getattr(food, 'depth', 0) + 1
        steplen = depth * Food.steplen

        if not self._request.space.demo and self._request.space.show_facet_count:
            return queryset.annotate(count=Coalesce(Subquery(self._recipe_count_queryset('steps__ingredients__food', depth, steplen)), 0)
                                     ).filter(depth__lte=depth, count__gt=0
                                              ).values('id', 'name', 'count', 'numchild').order_by('name')[:200]
        else:
            return queryset.filter(depth__lte=depth).values('id', 'name', 'numchild').order_by('name')


def old_search(request):
    if has_group_permission(request.user, ('guest',)):
        params = dict(request.GET)
        params['internal'] = None
        f = RecipeFilter(params,
                         queryset=Recipe.objects.filter(space=request.user.userpreference.space).all().order_by('name'),
                         space=request.space)
        return f.qs
