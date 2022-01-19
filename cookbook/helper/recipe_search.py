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
from cookbook.models import CookLog, Food, Keyword, Recipe, SearchPreference, ViewLog
from recipes import settings


# TODO create extensive tests to make sure ORs ANDs and various filters, sorting, etc work as expected
# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch():
    _postgres = settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']

    def __init__(self, request,  **params):
        self._request = request
        self._queryset = None
        self._params = {**params}
        if self._request.user.is_authenticated:
            self._search_prefs = request.user.searchpreference
        else:
            self._search_prefs = SearchPreference()
        self._string = params.get('query').strip() if params.get('query', None) else None
        self._rating = self._params.get('rating', None)
        self._keywords = self._params.get('keywords', None)
        self._foods = self._params.get('foods', None)
        self._books = self._params.get('books', None)
        self._steps = self._params.get('steps', None)
        self._units = self._params.get('units', None)
        # TODO add created by
        # TODO add created before/after
        # TODO image exists
        self._sort_order = self._params.get('sort_order', None)
        # TODO add save

        self._keywords_or = str2bool(self._params.get('keywords_or', True))
        self._foods_or = str2bool(self._params.get('foods_or', True))
        self._books_or = str2bool(self._params.get('books_or', True))

        self._internal = str2bool(self._params.get('internal', False))
        self._random = str2bool(self._params.get('random', False))
        self._new = str2bool(self._params.get('new', False))
        self._last_viewed = int(self._params.get('last_viewed', 0))

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
                + SearchRank('steps__search_vector', self.search_query, cover_density=True)
            )
        self.orderby = []
        self._default_sort = ['-favorite']  # TODO add user setting
        self._filters = None
        self._fuzzy_match = None

    def get_queryset(self, queryset):
        self._queryset = queryset
        self.recently_viewed_recipes(self._last_viewed)
        self._favorite_recipes()
        self._new_recipes()
        # self._last_viewed()
        # self._last_cooked()
        self.keyword_filters(keywords=self._keywords, operator=self._keywords_or)
        self.food_filters(foods=self._foods, operator=self._foods_or)
        self.book_filters(books=self._books, operator=self._books_or)
        self.rating_filter(rating=self._rating)
        self.internal_filter()
        self.step_filters(steps=self._steps)
        self.unit_filters(units=self._units)
        self.string_filters(string=self._string)
        # self._queryset = self._queryset.distinct()  # TODO 2x check. maybe add filter of recipe__in after orderby
        self._apply_order_by()
        return self._queryset.filter(space=self._request.space)

    def _apply_order_by(self):
        if self._random:
            self._queryset = self._queryset.order_by("?")
        else:
            if self._sort_order:
                self._queryset.order_by(*self._sort_order)
                return

            order = []  # TODO add user preferences here: name, date cooked, rating, times cooked, date created, date viewed, random
            if '-recent' in self.orderby and self._last_viewed:
                order += ['-recent']
            if '-new_recipe' in self.orderby and self._new:
                order += ['-new_recipe']

            if '-rank' in self.orderby and '-simularity' in self.orderby:
                self._queryset = self._queryset.annotate(score=Sum(F('rank')+F('simularity')))
                order += ['-score']
            elif '-rank' in self.orderby:
                self._queryset = self._queryset.annotate(score=F('rank'))
                order += ['-score']
            elif '-simularity' in self.orderby:
                self._queryset = self._queryset.annotate(score=F('simularity'))
                order += ['-score']
            for x in list(set(self.orderby)-set([*order, '-rank', '-simularity'])):
                order += [x]
            self._queryset = self._queryset.order_by(*order)

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
            self._queryset = self._queryset.filter(query_filter).distinct()
            # TODO add annotation for simularity
            if self._fulltext_include:
                self._queryset = self._queryset.annotate(rank=self.search_rank)
                self.orderby += ['-rank']

            if self._fuzzy_match is not None:  # this annotation is full text, not trigram
                simularity = self._fuzzy_match.filter(pk=OuterRef('pk')).values('simularity')
                self._queryset = self._queryset.annotate(simularity=Coalesce(Subquery(simularity), 0.0))
                self.orderby += ['-simularity']
        else:
            self._queryset = self._queryset.filter(name__icontains=self._string)

    def _new_recipes(self, new_days=7):
        # TODO make new days a user-setting
        if not self._new:
            return
        self._queryset = (
            self._queryset.annotate(new_recipe=Case(
                When(created_at__gte=(timezone.now() - timedelta(days=new_days)), then=('pk')), default=Value(0), ))
        )
        self.orderby += ['-new_recipe']

    def recently_viewed_recipes(self, last_viewed=None):
        if not last_viewed:
            return

        last_viewed_recipes = ViewLog.objects.filter(created_by=self._request.user, space=self._request.space).values(
            'recipe').annotate(recent=Max('created_at')).order_by('-recent')
        last_viewed_recipes = last_viewed_recipes[:last_viewed]
        self.orderby += ['-recent']
        self._queryset = self._queryset.annotate(recent=Coalesce(Max(Case(When(pk__in=last_viewed_recipes.values('recipe'), then='viewlog__pk'))), Value(0)))

    def _favorite_recipes(self):
        self.orderby += ['-favorite']  # default sort?
        favorite_recipes = CookLog.objects.filter(created_by=self._request.user, space=self._request.space, recipe=OuterRef('pk')
                                                  ).values('recipe').annotate(count=Count('pk', distinct=True)).values('count')
        self._queryset = self._queryset.annotate(favorite=Coalesce(Subquery(favorite_recipes), 0))

    def keyword_filters(self, keywords=None, operator=True):
        if not keywords:
            return
        if not isinstance(keywords, list):
            keywords = [keywords]
        if operator == True:
            # TODO creating setting to include descendants of keywords a setting
            self._queryset = self._queryset.filter(keywords__in=Keyword.include_descendants(Keyword.objects.filter(pk__in=keywords)))
        else:
            # when performing an 'and' search returned recipes should include a parent OR any of its descedants
            # AND other keywords selected so filters are appended using keyword__id__in the list of keywords and descendants
            for kw in Keyword.objects.filter(pk__in=keywords):
                self._queryset = self._queryset.filter(keywords__in=list(kw.get_descendants_and_self()))

    def food_filters(self, foods=None, operator=True):
        if not foods:
            return
        if not isinstance(foods, list):
            foods = [foods]
        if operator == True:
            # TODO creating setting to include descendants of food a setting
            self._queryset = self._queryset.filter(steps__ingredients__food__in=Food.include_descendants(Food.objects.filter(pk__in=foods)))
        else:
            # when performing an 'and' search returned recipes should include a parent OR any of its descedants
            # AND other foods selected so filters are appended using steps__ingredients__food__id__in the list of foods and descendants
            for fd in Food.objects.filter(pk__in=foods):
                self._queryset = self._queryset.filter(steps__ingredients__food__in=list(fd.get_descendants_and_self()))

    def unit_filters(self, units=None, operator=True):
        if operator != True:
            raise NotImplementedError
        if not units:
            return
        if not isinstance(units, list):
            units = [units]
        self._queryset = self._queryset.filter(steps__ingredients__unit__in=units)

    def rating_filter(self, rating=None):
        if rating is None:
            return
        rating = int(rating)
        # TODO make ratings a settings user-only vs all-users
        self._queryset = self._queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=self._request.user, then='cooklog__rating'), default=Value(0)))))
        if rating == 0:
            self._queryset = self._queryset.filter(rating=0)
        else:
            self._queryset = self._queryset.filter(rating__gte=rating)

    def internal_filter(self):
        self._queryset = self._queryset.filter(internal=True)

    def book_filters(self, books=None, operator=True):
        if not books:
            return
        if not isinstance(books, list):
            books = [books]
        if operator == True:
            self._queryset = self._queryset.filter(recipebookentry__book__id__in=books)
        else:
            for k in books:
                self._queryset = self._queryset.filter(recipebookentry__book__id=k)

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


