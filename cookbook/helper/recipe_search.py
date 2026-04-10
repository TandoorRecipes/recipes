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
    for f in fields:
        if f in orderby or f'-{f}' in orderby:
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
    units: dict = field(default_factory=dict)
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
    unrated: bool = False
    working_time_gte: int | None = None
    working_time_lte: int | None = None
    waiting_time_gte: int | None = None
    waiting_time_lte: int | None = None
    servings_gte: int | None = None
    servings_lte: int | None = None
    total_time_gte: int | None = None
    total_time_lte: int | None = None
    has_photo: bool | None = None
    has_keywords: bool | None = None

    @staticmethod
    def _parse_makenow(value):
        if isinstance(value, bool) and value is True:
            return 0
        if isinstance(value, str) and value in ('yes', 'true'):
            return 0
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _scalar(params, key, default=None):
        """Last-wins scalar extraction. Handles lists from duplicate query params."""
        v = params.get(key, default)
        if isinstance(v, list):
            return v[-1] if v else default
        return v

    @classmethod
    def from_params(cls, params):
        _s = cls._scalar

        sort_order = _s(params, 'sort_order')
        if sort_order == 'random':
            random = True
            sort_order = None
        else:
            random = str2bool(_s(params, 'random', False))

        query_raw = _s(params, 'query')

        def _str_or_none(val):
            return str(val) if val is not None else None

        return cls(
            query=query_raw.strip() if query_raw else None,
            rating=_str_or_none(_s(params, 'rating')),
            rating_gte=_str_or_none(_s(params, 'rating_gte')),
            rating_lte=_str_or_none(_s(params, 'rating_lte')),
            keywords=_parse_filter_params(params, 'keywords'),
            foods=_parse_filter_params(params, 'foods'),
            books=_parse_filter_params(params, 'books'),
            steps=params.get('steps', None),
            units=_parse_filter_params(params, 'units'),
            internal=str2bool(_s(params, 'internal')),
            sort_order=sort_order,
            random=random,
            new=str2bool(_s(params, 'new', False)),
            num_recent=int(_s(params, 'num_recent', 0)),
            include_children=str2bool(_s(params, 'include_children', True)),
            timescooked=_s(params, 'timescooked'),
            timescooked_gte=_s(params, 'timescooked_gte'),
            timescooked_lte=_s(params, 'timescooked_lte'),
            createdon=_s(params, 'createdon'),
            createdon_gte=_s(params, 'createdon_gte'),
            createdon_lte=_s(params, 'createdon_lte'),
            updatedon=_s(params, 'updatedon'),
            updatedon_gte=_s(params, 'updatedon_gte'),
            updatedon_lte=_s(params, 'updatedon_lte'),
            viewedon_gte=_s(params, 'viewedon_gte'),
            viewedon_lte=_s(params, 'viewedon_lte'),
            cookedon_gte=_s(params, 'cookedon_gte'),
            cookedon_lte=_s(params, 'cookedon_lte'),
            createdby=_s(params, 'createdby'),
            makenow=cls._parse_makenow(_s(params, 'makenow')),
            unrated=str2bool(_s(params, 'unrated', False)),
            working_time_gte=int(_s(params, 'working_time_gte')) if _s(params, 'working_time_gte') else None,
            working_time_lte=int(_s(params, 'working_time_lte')) if _s(params, 'working_time_lte') else None,
            waiting_time_gte=int(_s(params, 'waiting_time_gte')) if _s(params, 'waiting_time_gte') else None,
            waiting_time_lte=int(_s(params, 'waiting_time_lte')) if _s(params, 'waiting_time_lte') else None,
            servings_gte=int(_s(params, 'servings_gte')) if _s(params, 'servings_gte') else None,
            servings_lte=int(_s(params, 'servings_lte')) if _s(params, 'servings_lte') else None,
            total_time_gte=int(_s(params, 'total_time_gte')) if _s(params, 'total_time_gte') else None,
            total_time_lte=int(_s(params, 'total_time_lte')) if _s(params, 'total_time_lte') else None,
            has_photo=str2bool(_s(params, 'has_photo')),
            has_keywords=str2bool(_s(params, 'has_keywords')),
        )


def _is_postgres():
    return settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'


