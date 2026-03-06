from __future__ import annotations

import json
from dataclasses import dataclass, field

from django.contrib.postgres.search import SearchQuery
from django.core.cache import cache
from django.db.models import F, Q
from django.db.models.functions import Lower
from django.utils import translation

from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.permission_helper import get_household_user_ids
from cookbook.managers import DICTIONARY, TextSearchConfig
from cookbook.models import CustomFilter, SearchPreference
from recipes import settings

_NULLS_LAST = frozenset({'lastcooked', 'lastviewed', 'rating'})


def _sort_includes(orderby, *fields):
    for field in fields:
        if field in orderby or f'-{field}' in orderby:
            return True
    return False


def _finalize_ordering(orderby):
    result = []
    for key in orderby:
        if not isinstance(key, str):
            result.append(key)
        elif key == 'name':
            result.append(Lower('name').asc())
        elif key == '-name':
            result.append(Lower('name').desc())
        elif key.lstrip('-') in _NULLS_LAST:
            bare = key.lstrip('-')
            expr = F(bare).desc(nulls_last=True) if key.startswith('-') else F(bare).asc(nulls_last=True)
            result.append(expr)
        else:
            result.append(key)
    return result


def _parse_filter_params(params, prefix):
    return {
        'or': params.get(f'{prefix}_or', None) or params.get(prefix, None),
        'and': params.get(f'{prefix}_and', None),
        'or_not': params.get(f'{prefix}_or_not', None),
        'and_not': params.get(f'{prefix}_and_not', None),
    }


def _parse_makenow(value):
    if isinstance(value, bool) and value is True:
        return 0
    if isinstance(value, str) and value in ('yes', 'true'):
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


@dataclass
class SearchParams:
    """Typed, validated filter parameters parsed from HTTP query params."""
    query: str | None = None
    rating: str | None = None
    rating_gte: str | None = None
    rating_lte: str | None = None
    keywords: dict = field(default_factory=dict)
    foods: dict = field(default_factory=dict)
    books: dict = field(default_factory=dict)
    steps: list | str | None = None
    units: list | str | None = None
    internal: bool | None = None
    sort_order: list | str | None = None
    random: bool = False
    new: bool = False
    num_recent: int = 0
    include_children: bool = True
    timescooked: str | None = None
    timescooked_gte: str | None = None
    timescooked_lte: str | None = None
    createdon: str | None = None
    createdon_gte: str | None = None
    createdon_lte: str | None = None
    updatedon: str | None = None
    updatedon_gte: str | None = None
    updatedon_lte: str | None = None
    viewedon_gte: str | None = None
    viewedon_lte: str | None = None
    cookedon_gte: str | None = None
    cookedon_lte: str | None = None
    createdby: str | int | None = None
    makenow: int | None = None

    @classmethod
    def from_params(cls, params):
        sort_order = params.get('sort_order', None)
        if sort_order == 'random':
            random = True
            sort_order = None
        else:
            random = str2bool(params.get('random', False))

        query_raw = params.get('query', None)

        return cls(
            query=query_raw.strip() if query_raw else None,
            rating=params.get('rating', None),
            rating_gte=params.get('rating_gte', None),
            rating_lte=params.get('rating_lte', None),
            keywords=_parse_filter_params(params, 'keywords'),
            foods=_parse_filter_params(params, 'foods'),
            books=_parse_filter_params(params, 'books'),
            steps=params.get('steps', None),
            units=params.get('units', None),
            internal=str2bool(params.get('internal', None)),
            sort_order=sort_order,
            random=random,
            new=str2bool(params.get('new', False)),
            num_recent=int(params.get('num_recent', 0)),
            include_children=str2bool(params.get('include_children', True)),
            timescooked=params.get('timescooked', None),
            timescooked_gte=params.get('timescooked_gte', None),
            timescooked_lte=params.get('timescooked_lte', None),
            createdon=params.get('createdon', None),
            createdon_gte=params.get('createdon_gte', None),
            createdon_lte=params.get('createdon_lte', None),
            updatedon=params.get('updatedon', None),
            updatedon_gte=params.get('updatedon_gte', None),
            updatedon_lte=params.get('updatedon_lte', None),
            viewedon_gte=params.get('viewedon_gte', None),
            viewedon_lte=params.get('viewedon_lte', None),
            cookedon_gte=params.get('cookedon_gte', None),
            cookedon_lte=params.get('cookedon_lte', None),
            createdby=params.get('createdby', None),
            makenow=_parse_makenow(params.get('makenow', None)),
        )


def _is_postgres():
    return settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'


def _resolve_params(request, params):
    if filter_id := params.get('filter', None):
        custom_filter = (
            CustomFilter.objects.filter(id=filter_id, space=request.space)
            .filter(Q(created_by=request.user) | Q(shared=request.user) | Q(recipebook__shared=request.user))
            .first()
        )
        if custom_filter:
            resolved = {**json.loads(custom_filter.search)}
            if isinstance(resolved.get('rating', None), int):
                resolved['rating'] = str(resolved['rating'])
            return resolved
    return {**(params or {})}


def _load_search_prefs(user):
    if user.is_authenticated:
        cache_key = f'search_pref_{user.id}'
        result = cache.get(cache_key, default=None)
        if result is None:
            result = user.searchpreference
        cache.set(cache_key, result, timeout=10)
        return result
    return SearchPreference()