# def search_recipes(request, queryset, params):
#     if request.user.is_authenticated:
#         search_prefs = request.user.searchpreference
#     else:
#         search_prefs = SearchPreference()
#     search_string = params.get('query', '').strip()
#     search_rating = int(params.get('rating', 0))
#     search_keywords = params.getlist('keywords', [])
#     search_foods = params.getlist('foods', [])
#     search_books = params.getlist('books', [])
#     search_steps = params.getlist('steps', [])
#     search_units = params.get('units', None)

#     search_keywords_or = str2bool(params.get('keywords_or', True))
#     search_foods_or = str2bool(params.get('foods_or', True))
#     search_books_or = str2bool(params.get('books_or', True))

#     search_internal = str2bool(params.get('internal', False))
#     search_random = str2bool(params.get('random', False))
#     search_new = str2bool(params.get('new', False))
#     search_last_viewed = int(params.get('last_viewed', 0))  # not included in schema currently?
#     orderby = []

#     # only sort by recent not otherwise filtering/sorting
#     if search_last_viewed > 0:
#         last_viewed_recipes = ViewLog.objects.filter(created_by=request.user, space=request.space).values('recipe').annotate(recent=Max('created_at')).order_by('-recent')[:search_last_viewed]
#         queryset = queryset.annotate(recent=Coalesce(Max(Case(When(pk__in=last_viewed_recipes.values('recipe'), then='viewlog__pk'))), Value(0))).order_by('-recent')
#         orderby += ['-recent']
#     # TODO add sort by favorite
#     favorite_recipes = CookLog.objects.filter(created_by=request.user, space=request.space, recipe=OuterRef('pk')).values('recipe').annotate(count=Count('pk', distinct=True)).values('count')
#     # TODO add to serialization and RecipeCard and RecipeView
#     queryset = queryset.annotate(favorite=Coalesce(Subquery(favorite_recipes), 0))

