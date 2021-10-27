from datetime import timedelta

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import F, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from cookbook.models import UserPreference


def shopping_helper(qs, request):
    supermarket = request.query_params.get('supermarket', None)
    checked = request.query_params.get('checked', 'recent')

    supermarket_order = ['food__supermarket_category__name', 'food__name']

    # TODO created either scheduled task or startup task to delete very old shopping list entries
    # TODO create user preference to define 'very old'

    # qs = qs.annotate(supermarket_category=Coalesce(F('food__supermarket_category__name'), Value(_('Undefined'))))
    # TODO add supermarket to API - order by category order
    if supermarket:
        supermarket_categories = SupermarketCategoryRelation.objects.filter(supermarket=supermarket, category=OuterRef('food__supermarket_category'))
        qs = qs.annotate(supermarket_order=Coalesce(Subquery(supermarket_categories.values('order')), Value(9999)))
        supermarket_order = ['supermarket_order'] + supermarket_order
    if checked in ['false', 0, '0']:
        qs = qs.filter(checked=False)
    elif checked in ['true', 1, '1']:
        qs = qs.filter(checked=True)
    elif checked in ['recent']:
        today_start = timezone.now().replace(hour=0, minute=0, second=0)
        # TODO make recent a user setting
        week_ago = today_start - timedelta(days=7)
        qs = qs.filter(Q(checked=False) | Q(completed_at__gte=week_ago))
        supermarket_order = ['checked'] + supermarket_order

    return qs.order_by(*supermarket_order).select_related('unit', 'food', 'ingredient', 'created_by', 'list_recipe', 'list_recipe__mealplan', 'list_recipe__recipe')
