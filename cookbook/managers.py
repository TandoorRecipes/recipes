from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal

from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector, TrigramSimilarity
from django.db import models
from django.db.models import Avg, Case, Count, DecimalField, F, Max, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone

DICTIONARY = {
    # TODO find custom dictionaries - maybe from here https://www.postgresql.org/message-id/CAF4Au4x6X_wSXFwsQYE8q5o0aQZANrvYjZJ8uOnsiHDnOVPPEg%40mail.gmail.com
    # 'hy': 'Armenian',
    # 'ca': 'Catalan',
    # 'cs': 'Czech',
    'nl': 'dutch',
    'en': 'english',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    # 'lv': 'Latvian',
    'es': 'spanish',
    'sv': 'swedish',
}


@dataclass(frozen=True)
class TextSearchConfig:
    """Immutable configuration for text search, built from user SearchPreference."""
    string: str = ''
    search_type: str = 'plain'
    icontains_fields: tuple[str, ...] = ()
    istartswith_fields: tuple[str, ...] = ()
    fulltext_fields: tuple[str, ...] = ()
    trigram_fields: tuple[str, ...] = ()
    unaccent_fields: tuple[str, ...] = ()
    trigram_threshold: float = 0.1
    use_postgres: bool = False
    search_query: SearchQuery | None = None