#     # TODO create setting for default ordering - most cooked, rating,
#     # TODO create options for live sorting
#     # TODO make days of new recipe a setting
#     if search_new:
#         queryset = (
#             queryset.annotate(new_recipe=Case(
#                 When(created_at__gte=(timezone.now() - timedelta(days=7)), then=('pk')), default=Value(0), ))
#         )
#         # TODO create setting for 'new' recipes
#         # only sort by new recipes if not otherwise filtering/sorting
#         orderby += ['-new_recipe']
#     orderby += ['-favorite']

#     search_type = search_prefs.search or 'plain'
#     if len(search_string) > 0:
#         unaccent_include = search_prefs.unaccent.values_list('field', flat=True)

#         icontains_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.icontains.values_list('field', flat=True)]
#         istartswith_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.istartswith.values_list('field', flat=True)]
#         trigram_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.trigram.values_list('field', flat=True)]
#         fulltext_include = search_prefs.fulltext.values_list('field', flat=True)  # fulltext doesn't use field name directly

#         # if no filters are configured use name__icontains as default
#         if icontains_include or istartswith_include or trigram_include or fulltext_include:
#             filters = [Q(**{"name__icontains": search_string})]
#         else:
#             filters = []

#         # dynamically build array of filters that will be applied
#         for f in icontains_include:
#             filters += [Q(**{"%s__icontains" % f: search_string})]

#         for f in istartswith_include:
#             filters += [Q(**{"%s__istartswith" % f: search_string})]

#         if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']:
#             language = DICTIONARY.get(translation.get_language(), 'simple')
#             # django full text search https://docs.djangoproject.com/en/3.2/ref/contrib/postgres/search/#searchquery
#             # TODO can options install this extension to further enhance search query language https://github.com/caub/pg-tsquery
#             # trigram breaks full text search 'websearch' and 'raw' capabilities and will be ignored if those methods are chosen
#             if search_type in ['websearch', 'raw']:
#                 search_trigram = False
#             else:
#                 search_trigram = True
#             search_query = SearchQuery(
#                 search_string,
#                 search_type=search_type,
#                 config=language,
#             )