def _build_text_search_config(string, prefs):
    if not string:
        return None

    use_postgres = _is_postgres()
    search_type = prefs.search or 'plain'

    if use_postgres:
        unaccent = set(prefs.unaccent.values_list('field', flat=True))
    else:
        unaccent = set()

    def _apply_unaccent(fields):
        return tuple(f'{x}__unaccent' if x in unaccent else x for x in fields)

    icontains = _apply_unaccent(prefs.icontains.values_list('field', flat=True))
    istartswith = _apply_unaccent(prefs.istartswith.values_list('field', flat=True))

    trigram_fields = ()
    fulltext_fields = ()
    search_query = None

    if use_postgres:
        language = DICTIONARY.get(translation.get_language(), 'simple')
        trigram_fields = _apply_unaccent(prefs.trigram.values_list('field', flat=True))
        fulltext_fields = tuple(prefs.fulltext.values_list('field', flat=True)) or ()

        if search_type in ('websearch', 'raw'):
            trigram_fields = ()

        search_query = SearchQuery(string, search_type=search_type, config=language)

    return TextSearchConfig(
        string=string,
        search_type=search_type,
        icontains_fields=icontains,
        istartswith_fields=istartswith,
        fulltext_fields=fulltext_fields,
        trigram_fields=trigram_fields,
        unaccent_fields=tuple(unaccent),
        trigram_threshold=prefs.trigram_threshold,
        use_postgres=use_postgres,
        search_query=search_query,
    )


# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
class RecipeSearch:

    def __init__(self, request, **params):
        self._request = request
        resolved = _resolve_params(request, params)
        self._prefs = _load_search_prefs(request.user)
        self._params = SearchParams.from_params(resolved)
        self._text_config = _build_text_search_config(self._params.query, self._prefs)

    def get_queryset(self, queryset):
        params = self._params
        qs = queryset.prefetch_related('keywords')
        user, space = self._request.user, self._request.space

        orderby = self._build_sort_order()

        # Sort-only annotations (idempotent — filter methods below won't duplicate)
        if _sort_includes(orderby, 'rating'):
            qs = qs.with_rating(user)
        if _sort_includes(orderby, 'lastcooked'):
            qs = qs.with_last_cooked(user, space)
        if _sort_includes(orderby, 'lastviewed'):
            qs = qs.with_last_viewed(user, space)
        if _sort_includes(orderby, 'favorite'):
            qs = qs.with_favorite(user, space)
        if params.num_recent:
            qs = qs.with_recent(user, space, params.num_recent)
        if params.new:
            qs = qs.with_new_flag()

        # Annotation + filter methods
        qs = qs.by_rating(user, exact=params.rating, gte=params.rating_gte, lte=params.rating_lte)
        qs = qs.by_times_cooked(user, space, exact=params.timescooked, gte=params.timescooked_gte, lte=params.timescooked_lte)
        qs = qs.by_cooked_on(user, space, gte=params.cookedon_gte, lte=params.cookedon_lte)
        qs = qs.by_viewed_on(user, space, gte=params.viewedon_gte, lte=params.viewedon_lte)

        # Pure filters
        qs = qs.by_created_on(exact=params.createdon, gte=params.createdon_gte, lte=params.createdon_lte)
        qs = qs.by_updated_on(exact=params.updatedon, gte=params.updatedon_gte, lte=params.updatedon_lte)
        qs = qs.by_created_by(params.createdby)
        qs = qs.by_internal(params.internal)
        qs = qs.by_steps(params.steps)
        qs = qs.by_units(params.units)

        # Entity filters
        qs = qs.by_keywords(
            or_=params.keywords['or'], and_=params.keywords['and'],
            or_not=params.keywords['or_not'], and_not=params.keywords['and_not'],
            include_children=params.include_children,
        )
        qs = qs.by_foods(
            or_=params.foods['or'], and_=params.foods['and'],
            or_not=params.foods['or_not'], and_not=params.foods['and_not'],
            include_children=params.include_children,
        )
        qs = qs.by_books(
            or_=params.books['or'], and_=params.books['and'],
            or_not=params.books['or_not'], and_not=params.books['and_not'],
        )

        # Makenow
        if params.makenow is not None:
            if not self._request.user_space:
                qs = qs.none()
            else:
                household = getattr(self._request.user_space, 'household', None)
                shopping_users = get_household_user_ids(self._request.user_space)
                qs = qs.cookable(household, shopping_users, missing=params.makenow)

        # Text search
        qs = qs.by_text(self._text_config)

        return qs.distinct().order_by(*_finalize_ordering(orderby))

    def _build_sort_order(self):
        params = self._params
        if params.random:
            return ['?']

        order = []
        # TODO add userpreference for default sort order and replace '-favorite'
        default_order = ['name']
        # recent and new_recipe are always first; they float a few recipes to the top
        if params.num_recent:
            order += ['-recent']
        if params.new:
            order += ['-new_recipe']

        # if a sort order is provided by user - use that order
        if params.sort_order:
            if not isinstance(params.sort_order, list):
                order += [params.sort_order]
            else:
                order += params.sort_order
            if not _is_postgres() or not params.query:
                if 'score' in order:
                    order.remove('score')
                if '-score' in order:
                    order.remove('-score')
        # if no sort order provided prioritize text search, followed by the default search
        elif self._text_config and (self._text_config.trigram_fields or self._text_config.fulltext_fields):
            order += ['-score', *default_order]
        # otherwise sort by the remaining order_by attributes or favorite by default
        else:
            order += default_order
        return order