class RecipeQuerySet(models.QuerySet):
    """Chainable ORM methods for Recipe filtering, annotation, and availability."""

    # ------------------------------------------------------------------ #
    #  Annotations (idempotent — safe to call multiple times)
    # ------------------------------------------------------------------ #

    def _has_annotation(self, name):
        return name in self.query.annotations

    def with_rating(self, user):
        if self._has_annotation('rating'):
            return self
        return self.annotate(rating=Avg(
            'cooklog__rating',
            # cooklog__rating__gt=0 excludes legacy rating=0 rows (which meant "cleared"
            # under the old overloaded semantic) so they don't poison the average.
            # Post-migration there should be no rating=0 rows, but the filter is defensive.
            filter=Q(cooklog__created_by=user, cooklog__rating__isnull=False, cooklog__rating__gt=0),
            output_field=DecimalField(max_digits=3, decimal_places=2),
        ))

    def with_last_cooked(self, user, space):
        if self._has_annotation('lastcooked'):
            return self
        return self.annotate(lastcooked=Max(
            'cooklog__created_at',
            filter=Q(cooklog__created_by=user, cooklog__space=space),
        ))

    def with_favorite(self, user, space):
        if self._has_annotation('favorite'):
            return self
        return self.annotate(favorite=Count(
            'cooklog__pk',
            filter=Q(cooklog__created_by=user, cooklog__space=space),
            distinct=True,
        ))

    def with_last_viewed(self, user, space):
        if self._has_annotation('lastviewed'):
            return self
        return self.annotate(lastviewed=Max(
            'viewlog__created_at',
            filter=Q(viewlog__created_by=user, viewlog__space=space),
        ))

    def with_new_flag(self, days=7):
        if self._has_annotation('new_recipe'):
            return self
        return self.annotate(new_recipe=Case(
            When(created_at__gte=(timezone.now() - timedelta(days=days)), then=Value(1)),
            default=Value(0),
            output_field=models.IntegerField(),
        ))

    def with_recent(self, user, space, n):
        if self._has_annotation('recent'):
            return self
        from cookbook.models import ViewLog
        recent_recipe_ids = (
            ViewLog.objects.filter(created_by=user, space=space)
            .values('recipe')
            .annotate(latest=Max('created_at'))
            .order_by('-latest')[:n]
        )
        return self.annotate(recent=Case(
            When(pk__in=recent_recipe_ids.values('recipe'), then=Subquery(
                ViewLog.objects.filter(recipe=OuterRef('pk'), created_by=user, space=space)
                .order_by('-created_at')
                .values('pk')[:1]
            )),
            default=Value(0),
        ))

    # ------------------------------------------------------------------ #
    #  Pure filters (no annotation needed)
    # ------------------------------------------------------------------ #

    def by_created_on(self, exact=None, gte=None, lte=None):
        qs = self
        if exact:
            return qs.filter(created_at__date=exact)
        if gte:
            qs = qs.filter(created_at__date__gte=gte)
        if lte:
            qs = qs.filter(created_at__date__lte=lte)
        return qs

    def by_updated_on(self, exact=None, gte=None, lte=None):
        qs = self
        if exact:
            return qs.filter(updated_at__date=exact)
        if gte:
            qs = qs.filter(updated_at__date__gte=gte)
        if lte:
            qs = qs.filter(updated_at__date__lte=lte)
        return qs

    def by_created_by(self, user_id):
        if user_id is None:
            return self
        return self.filter(created_by__id=user_id)

    def by_internal(self, internal):
        if not internal:
            return self
        return self.filter(internal=internal)

    def by_steps(self, step_ids):
        if not step_ids:
            return self
        if not isinstance(step_ids, list):
            step_ids = [step_ids]
        return self.filter(steps__id__in=step_ids)

    def by_units(self, unit_ids):
        if not unit_ids:
            return self
        if not isinstance(unit_ids, list):
            unit_ids = [unit_ids]
        return self.filter(steps__ingredients__unit__in=unit_ids)

    # ------------------------------------------------------------------ #
    #  Annotation + filter methods
    # ------------------------------------------------------------------ #

    def by_rating(self, user, exact=None, gte=None, lte=None):
        if not any(x is not None for x in [exact, gte, lte]):
            return self
        qs = self.with_rating(user)
        if exact is not None:
            # Decimal(str(...)) round-trip avoids float→Decimal precision loss.
            exact_dec = Decimal(str(exact))
            if exact_dec == 0:
                # exact=0 is the canonical "unrated" sentinel — kept for
                # backwards compatibility with existing ?rating=0 URLs.
                return qs.filter(rating__isnull=True)
            # Half-open tolerance band: rating ∈ [exact-0.5, exact+0.5).
            # Matches "round half up" applied at filter time against the true average.
            half = Decimal('0.5')
            return qs.filter(rating__gte=exact_dec - half, rating__lt=exact_dec + half)
        if gte is not None:
            qs = qs.filter(rating__gte=Decimal(str(gte)))
        if lte is not None:
            qs = qs.filter(rating__lte=Decimal(str(lte)))
        return qs

    def by_times_cooked(self, user, space, exact=None, gte=None, lte=None):
        if not any(x is not None for x in [exact, gte, lte]):
            return self
        qs = self.with_favorite(user, space)
        if exact is not None:
            return qs.filter(favorite=exact)
        if lte is not None:
            qs = qs.filter(favorite__lte=int(lte)).exclude(favorite=0)
        if gte is not None:
            qs = qs.filter(favorite__gte=int(gte))
        return qs

    def by_cooked_on(self, user, space, gte=None, lte=None):
        if not gte and not lte:
            return self
        qs = self.with_last_cooked(user, space)
        if lte:
            qs = qs.filter(lastcooked__date__lte=lte)
        if gte:
            qs = qs.filter(lastcooked__date__gte=gte)
        return qs

    def by_viewed_on(self, user, space, gte=None, lte=None):
        if not gte and not lte:
            return self
        qs = self.with_last_viewed(user, space)
        if lte:
            qs = qs.filter(lastviewed__date__lte=lte)
        if gte:
            qs = qs.filter(lastviewed__date__gte=gte)
        return qs

    # ------------------------------------------------------------------ #
    #  Entity filters (OR / AND / NOT)
    # ------------------------------------------------------------------ #

    def by_keywords(self, or_=None, and_=None, or_not=None, and_not=None, include_children=True):
        from cookbook.models import Keyword

        def resolve(pks):
            return Keyword.objects.filter(pk__in=pks)

        def q_or(qs):
            return Q(keywords__in=Keyword.include_descendants(qs) if include_children else qs)

        def q_and(kw):
            return Q(keywords__in=kw.get_descendants_and_self()) if include_children else Q(keywords=kw)

        return self._entity_filter(or_, and_, or_not, and_not, q_or, q_and, resolve=resolve)

    def by_foods(self, or_=None, and_=None, or_not=None, and_not=None, include_children=True):
        from cookbook.models import Food

        def resolve(pks):
            return Food.objects.filter(pk__in=pks)

        def q_or(qs):
            return Q(steps__ingredients__food__in=Food.include_descendants(qs) if include_children else qs)

        def q_and(food):
            return Q(steps__ingredients__food__in=food.get_descendants_and_self()) if include_children else Q(steps__ingredients__food=food)

        return self._entity_filter(or_, and_, or_not, and_not, q_or, q_and, resolve=resolve)

    def by_books(self, or_=None, and_=None, or_not=None, and_not=None):

        def q_or(pks):
            return Q(recipebookentry__book__id__in=pks)

        def q_and(pk):
            return Q(recipebookentry__book__id=pk)

        return self._entity_filter(or_, and_, or_not, and_not, q_or, q_and)

    # ------------------------------------------------------------------ #
    #  Text search
    # ------------------------------------------------------------------ #

    def by_text(self, config):
        if not config or not config.string:
            return self

        filters = (
            [Q(**{f'{f}__icontains': config.string}) for f in config.icontains_fields]
            + [Q(**{f'{f}__istartswith': config.string}) for f in config.istartswith_fields]
        )
        search_rank = None
        fuzzy_match = None

        if config.use_postgres:
            ft_filters, search_rank = self._build_fulltext_filters(config)
            tg_filters, fuzzy_match = self._build_trigram_filters(config)
            filters += ft_filters + tg_filters

        if not filters:
            from cookbook.models import SearchFields
            query_filter = Q()
            for f in SearchFields.objects.all().values_list('field', flat=True):
                lookup = f'{f}__unaccent__iexact' if f in config.unaccent_fields else f'{f}__iexact'
                query_filter |= Q(**{lookup: config.string})
            return self.filter(query_filter)

        query_filter = Q()
        for f in filters:
            query_filter |= f

        qs = self.filter(query_filter)

        has_rank = search_rank is not None
        has_fuzzy = fuzzy_match is not None

        if has_rank:
            qs = qs.annotate(rank=Coalesce(Max(search_rank), 0.0))
        if has_fuzzy:
            similarity = fuzzy_match.filter(pk=OuterRef('pk')).values('similarity')
            qs = qs.annotate(similarity=Coalesce(Subquery(similarity), 0.0))

        if has_rank and has_fuzzy:
            qs = qs.annotate(score=F('rank') + F('similarity'))
        elif has_rank:
            qs = qs.annotate(score=F('rank'))
        elif has_fuzzy:
            qs = qs.annotate(score=F('similarity'))

        return qs

    def _build_fulltext_filters(self, config):
        if not config.fulltext_fields:
            return [], None

        # Fields with pre-computed SearchVectorField + GIN index on Recipe
        _PRECOMPUTED = {
            'name': 'name_search_vector',
            'description': 'desc_search_vector',
            'steps__instruction': 'steps__search_vector',
        }
        # Text fields without stored vectors — need SearchVector() at query time
        _TEXT_FIELDS = {
            'keywords__name': 'keywords__name__unaccent',
            'steps__ingredients__food__name': 'steps__ingredients__food__name__unaccent',
        }
        # Rank map (food name uses raw field for ranking, not unaccent)
        _RANK_MAP = {
            'name': 'name_search_vector',
            'description': 'desc_search_vector',
            'steps__instruction': 'steps__search_vector',
            'keywords__name': 'keywords__name__unaccent',
            'steps__ingredients__food__name': 'steps__ingredients__food__name',
        }

        filters = []
        rank_terms = []
        text_fields = []

        for f in config.fulltext_fields:
            if f in _PRECOMPUTED:
                # Query pre-computed vector directly (uses GIN index)
                filters.append(Q(**{_PRECOMPUTED[f]: config.search_query}))
            elif f in _TEXT_FIELDS:
                text_fields.append(_TEXT_FIELDS[f])

            if f in _RANK_MAP:
                rank_terms.append(SearchRank(_RANK_MAP[f], config.search_query, cover_density=True))

        # Text fields without stored vectors need SearchVector at query time
        if text_fields:
            from cookbook.models import Recipe
            filters.append(Q(id__in=Recipe.objects.annotate(
                vector=SearchVector(*text_fields),
            ).filter(vector=config.search_query)))

        search_rank = None
        for term in rank_terms:
            search_rank = term if search_rank is None else search_rank + term

        return filters, search_rank

    def _build_trigram_filters(self, config):
        if not config.trigram_fields:
            return [], None

        trigram = None
        for f in config.trigram_fields:
            trigram = TrigramSimilarity(f, config.string) if trigram is None else trigram + TrigramSimilarity(f, config.string)

        from cookbook.models import Recipe
        fuzzy_match = (
            Recipe.objects.annotate(trigram=trigram)
            .values('pk')
            .annotate(similarity=Max('trigram'))
            .filter(similarity__gt=config.trigram_threshold)
        )
        return [Q(pk__in=fuzzy_match.values('pk'))], fuzzy_match

    # ------------------------------------------------------------------ #
    #  Availability (makenow)
    # ------------------------------------------------------------------ #

    def cookable(self, household, shopping_users, missing=0):
        from cookbook.helper.food_availability_helper import (
            _is_available, _substitute_available,
            children_substitute_filter, sibling_substitute_filter,
        )
        from cookbook.models import Food, Recipe

        available = _is_available(household, shopping_users)
        ignorable = Q(ignore_shopping=True, recipe__isnull=True)
        resolved = Food.objects.filter(available | _substitute_available(household, shopping_users) | ignorable)
        children_resolved = children_substitute_filter(household, shopping_users)
        siblings_resolved = sibling_substitute_filter(household, shopping_users)

        # Count foods that are needed but not resolved through any path
        makenow_recipes = Recipe.objects.annotate(
            missing_foods=Count(
                'steps__ingredients__food__pk',
                filter=(
                    Q(steps__ingredients__food__isnull=False)
                    & ~Q(steps__ingredients__food__in=resolved)
                    & ~Q(steps__ingredients__food__in=children_resolved)
                    & ~Q(steps__ingredients__food__in=siblings_resolved)
                ),
                distinct=True,
            ),
        ).filter(missing_foods__lte=missing)
        return self.filter(id__in=makenow_recipes.values('id'))

    # ------------------------------------------------------------------ #
    #  Private helpers
    # ------------------------------------------------------------------ #

    def _entity_filter(self, or_pks, and_pks, or_not_pks, and_not_pks,
                       build_q_or, build_q_and, resolve=None):
        if all(v is None for v in [or_pks, and_pks, or_not_pks, and_not_pks]):
            return self
        qs = self
        for pks, mode, negate in [
            (or_pks, 'or', False),
            (and_pks, 'and', False),
            (or_not_pks, 'or', True),
            (and_not_pks, 'and', True),
        ]:
            if not pks:
                continue
            if not isinstance(pks, list):
                pks = [pks]
            items = resolve(pks) if resolve else pks
            if mode == 'or':
                q = build_q_or(items)
                qs = qs.exclude(q) if negate else qs.filter(q)
            else:  # 'and'
                if negate:
                    from cookbook.models import Recipe
                    acc = Recipe.objects.all()
                    for item in items:
                        acc = acc.filter(build_q_and(item))
                    qs = qs.exclude(id__in=acc.values('id'))
                else:
                    for item in items:
                        qs = qs.filter(build_q_and(item))
        return qs