#             # iterate through fields to use in trigrams generating a single trigram
#             if search_trigram and len(trigram_include) > 0:
#                 trigram = None
#                 for f in trigram_include:
#                     if trigram:
#                         trigram += TrigramSimilarity(f, search_string)
#                     else:
#                         trigram = TrigramSimilarity(f, search_string)
#                 queryset = queryset.annotate(similarity=trigram)
#                 filters += [Q(similarity__gt=search_prefs.trigram_threshold)]

#             if 'name' in fulltext_include:
#                 filters += [Q(name_search_vector=search_query)]
#             if 'description' in fulltext_include:
#                 filters += [Q(desc_search_vector=search_query)]
#             if 'instructions' in fulltext_include:
#                 filters += [Q(steps__search_vector=search_query)]
#             if 'keywords' in fulltext_include:
#                 filters += [Q(keywords__in=Subquery(Keyword.objects.filter(name__search=search_query).values_list('id', flat=True)))]
#             if 'foods' in fulltext_include:
#                 filters += [Q(steps__ingredients__food__in=Subquery(Food.objects.filter(name__search=search_query).values_list('id', flat=True)))]
#             query_filter = None
#             for f in filters:
#                 if query_filter:
#                     query_filter |= f
#                 else:
#                     query_filter = f

#             # TODO add order by user settings - only do search rank and annotation if rank order is configured
#             search_rank = (
#                 SearchRank('name_search_vector', search_query, cover_density=True)
#                 + SearchRank('desc_search_vector', search_query, cover_density=True)
#                 + SearchRank('steps__search_vector', search_query, cover_density=True)
#             )
#             queryset = queryset.filter(query_filter).annotate(rank=search_rank)
#             orderby += ['-rank']
#         else:
#             queryset = queryset.filter(name__icontains=search_string)

#     if len(search_keywords) > 0:
#         if search_keywords_or:
#             # TODO creating setting to include descendants of keywords a setting
#             # for kw in Keyword.objects.filter(pk__in=search_keywords):
#             #     search_keywords += list(kw.get_descendants().values_list('pk', flat=True))
#             queryset = queryset.filter(keywords__in=Keyword.include_descendants(Keyword.objects.filter(pk__in=search_keywords)))
#         else:
#             # when performing an 'and' search returned recipes should include a parent OR any of its descedants
#             # AND other keywords selected so filters are appended using keyword__id__in the list of keywords and descendants
#             for kw in Keyword.objects.filter(pk__in=search_keywords):
#                 queryset = queryset.filter(keywords__in=list(kw.get_descendants_and_self()))

#     if len(search_foods) > 0:
#         if search_foods_or:
#             # TODO creating setting to include descendants of food a setting
#             queryset = queryset.filter(steps__ingredients__food__in=Food.include_descendants(Food.objects.filter(pk__in=search_foods)))
#         else:
#             # when performing an 'and' search returned recipes should include a parent OR any of its descedants
#             # AND other foods selected so filters are appended using steps__ingredients__food__id__in the list of foods and descendants
#             for fd in Food.objects.filter(pk__in=search_foods):
#                 queryset = queryset.filter(steps__ingredients__food__in=list(fd.get_descendants_and_self()))

#     if len(search_books) > 0:
#         if search_books_or:
#             queryset = queryset.filter(recipebookentry__book__id__in=search_books)
#         else:
#             for k in search_books:
#                 queryset = queryset.filter(recipebookentry__book__id=k)

#     if search_rating:
#         # TODO make ratings a settings user-only vs all-users
#         queryset = queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=request.user, then='cooklog__rating'), default=Value(0)))))
#         if search_rating == -1:
#             queryset = queryset.filter(rating=0)
#         else:
#             queryset = queryset.filter(rating__gte=search_rating)

#     # probably only useful in Unit list view, so keeping it simple
#     if search_units:
#         queryset = queryset.filter(steps__ingredients__unit__id=search_units)

#     # probably only useful in Unit list view, so keeping it simple
#     if search_steps:
#         queryset = queryset.filter(steps__id__in=search_steps)

#     if search_internal:
#         queryset = queryset.filter(internal=True)

#     queryset = queryset.distinct()

