import json
from datetime import timedelta

from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector, TrigramSimilarity
from django.core.cache import cache
from django.db.models import Avg, Case, Count, F, Max, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce, Lower
from django.utils import timezone, translation

from django.contrib.auth.models import User

from cookbook.helper.HelperFunctions import Round, str2bool
from cookbook.helper.food_onhand import children_substitute_filter, sibling_substitute_filter
from cookbook.helper.permission_helper import get_household_user_ids
from cookbook.managers import DICTIONARY
from cookbook.models import (CustomFilter, Food, Keyword, Recipe, SearchFields, SearchPreference, UserSpace, ViewLog)
from recipes import settings


# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch():
    _postgres = settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'

    def __init__(self, request, **params):
        self._request = request
        self._queryset = None
        self._params = self._resolve_params(params)
        self._search_prefs = self._load_search_prefs()
        self._parse_filter_params()
        self._configure_text_search()
        self.orderby = []

    def _resolve_params(self, params):
        if f := params.get('filter', None):
            custom_filter = (
                CustomFilter.objects.filter(id=f, space=self._request.space
                                            ).filter(Q(created_by=self._request.user) | Q(shared=self._request.user) | Q(recipebook__shared=self._request.user)).first()
            )
            if custom_filter:
                resolved = {**json.loads(custom_filter.search)}
                self._original_params = {**(params or {})}
                # json.loads casts rating as an integer, expecting string
                if isinstance(resolved.get('rating', None), int):
                    resolved['rating'] = str(resolved['rating'])
                return resolved
        return {**(params or {})}

    def _load_search_prefs(self):
        if self._request.user.is_authenticated:
            CACHE_KEY = f'search_pref_{self._request.user.id}'
            cached_result = cache.get(CACHE_KEY, default=None)
            if cached_result is not None:
                result = cached_result
            else:
                result = self._request.user.searchpreference
            cache.set(CACHE_KEY, result, timeout=10)
            return result
        return SearchPreference()

    def _parse_filter_params(self):
        self._string = self._params.get('query').strip() if self._params.get('query', None) else None

        self._rating = self._params.get('rating', None)
        self._rating_gte = self._params.get('rating_gte', None)
        self._rating_lte = self._params.get('rating_lte', None)

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
        self._internal = str2bool(self._params.get('internal', None))
        self._sort_order = self._params.get('sort_order', None)
        if self._sort_order == 'random':
            self._random = True
            self.sort_order = None
        else:
            self._random = str2bool(self._params.get('random', False))
        self._new = str2bool(self._params.get('new', False))
        self._num_recent = int(self._params.get('num_recent', 0))
        self._include_children = str2bool(self._params.get('include_children', True))
        self._timescooked = self._params.get('timescooked', None)
        self._timescooked_gte = self._params.get('timescooked_gte', None)
        self._timescooked_lte = self._params.get('timescooked_lte', None)

        self._createdon = self._params.get('createdon', None)
        self._createdon_gte = self._params.get('createdon_gte', None)
        self._createdon_lte = self._params.get('createdon_lte', None)

        self._updatedon = self._params.get('updatedon', None)
        self._updatedon_gte = self._params.get('updatedon_gte', None)
        self._updatedon_lte = self._params.get('updatedon_lte', None)

        self._viewedon_gte = self._params.get('viewedon_gte', None)
        self._viewedon_lte = self._params.get('viewedon_lte', None)

        self._cookedon_gte = self._params.get('cookedon_gte', None)
        self._cookedon_lte = self._params.get('cookedon_lte', None)

        self._createdby = self._params.get('createdby', None)
        self._makenow = self._params.get('makenow', None)
        # this supports hidden feature to find recipes missing X ingredients
        if isinstance(self._makenow, bool) and self._makenow == True:
            self._makenow = 0
        elif isinstance(self._makenow, str) and self._makenow in ["yes", "true"]:
            self._makenow = 0
        else:
            try:
                self._makenow = int(self._makenow)
            except (ValueError, TypeError):
                self._makenow = None

    def _configure_text_search(self):
        self._search_type = self._search_prefs.search or 'plain'
        self._trigram = False
        self._fulltext_include = None
        self._trigram_include = None

        if not self._string:
            return

        if self._postgres:
            self._unaccent_include = self._search_prefs.unaccent.values_list('field', flat=True)
        else:
            self._unaccent_include = []
        self._icontains_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.icontains.values_list('field', flat=True)]
        self._istartswith_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.istartswith.values_list('field', flat=True)]

        if self._postgres:
            self._language = DICTIONARY.get(translation.get_language(), 'simple')
            self._trigram_include = [x + '__unaccent' if x in self._unaccent_include else x for x in self._search_prefs.trigram.values_list('field', flat=True)]
            self._fulltext_include = self._search_prefs.fulltext.values_list('field', flat=True) or None

            if self._search_type not in ['websearch', 'raw'] and self._trigram_include:
                self._trigram = True
            self._search_query = SearchQuery(
                self._string,
                search_type=self._search_type,
                config=self._language,
            )

    def get_queryset(self, queryset):
        self._queryset = queryset
        self._queryset = self._queryset.prefetch_related('keywords')

        self._build_sort_order()
        self._recently_viewed(num_recent=self._num_recent)

        self._cooked_on_filter()
        self._created_on_filter()
        self._updated_on_filter()
        self._viewed_on_filter()

        self._created_by_filter(created_by_user_id=self._createdby)
        self._favorite_recipes()
        self._new_recipes()
        self.keyword_filters(**self._keywords)
        self.food_filters(**self._foods)
        self.book_filters(**self._books)
        self.rating_filter()
        self.internal_filter(internal=self._internal)
        self.step_filters(steps=self._steps)
        self.unit_filters(units=self._units)
        self._makenow_filter(missing=self._makenow)
        self.string_filters(string=self._string)

        # Convert nullable annotation fields to F-expressions with nulls_last
        _NULLS_LAST = {'lastcooked', 'lastviewed', 'rating'}
        final_order = []
        for key in self.orderby:
            if not isinstance(key, str):
                final_order.append(key)
                continue
            bare = key.lstrip('-')
            if bare in _NULLS_LAST:
                if key.startswith('-'):
                    final_order.append(F(bare).desc(nulls_last=True))
                else:
                    final_order.append(F(bare).asc(nulls_last=True))
            else:
                final_order.append(key)
        return self._queryset.filter(space=self._request.space).order_by(*final_order)

    def _sort_includes(self, *args):
        for x in args:
            if x in self.orderby:
                return True
            elif '-' + x in self.orderby:
                return True
        return False

    def _build_sort_order(self):
        if self._random:
            self.orderby = ['?']
        else:
            order = []
            # TODO add userpreference for default sort order and replace '-favorite'
            default_order = ['name']
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

        filters = self._build_text_filters(string)
        search_rank = None
        fuzzy_match = None

        if self._postgres:
            ft_filters, search_rank = self._build_fulltext_filters(string)
            tg_filters, fuzzy_match = self._build_trigram(string)
            filters += ft_filters + tg_filters

        if not filters:
            # no search prefs configured — fall back to iexact on all search fields
            query_filter = Q()
            for f in [x + '__unaccent__iexact' if x in self._unaccent_include else x + '__iexact' for x in SearchFields.objects.all().values_list('field', flat=True)]:
                query_filter |= Q(**{"%s" % f: string})
            self._queryset = self._queryset.filter(query_filter).distinct()
            return

        query_filter = Q()
        for f in filters:
            query_filter |= f

        # this creates duplicate records which can screw up other aggregates, see makenow for workaround
        self._queryset = self._queryset.filter(query_filter).distinct()

        if search_rank is not None:
            if fuzzy_match is None:
                self._queryset = self._queryset.annotate(score=Coalesce(Max(search_rank), 0.0))
            else:
                self._queryset = self._queryset.annotate(rank=Coalesce(Max(search_rank), 0.0))

        if fuzzy_match is not None:
            simularity = fuzzy_match.filter(pk=OuterRef('pk')).values('simularity')
            if search_rank is None:
                self._queryset = self._queryset.annotate(score=Coalesce(Subquery(simularity), 0.0))
            else:
                self._queryset = self._queryset.annotate(simularity=Coalesce(Subquery(simularity), 0.0))

        if self._sort_includes('score') and search_rank is not None and fuzzy_match is not None:
            self._queryset = self._queryset.annotate(score=F('rank') + F('simularity'))

    def _build_text_filters(self, string):
        filters = []
        for f in self._icontains_include:
            filters.append(Q(**{"%s__icontains" % f: string}))
        for f in self._istartswith_include:
            filters.append(Q(**{"%s__istartswith" % f: string}))
        return filters

    def _build_fulltext_filters(self, string):
        if not self._fulltext_include:
            return [], None
        vectors = []
        rank = []
        if 'name' in self._fulltext_include:
            vectors.append('name_search_vector')
            rank.append(SearchRank('name_search_vector', self._search_query, cover_density=True))
        if 'description' in self._fulltext_include:
            vectors.append('desc_search_vector')
            rank.append(SearchRank('desc_search_vector', self._search_query, cover_density=True))
        if 'steps__instruction' in self._fulltext_include:
            vectors.append('steps__search_vector')
            rank.append(SearchRank('steps__search_vector', self._search_query, cover_density=True))
        if 'keywords__name' in self._fulltext_include:
            # explicitly settings unaccent on keywords and foods so that they behave the same as search_vector fields
            vectors.append('keywords__name__unaccent')
            rank.append(SearchRank('keywords__name__unaccent', self._search_query, cover_density=True))
        if 'steps__ingredients__food__name' in self._fulltext_include:
            vectors.append('steps__ingredients__food__name__unaccent')
            rank.append(SearchRank('steps__ingredients__food__name', self._search_query, cover_density=True))

        search_rank = None
        for r in rank:
            if search_rank is None:
                search_rank = r
            else:
                search_rank += r
        # modifying queryset will annotation creates duplicate results
        filters = [Q(id__in=Recipe.objects.annotate(vector=SearchVector(*vectors)).filter(Q(vector=self._search_query)))]
        return filters, search_rank

    def _build_trigram(self, string):
        if not self._trigram:
            return [], None
        trigram = None
        for f in self._trigram_include:
            if trigram:
                trigram += TrigramSimilarity(f, string)
            else:
                trigram = TrigramSimilarity(f, string)
        fuzzy_match = (
            Recipe.objects.annotate(trigram=trigram).distinct().annotate(simularity=Max('trigram')
                                                                         ).values('id', 'simularity').filter(simularity__gt=self._search_prefs.trigram_threshold)
        )
        filters = [Q(pk__in=fuzzy_match.values('pk'))]
        return filters, fuzzy_match

    def _cooked_on_filter(self):
        if self._sort_includes('lastcooked') or self._cookedon_gte or self._cookedon_lte:
            self._queryset = self._queryset.annotate(
                lastcooked=Max('cooklog__created_at', filter=Q(cooklog__created_by=self._request.user, cooklog__space=self._request.space))
            )

        if self._cookedon_lte:
            self._queryset = self._queryset.filter(lastcooked__date__lte=self._cookedon_lte)
        if self._cookedon_gte:
            self._queryset = self._queryset.filter(lastcooked__date__gte=self._cookedon_gte)

    def _viewed_on_filter(self):
        if self._sort_includes('lastviewed') or self._viewedon_gte or self._viewedon_lte:
            self._queryset = self._queryset.annotate(
                lastviewed=Max('viewlog__created_at', filter=Q(viewlog__created_by=self._request.user, viewlog__space=self._request.space))
            )

        if self._viewedon_lte:
            self._queryset = self._queryset.filter(lastviewed__date__lte=self._viewedon_lte)
        if self._viewedon_gte:
            self._queryset = self._queryset.filter(lastviewed__date__gte=self._viewedon_gte)

    def _created_on_filter(self):
        if self._createdon:
            self._queryset = self._queryset.filter(created_at__date=self._createdon)
        else:
            if self._createdon_lte:
                self._queryset = self._queryset.filter(created_at__date__lte=self._createdon_lte)
            if self._createdon_gte:
                self._queryset = self._queryset.filter(created_at__date__gte=self._createdon_gte)

    def _updated_on_filter(self):
        if self._updatedon:
            self._queryset = self._queryset.filter(updated_at__date=self._updatedon)
        else:
            if self._updatedon_lte:
                self._queryset = self._queryset.filter(updated_at__date__lte=self._updatedon_lte)
            if self._updatedon_gte:
                self._queryset = self._queryset.filter(updated_at__date__gte=self._updatedon_gte)

    def _created_by_filter(self, created_by_user_id=None):
        if created_by_user_id is None:
            return
        self._queryset = self._queryset.filter(created_by__id=created_by_user_id)

    def _new_recipes(self, new_days=7):
        # TODO make new days a user-setting
        if not self._new:
            return
        self._queryset = self._queryset.annotate(new_recipe=Case(
            When(created_at__gte=(timezone.now() - timedelta(days=new_days)), then=('pk')),
            default=Value(0),
        ))

    def _recently_viewed(self, num_recent=None):
        if not num_recent:
            return

        num_recent_recipes = (
            ViewLog.objects.filter(created_by=self._request.user, space=self._request.space).values('recipe').annotate(recent=Max('created_at')).order_by('-recent')[:num_recent]
        )
        self._queryset = self._queryset.annotate(recent=Coalesce(Max(Case(When(pk__in=num_recent_recipes.values('recipe'), then='viewlog__pk'))), Value(0)))

    def _favorite_recipes(self):
        if self._sort_includes('favorite') or self._timescooked is not None or self._timescooked_gte is not None or self._timescooked_lte is not None:
            self._queryset = self._queryset.annotate(
                favorite=Count('cooklog__pk', filter=Q(cooklog__created_by=self._request.user, cooklog__space=self._request.space), distinct=True)
            )

        if self._timescooked is not None:
            self._queryset = self._queryset.filter(favorite=self._timescooked)
        else:
            if self._timescooked_lte is not None:
                self._queryset = self._queryset.filter(favorite__lte=int(self._timescooked_lte)).exclude(favorite=0)
            if self._timescooked_gte is not None:
                self._queryset = self._queryset.filter(favorite__gte=int(self._timescooked_gte))

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

    def rating_filter(self):
        if self._rating or self._rating_lte or self._rating_gte or self._sort_includes('rating'):
            self._queryset = self._queryset.annotate(
                rating=Round(Avg('cooklog__rating', filter=Q(cooklog__created_by=self._request.user, cooklog__rating__isnull=False)))
            )

        if self._rating:
            if int(self._rating) == 0:
                self._queryset = self._queryset.filter(Q(rating__isnull=True) | Q(rating=0))
            else:
                self._queryset = self._queryset.filter(rating=round(int(self._rating)))
        else:
            if self._rating_gte:
                self._queryset = self._queryset.filter(rating__gte=int(self._rating_gte))
            if self._rating_lte:
                self._queryset = self._queryset.filter(rating__lte=int(self._rating_lte))

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
            steps = [steps]
        self._queryset = self._queryset.filter(steps__id__in=steps)

    def _makenow_filter(self, missing=None):
        if missing is None or (isinstance(missing, bool) and not missing):
            return
        if not self._request.user_space:
            self._queryset = self._queryset.none()
            return

        # Use cached list for simple filters, but wrap as a queryset for
        # substitute subqueries that use OuterRef (needs SQL subquery semantics).
        shopping_user_ids = get_household_user_ids(self._request.user_space)
        shopping_users = User.objects.filter(id__in=shopping_user_ids)

        onhand_filter = (
            Q(steps__ingredients__food__onhand_users__in=shopping_users)  # food onhand
            # or substitute food onhand
            | Q(steps__ingredients__food__substitute__onhand_users__in=shopping_users)
            | Q(steps__ingredients__food__in=children_substitute_filter(shopping_users))
            | Q(steps__ingredients__food__in=sibling_substitute_filter(shopping_users))
        )
        makenow_recipes = Recipe.objects.annotate(
            count_food=Count('steps__ingredients__food__pk', filter=Q(steps__ingredients__food__isnull=False), distinct=True),
            count_onhand=Count('steps__ingredients__food__pk', filter=onhand_filter, distinct=True),
            count_ignore_shopping=Count(
                'steps__ingredients__food__pk', filter=Q(steps__ingredients__food__ignore_shopping=True, steps__ingredients__food__recipe__isnull=True), distinct=True
            ),
            has_child_sub=Case(When(steps__ingredients__food__in=children_substitute_filter(shopping_users), then=Value(1)), default=Value(0)),
            has_sibling_sub=Case(When(steps__ingredients__food__in=sibling_substitute_filter(shopping_users), then=Value(1)), default=Value(0))
        ).annotate(missingfood=F('count_food') - F('count_onhand') - F('count_ignore_shopping')).filter(missingfood__lte=missing)
        self._queryset = self._queryset.distinct().filter(id__in=makenow_recipes.values('id'))
