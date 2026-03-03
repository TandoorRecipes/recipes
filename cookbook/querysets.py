from datetime import timedelta

from django.db import models
from django.db.models import Avg, Case, Count, F, Func, Max, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone


class _Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


class RecipeQuerySet(models.QuerySet):
    """Chainable ORM methods for Recipe filtering, annotation, and availability."""

    # ------------------------------------------------------------------ #
    #  Annotations (for sort / serializer)
    # ------------------------------------------------------------------ #

    def with_rating(self, user):
        return self.annotate(
            rating=_Round(Avg(
                'cooklog__rating',
                filter=Q(cooklog__created_by=user, cooklog__rating__isnull=False),
            ))
        )

    def with_last_cooked(self, user, space):
        return self.annotate(
            lastcooked=Max(
                'cooklog__created_at',
                filter=Q(cooklog__created_by=user, cooklog__space=space),
            )
        )

    def with_favorite(self, user, space):
        return self.annotate(
            favorite=Count(
                'cooklog__pk',
                filter=Q(cooklog__created_by=user, cooklog__space=space),
                distinct=True,
            )
        )

    def with_last_viewed(self, user, space):
        return self.annotate(
            lastviewed=Max(
                'viewlog__created_at',
                filter=Q(viewlog__created_by=user, viewlog__space=space),
            )
        )

    def with_new_flag(self, days=7):
        return self.annotate(new_recipe=Case(
            When(created_at__gte=(timezone.now() - timedelta(days=days)), then='pk'),
            default=Value(0),
        ))

    def with_recent(self, user, space, n):
        from cookbook.models import ViewLog
        num_recent_recipes = (
            ViewLog.objects.filter(created_by=user, space=space)
            .values('recipe')
            .annotate(recent=Max('created_at'))
            .order_by('-recent')[:n]
        )
        return self.annotate(
            recent=Coalesce(
                Max(Case(When(pk__in=num_recent_recipes.values('recipe'), then='viewlog__pk'))),
                Value(0),
            )
        )

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
        return self.filter(steps__id__in=step_ids).distinct()

    def by_units(self, unit_ids):
        if not unit_ids:
            return self
        if not isinstance(unit_ids, list):
            unit_ids = [unit_ids]
        return self.filter(steps__ingredients__unit__in=unit_ids).distinct()

    # ------------------------------------------------------------------ #
    #  Annotation + filter methods
    # ------------------------------------------------------------------ #

    def by_rating(self, user, exact=None, gte=None, lte=None):
        if not any([exact, gte, lte]):
            return self
        qs = self.with_rating(user)
        if exact is not None:
            if int(exact) == 0:
                return qs.filter(Q(rating__isnull=True) | Q(rating=0))
            return qs.filter(rating=round(int(exact)))
        if gte is not None:
            qs = qs.filter(rating__gte=int(gte))
        if lte is not None:
            qs = qs.filter(rating__lte=int(lte))
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

        return self._entity_filter(
            {'or': or_, 'and': and_, 'or_not': or_not, 'and_not': and_not},
            q_or, q_and, resolve=resolve,
        )

    def by_foods(self, or_=None, and_=None, or_not=None, and_not=None, include_children=True):
        from cookbook.models import Food

        def resolve(pks):
            return Food.objects.filter(pk__in=pks)

        def q_or(qs):
            return Q(steps__ingredients__food__in=Food.include_descendants(qs) if include_children else qs)

        def q_and(food):
            return Q(steps__ingredients__food__in=food.get_descendants_and_self()) if include_children else Q(steps__ingredients__food=food)

        return self._entity_filter(
            {'or': or_, 'and': and_, 'or_not': or_not, 'and_not': and_not},
            q_or, q_and, resolve=resolve,
        )

    def by_books(self, or_=None, and_=None, or_not=None, and_not=None):
        def q_or(pks):
            return Q(recipebookentry__book__id__in=pks)

        def q_and(pk):
            return Q(recipebookentry__book__id=pk)

        return self._entity_filter(
            {'or': or_, 'and': and_, 'or_not': or_not, 'and_not': and_not},
            q_or, q_and,
        )

    # ------------------------------------------------------------------ #
    #  Availability (makenow)
    # ------------------------------------------------------------------ #

    def cookable(self, household, shopping_users, missing=0):
        from cookbook.helper.food_availability_helper import recipe_availability_filter
        from cookbook.models import Recipe

        onhand_filter = recipe_availability_filter(household, shopping_users)
        makenow_recipes = Recipe.objects.annotate(
            count_food=Count(
                'steps__ingredients__food__pk',
                filter=Q(steps__ingredients__food__isnull=False),
                distinct=True,
            ),
            count_onhand=Count(
                'steps__ingredients__food__pk',
                filter=onhand_filter,
                distinct=True,
            ),
            count_ignore_shopping=Count(
                'steps__ingredients__food__pk',
                filter=Q(
                    steps__ingredients__food__ignore_shopping=True,
                    steps__ingredients__food__recipe__isnull=True,
                ),
                distinct=True,
            ),
        ).annotate(
            missingfood=F('count_food') - F('count_onhand') - F('count_ignore_shopping')
        ).filter(missingfood__lte=missing)
        return self.distinct().filter(id__in=makenow_recipes.values('id'))

    # ------------------------------------------------------------------ #
    #  Private helpers
    # ------------------------------------------------------------------ #

    def _entity_filter(self, kwargs, build_q_or, build_q_and, resolve=None):
        if all(v is None for v in kwargs.values()):
            return self
        qs = self
        applied = False
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
                    qs = qs.exclude(q)
                else:
                    qs = qs.filter(q)
                applied = True
            elif 'and' in key:
                if negate:
                    from cookbook.models import Recipe
                    acc = Recipe.objects.all()
                    for item in items:
                        acc = acc.filter(build_q_and(item))
                    qs = qs.exclude(id__in=acc.values('id'))
                else:
                    for item in items:
                        qs = qs.filter(build_q_and(item))
                applied = True
        # M2M joins can produce duplicates
        return qs.distinct() if applied else qs