#     if search_random:
#         queryset = queryset.order_by("?")
#     else:
#         queryset = queryset.order_by(*orderby)
#     return queryset


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


# # TODO:  This might be faster https://github.com/django-treebeard/django-treebeard/issues/115
# def get_facet(qs=None, request=None, use_cache=True, hash_key=None, food=None, keyword=None):
#     """
#     Gets an annotated list from a queryset.
#     :param qs:
#         recipe queryset to build facets from
#     :param request:
#         the web request that contains the necessary query parameters
#     :param use_cache:
#         will find results in cache, if any, and return them or empty list.
#         will save the list of recipes IDs in the cache for future processing
#     :param hash_key:
#         the cache key of the recipe list to process
#         only evaluated if the use_cache parameter is false
#     :param food:
#         return children facets of food
#         only evaluated if the use_cache parameter is false
#     :param keyword:
#         return children facets of keyword
#         only evaluated if the use_cache parameter is false
#     """
#     facets = {}
#     recipe_list = []
#     cache_timeout = 600

#     # return cached values
#     if use_cache:
#         qs_hash = hash(frozenset(qs.values_list('pk')))
#         facets['cache_key'] = str(qs_hash)
#         SEARCH_CACHE_KEY = f"recipes_filter_{qs_hash}"
#         if c := caches['default'].get(SEARCH_CACHE_KEY, None):
#             facets['Keywords'] = c['Keywords'] or []
#             facets['Foods'] = c['Foods'] or []
#             facets['Books'] = c['Books'] or []
#             facets['Ratings'] = c['Ratings'] or []
#             facets['Recent'] = c['Recent'] or []
#         else:
#             facets['Keywords'] = []
#             facets['Foods'] = []
#             facets['Books'] = []
#             # TODO make ratings a settings user-only vs all-users
#             rating_qs = qs.annotate(rating=Round(Avg(Case(When(cooklog__created_by=request.user, then='cooklog__rating'), default=Value(0)))))
#             facets['Ratings'] = dict(Counter(r.rating for r in rating_qs))
#             facets['Recent'] = ViewLog.objects.filter(
#                 created_by=request.user, space=request.space,
#                 created_at__gte=timezone.now() - timedelta(days=14)  # TODO make days of recent recipe a setting
#             ).values_list('recipe__pk', flat=True)

#         cached_search = {
#             'recipe_list': list(qs.values_list('id', flat=True)),
#             'keyword_list': request.query_params.getlist('keywords', []),
#             'food_list': request.query_params.getlist('foods', []),
#             'book_list': request.query_params.getlist('book', []),
#             'search_keywords_or': str2bool(request.query_params.get('keywords_or', True)),
#             'search_foods_or': str2bool(request.query_params.get('foods_or', True)),
#             'search_books_or': str2bool(request.query_params.get('books_or', True)),
#             'space': request.space,
#             'Ratings': facets['Ratings'],
#             'Recent': facets['Recent'],
#             'Keywords': facets['Keywords'],
#             'Foods': facets['Foods'],
#             'Books': facets['Books']
#         }
#         caches['default'].set(SEARCH_CACHE_KEY, cached_search, cache_timeout)
#         return facets

#     # construct and cache new values by retrieving search parameters from the cache
#     SEARCH_CACHE_KEY = f'recipes_filter_{hash_key}'
#     if c := caches['default'].get(SEARCH_CACHE_KEY, None):
#         recipe_list = c['recipe_list']
#         keyword_list = c['keyword_list']
#         food_list = c['food_list']
#         book_list = c['book_list']
#         search_keywords_or = c['search_keywords_or']
#         search_foods_or = c['search_foods_or']
#         search_books_or = c['search_books_or']
#     else:
#         return {}

#     # if using an OR search, will annotate all keywords, otherwise, just those that appear in results
#     if search_keywords_or:
#         keywords = Keyword.objects.filter(space=request.space).distinct()
#     else:
#         keywords = Keyword.objects.filter(Q(recipe__in=recipe_list) | Q(depth=1)).filter(space=request.space).distinct()