def _resolve_params(request, params):
    """Merge CustomFilter base (if any) with HTTP params. HTTP wins on conflict."""
    base = {}

    if hasattr(params, 'lists'):
        http_params = {}
        for k, vs in params.lists():
            http_params[k] = vs if len(vs) > 1 else vs[0]
    else:
        http_params = {**(params or {})}

    if filter_id := http_params.pop('filter', None):
        custom_filter = (
            CustomFilter.objects.filter(id=filter_id, space=request.space)
            .filter(Q(created_by=request.user) | Q(shared=request.user) | Q(recipebook__shared=request.user))
            .distinct()
            .first()
        )
        if custom_filter:
            search_data = custom_filter.search if isinstance(custom_filter.search, dict) else {}
            base = {**search_data}

    # Layer HTTP params on top of filter base — non-empty HTTP params win
    for key, value in http_params.items():
        if value is not None and value != '' and value != []:
            base[key] = value

    return base


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
    unaccent = set(prefs.unaccent.values_list('field', flat=True)) if use_postgres else set()

    def with_unaccent(fields):
        return tuple(f'{x}__unaccent' if x in unaccent else x for x in fields)

    # Common fields (all backends)
    icontains = with_unaccent(prefs.icontains.values_list('field', flat=True))
    istartswith = with_unaccent(prefs.istartswith.values_list('field', flat=True))

    # Postgres-only fields
    trigram_fields = ()
    fulltext_fields = ()
    search_query = None
    if use_postgres:
        language = DICTIONARY.get(translation.get_language(), 'simple')
        search_query = SearchQuery(string, search_type=search_type, config=language)
        fulltext_fields = tuple(prefs.fulltext.values_list('field', flat=True))
        # websearch/raw modes don't support trigram
        if search_type not in ('websearch', 'raw'):
            trigram_fields = with_unaccent(prefs.trigram.values_list('field', flat=True))

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

    def __init__(self, request, params=None, **kwargs):
        self._request = request
        resolved = _resolve_params(request, params if params is not None else kwargs)
        self._prefs = _load_search_prefs(request.user)
        self._params = SearchParams.from_params(resolved)
        self._text_config = _build_text_search_config(self._params.query, self._prefs)

    def get_queryset(self, queryset):
        params = self._params
        qs = queryset
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
        if params.unrated:
            qs = qs.with_rating(user).filter(rating__isnull=True)
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
        qs = qs.by_units(
            or_=params.units['or'], and_=params.units['and'],
            or_not=params.units['or_not'], and_not=params.units['and_not'],
        )

        if params.working_time_gte is not None:
            qs = qs.filter(working_time__gte=params.working_time_gte)
        if params.working_time_lte is not None:
            qs = qs.filter(working_time__lte=params.working_time_lte)
        if params.waiting_time_gte is not None:
            qs = qs.filter(waiting_time__gte=params.waiting_time_gte)
        if params.waiting_time_lte is not None:
            qs = qs.filter(waiting_time__lte=params.waiting_time_lte)
        if params.total_time_gte is not None or params.total_time_lte is not None:
            qs = qs.annotate(total_time=F('working_time') + F('waiting_time'))
            if params.total_time_gte is not None:
                qs = qs.filter(total_time__gte=params.total_time_gte)
            if params.total_time_lte is not None:
                qs = qs.filter(total_time__lte=params.total_time_lte)
        if params.servings_gte is not None:
            qs = qs.filter(servings__gte=params.servings_gte)
        if params.servings_lte is not None:
            qs = qs.filter(servings__lte=params.servings_lte)
        if params.has_photo is True:
            qs = qs.exclude(image__isnull=True).exclude(image='')
        elif params.has_photo is False:
            qs = qs.filter(Q(image__isnull=True) | Q(image=''))
        if params.has_keywords is True:
            qs = qs.filter(keywords__isnull=False).distinct()
        elif params.has_keywords is False:
            qs = qs.filter(keywords__isnull=True)

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

        # Pinned sorts: float recent/new recipes to the top
        order = []
        if params.num_recent:
            order.append('-recent')
        if params.new:
            order.append('-new_recipe')

        # User-specified sort order
        if params.sort_order:
            user_order = params.sort_order if isinstance(params.sort_order, list) else [params.sort_order]
            # score only works with postgres fulltext/trigram search
            has_scoring = _is_postgres() and params.query
            order += [s for s in user_order if s not in ('score', '-score') or has_scoring]
        elif self._text_config and (self._text_config.trigram_fields or self._text_config.fulltext_fields):
            # No user sort, but text search active: rank by relevance then name
            order += ['-score', 'name']
        else:
            order.append('name')

        return order
