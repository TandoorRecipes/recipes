import json

from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector, TrigramSimilarity
from django.core.cache import cache
from django.db.models import F, Max, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce, Lower
from django.utils import translation

from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.permission_helper import get_household_user_ids
from cookbook.managers import DICTIONARY
from cookbook.models import CustomFilter, Recipe, SearchFields, SearchPreference
from recipes import settings


# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch():
    _postgres = settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'

    def __init__(self, request, **params):
        self._request = request
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
            self._sort_order = None
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

    # ------------------------------------------------------------------ #
    #  Main entry point
    # ------------------------------------------------------------------ #

    def get_queryset(self, queryset):
        qs = queryset.prefetch_related('keywords')
        u, s = self._request.user, self._request.space

        self._build_sort_order()

        # Sort-only annotations
        if self._sort_includes('rating') and not self._rating and not self._rating_gte and not self._rating_lte:
            qs = qs.with_rating(u)
        if self._sort_includes('lastcooked') and not self._cookedon_gte and not self._cookedon_lte:
            qs = qs.with_last_cooked(u, s)
        if self._sort_includes('lastviewed') and not self._viewedon_gte and not self._viewedon_lte:
            qs = qs.with_last_viewed(u, s)
        if self._sort_includes('favorite') and not any(x is not None for x in [self._timescooked, self._timescooked_gte, self._timescooked_lte]):
            qs = qs.with_favorite(u, s)
        if self._num_recent:
            qs = qs.with_recent(u, s, self._num_recent)
        if self._new:
            qs = qs.with_new_flag()

        # Annotation + filter methods
        qs = qs.by_rating(u, exact=self._rating, gte=self._rating_gte, lte=self._rating_lte)
        qs = qs.by_times_cooked(u, s, exact=self._timescooked, gte=self._timescooked_gte, lte=self._timescooked_lte)
        qs = qs.by_cooked_on(u, s, gte=self._cookedon_gte, lte=self._cookedon_lte)
        qs = qs.by_viewed_on(u, s, gte=self._viewedon_gte, lte=self._viewedon_lte)

        # Pure filters
        qs = qs.by_created_on(exact=self._createdon, gte=self._createdon_gte, lte=self._createdon_lte)
        qs = qs.by_updated_on(exact=self._updatedon, gte=self._updatedon_gte, lte=self._updatedon_lte)
        qs = qs.by_created_by(self._createdby)
        qs = qs.by_internal(self._internal)
        qs = qs.by_steps(self._steps)
        qs = qs.by_units(self._units)

        # Entity filters
        kw = self._keywords
        qs = qs.by_keywords(or_=kw['or'], and_=kw['and'], or_not=kw['or_not'], and_not=kw['and_not'], include_children=self._include_children)
        fd = self._foods
        qs = qs.by_foods(or_=fd['or'], and_=fd['and'], or_not=fd['or_not'], and_not=fd['and_not'], include_children=self._include_children)
        bk = self._books
        qs = qs.by_books(or_=bk['or'], and_=bk['and'], or_not=bk['or_not'], and_not=bk['and_not'])

        # Makenow
        if self._makenow is not None:
            if not self._request.user_space:
                qs = qs.none()
            else:
                household = getattr(self._request.user_space, 'household', None)
                shopping_users = get_household_user_ids(self._request.user_space)
                qs = qs.cookable(household, shopping_users, missing=self._makenow)

        # Text search (stays in orchestrator — depends on SearchPreference config)
        qs = self._apply_text_search(qs)

        # Finalize ordering with nulls_last for nullable annotation fields
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

        return qs.filter(space=s).distinct().order_by(*final_order)

    # ------------------------------------------------------------------ #
    #  Sort order
    # ------------------------------------------------------------------ #

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

    # ------------------------------------------------------------------ #
    #  Text search (stays in orchestrator)
    # ------------------------------------------------------------------ #

    def _apply_text_search(self, qs):
        if not self._string:
            return qs

        filters = self._build_text_filters(self._string)
        search_rank = None
        fuzzy_match = None

        if self._postgres:
            ft_filters, search_rank = self._build_fulltext_filters(self._string)
            tg_filters, fuzzy_match = self._build_trigram(self._string)
            filters += ft_filters + tg_filters

        if not filters:
            # no search prefs configured — fall back to iexact on all search fields
            query_filter = Q()
            for f in [x + '__unaccent__iexact' if x in self._unaccent_include else x + '__iexact' for x in SearchFields.objects.all().values_list('field', flat=True)]:
                query_filter |= Q(**{"%s" % f: self._string})
            return qs.filter(query_filter).distinct()

        query_filter = Q()
        for f in filters:
            query_filter |= f

        # this creates duplicate records which can screw up other aggregates, see makenow for workaround
        qs = qs.filter(query_filter).distinct()

        if search_rank is not None:
            if fuzzy_match is None:
                qs = qs.annotate(score=Coalesce(Max(search_rank), 0.0))
            else:
                qs = qs.annotate(rank=Coalesce(Max(search_rank), 0.0))

        if fuzzy_match is not None:
            similarity = fuzzy_match.filter(pk=OuterRef('pk')).values('similarity')
            if search_rank is None:
                qs = qs.annotate(score=Coalesce(Subquery(similarity), 0.0))
            else:
                qs = qs.annotate(similarity=Coalesce(Subquery(similarity), 0.0))

        if self._sort_includes('score') and search_rank is not None and fuzzy_match is not None:
            qs = qs.annotate(score=F('rank') + F('similarity'))

        return qs

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
            Recipe.objects.annotate(trigram=trigram).distinct().annotate(similarity=Max('trigram')
                                                                         ).values('id', 'similarity').filter(similarity__gt=self._search_prefs.trigram_threshold)
        )
        filters = [Q(pk__in=fuzzy_match.values('pk'))]
        return filters, fuzzy_match

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

    def _apply_entity_filter(self, kwargs, build_q_or, build_q_and, resolve=None):
        """Shared OR/AND/NOT dispatch for entity filters.

        Args:
            kwargs: dict with keys like 'or', 'and', 'or_not', 'and_not' → PK lists
            build_q_or(entities_or_pks): Q for the OR case (entire collection)
            build_q_and(entity_or_pk): Q for a single AND item
            resolve(pks): optional callable to batch-fetch model instances from PKs
        """
        if all(v is None for v in kwargs.values()):
            return
        for key, pks in kwargs.items():
            if not pks:
                continue
            if not isinstance(pks, list):
                pks = [pks]
            negate = 'not' in key
            items = resolve(pks) if resolve else pks
            if 'or' in key:
                q = build_q_or(items)
                if negate:
                    self._queryset = self._queryset.exclude(q)
                else:
                    self._queryset = self._queryset.filter(q)
            elif 'and' in key:
                if negate:
                    acc = Recipe.objects.all()
                    for item in items:
                        acc = acc.filter(build_q_and(item))
                    self._queryset = self._queryset.exclude(id__in=acc.values('id'))
                else:
                    for item in items:
                        self._queryset = self._queryset.filter(build_q_and(item))

    def keyword_filters(self, **kwargs):
        def resolve(pks):
            return Keyword.objects.filter(pk__in=pks)

        def q_or(qs):
            return Q(keywords__in=Keyword.include_descendants(qs) if self._include_children else qs)

        def q_and(kw):
            return Q(keywords__in=kw.get_descendants_and_self()) if self._include_children else Q(keywords=kw)

        self._apply_entity_filter(kwargs, q_or, q_and, resolve=resolve)

    def food_filters(self, **kwargs):
        def resolve(pks):
            return Food.objects.filter(pk__in=pks)

        def q_or(qs):
            return Q(steps__ingredients__food__in=Food.include_descendants(qs) if self._include_children else qs)

        def q_and(food):
            return Q(steps__ingredients__food__in=food.get_descendants_and_self()) if self._include_children else Q(steps__ingredients__food=food)

        self._apply_entity_filter(kwargs, q_or, q_and, resolve=resolve)

    def unit_filters(self, units=None):
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
        def q_or(pks):
            return Q(recipebookentry__book__id__in=pks)

        def q_and(pk):
            return Q(recipebookentry__book__id=pk)

        self._apply_entity_filter(kwargs, q_or, q_and)

    def step_filters(self, steps=None):
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

        household = getattr(self._request.user_space, 'household', None)
        shopping_users = get_household_user_ids(self._request.user_space)
        onhand_filter = recipe_availability_filter(household, shopping_users)
        makenow_recipes = Recipe.objects.annotate(
            count_food=Count('steps__ingredients__food__pk', filter=Q(steps__ingredients__food__isnull=False), distinct=True),
            count_onhand=Count('steps__ingredients__food__pk', filter=onhand_filter, distinct=True),
            count_ignore_shopping=Count(
                'steps__ingredients__food__pk', filter=Q(steps__ingredients__food__ignore_shopping=True, steps__ingredients__food__recipe__isnull=True), distinct=True
            ),
        ).annotate(missingfood=F('count_food') - F('count_onhand') - F('count_ignore_shopping')).filter(missingfood__lte=missing)
        self._queryset = self._queryset.distinct().filter(id__in=makenow_recipes.values('id'))