#     # Subquery that counts recipes for keyword including children
#     kw_recipe_count = Recipe.objects.filter(**{'keywords__path__startswith': OuterRef('path')}, id__in=recipe_list, space=request.space
#                                             ).values(kw=Substr('keywords__path',  1, Keyword.steplen)
#                                                      ).annotate(count=Count('pk', distinct=True)).values('count')

#     # set keywords to root objects only
#     keywords = keywords.annotate(count=Coalesce(Subquery(kw_recipe_count), 0)
#                                  ).filter(depth=1, count__gt=0
#                                           ).values('id', 'name', 'count', 'numchild'
#                                                    ).order_by('name')
#     if keyword:
#         facets['Keywords'] = list(keywords)
#         return facets

#     # custom django-tree function annotates a queryset to make building a tree easier.
#     # see https://django-treebeard.readthedocs.io/en/latest/api.html#treebeard.models.Node.get_annotated_list_qs for details
#     # kw_a = annotated_qs(keywords, root=True, fill=True)

#     # # if using an OR search, will annotate all keywords, otherwise, just those that appear in results
#     if search_foods_or:
#         foods = Food.objects.filter(space=request.space).distinct()
#     else:
#         foods = Food.objects.filter(Q(ingredient__step__recipe__in=recipe_list) | Q(depth=1)).filter(space=request.space).distinct()

#     food_recipe_count = Recipe.objects.filter(**{'steps__ingredients__food__path__startswith': OuterRef('path')}, id__in=recipe_list, space=request.space
#                                               ).values(kw=Substr('steps__ingredients__food__path',  1, Food.steplen * (1+getattr(food, 'depth', 0)))
#                                                        ).annotate(count=Count('pk', distinct=True)).values('count')

#     # set keywords to root objects only
#     foods = foods.annotate(count=Coalesce(Subquery(food_recipe_count), 0)
#                            ).filter(depth=(1+getattr(food, 'depth', 0)), count__gt=0
#                                     ).values('id', 'name', 'count', 'numchild'
#                                              ).order_by('name')
#     if food:
#         facets['Foods'] = list(foods)
#         return facets

#     # food_a = annotated_qs(foods, root=True, fill=True)

#     # c['Keywords'] = facets['Keywords'] = fill_annotated_parents(kw_a, keyword_list)
#     c['Keywords'] = facets['Keywords'] = list(keywords)
#     # c['Foods'] = facets['Foods'] = fill_annotated_parents(food_a, food_list)
#     c['Foods'] = facets['Foods'] = list(foods)
#     # TODO add book facet
#     c['Books'] = facets['Books'] = []
#     caches['default'].set(SEARCH_CACHE_KEY, c, cache_timeout)
#     return facets


# def fill_annotated_parents(annotation, filters):
#     tree_list = []
#     parent = []
#     i = 0
#     level = -1
#     for r in annotation:
#         expand = False

#         annotation[i][1]['id'] = r[0].id
#         annotation[i][1]['name'] = r[0].name
#         annotation[i][1]['count'] = getattr(r[0], 'recipe_count', 0)
#         annotation[i][1]['isDefaultExpanded'] = False

#         if str(r[0].id) in filters:
#             expand = True
#         if r[1]['level'] < level:
#             parent = parent[:r[1]['level'] - level]
#             parent[-1] = i
#             level = r[1]['level']
#         elif r[1]['level'] > level:
#             parent.extend([i])
#             level = r[1]['level']
#         else:
#             parent[-1] = i
#         j = 0

#         while j < level:
#             # this causes some double counting when a recipe has both a child and an ancestor
#             annotation[parent[j]][1]['count'] += getattr(r[0], 'recipe_count', 0)
#             if expand:
#                 annotation[parent[j]][1]['isDefaultExpanded'] = True
#             j += 1
#         if level == 0:
#             tree_list.append(annotation[i][1])
#         elif level > 0:
#             annotation[parent[level - 1]][1].setdefault('children', []).append(annotation[i][1])
#         i += 1
#     return tree_list


# def annotated_qs(qs, root=False, fill=False):
#     """
#     Gets an annotated list from a queryset.
#     :param root:

#         Will backfill in annotation to include all parents to root node.

#     :param fill:
#         Will fill in gaps in annotation where nodes between children
#         and ancestors are not included in the queryset.
#     """

#     result, info = [], {}
#     start_depth, prev_depth = (None, None)
#     nodes_list = list(qs.values_list('pk', flat=True))
#     for node in qs.order_by('path'):
#         node_queue = [node]
#         while len(node_queue) > 0:
#             dirty = False
#             current_node = node_queue[-1]
#             depth = current_node.get_depth()
#             parent_id = current_node.parent
#             if root and depth > 1 and parent_id not in nodes_list:
#                 parent_id = current_node.parent
#                 nodes_list.append(parent_id)
#                 node_queue.append(current_node.__class__.objects.get(pk=parent_id))
#                 dirty = True

#             if fill and depth > 1 and prev_depth and depth > prev_depth and parent_id not in nodes_list:
#                 nodes_list.append(parent_id)
#                 node_queue.append(current_node.__class__.objects.get(pk=parent_id))
#                 dirty = True

#             if not dirty:
#                 working_node = node_queue.pop()
#                 if start_depth is None:
#                     start_depth = depth
#                 open = (depth and (prev_depth is None or depth > prev_depth))
#                 if prev_depth is not None and depth < prev_depth:
#                     info['close'] = list(range(0, prev_depth - depth))
#                 info = {'open': open, 'close': [], 'level': depth - start_depth}
#                 result.append((working_node, info,))
#                 prev_depth = depth
#     if start_depth and start_depth > 0:
#         info['close'] = list(range(0, prev_depth - start_depth + 1))
#     return result


def old_search(request):
    if has_group_permission(request.user, ('guest',)):
        params = dict(request.GET)
        params['internal'] = None
        f = RecipeFilter(params,
                         queryset=Recipe.objects.filter(space=request.user.userpreference.space).all().order_by('name'),
                         space=request.space)
        return f.qs


# from django.db.models import fields
# from cookbook.models import Food, Recipe, Keyword, RecipeBook, Unit
# many_to_many = {}
# one_to_many = {}
# many_to_one = {}
# char = {}
# boolean = {}
# number = {}
# other = {}
# image = {}
# date = {}
# for model in [Food, Recipe, Keyword, RecipeBook, Unit]:
#     print(name:=model.__name__, ":")
#     for x in model._meta.get_fields():

#         if x.name in ['space', 'id']:
#             continue
#         elif x.many_to_many:
#             many_to_many[name]=[*many_to_many.get(name, []), x.name]
#         elif x.one_to_many:
#             one_to_many[name] = [*one_to_many.get(name, []), x.name]
#         elif x.many_to_one:
#             many_to_one[name] = [*many_to_one.get(name, []), x.name]
#         elif isinstance(x, fields.CharField):
#             char[name] = [*char.get(name, []), x.name]
#         elif isinstance(x, fields.BooleanField):
#             boolean[name] = [*boolean.get(name, []), x.name]
#         elif isinstance(x, fields.IntegerField) or isinstance(x, fields.DecimalField):
#             number[name] = [*number.get(name, []), x.name]
#         elif isinstance(x, fields.DateField):
#             date[name] = [*date.get(name, []), x.name]
#         elif isinstance(x, fields.files.ImageField):
#             image[name] = [*image.get(name, []), x.name]
#         else:
#             other[name] = [*other.get(name, []), x.name]
#         if x.hidden:
#             hidden[name] = [*hidden.get(name, []), x.name]
#         print('---', x.name, ' - ', x.db_type)
# for field_type in [(char, 'char'), (number, 'number'), (other, 'other'), (date, 'date'), (image, 'image'), (one_to_many, 'one_to_many'), (many_to_one, 'many_to_one'), (many_to_many, 'many_to_many')]:
#     print(f"{field_type[1]}:")
#     for model in field_type[0]:
#         print(f"--{model}")
#         for field in field_type[0][model]:
#             print(f"   --{field}")
