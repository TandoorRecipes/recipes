from django.db.models import Exists, OuterRef, Q
from django.db.models.functions import Substr

from cookbook.models import Food


def children_substitute_filter(shopping_users):
    """Foods where substitute_children=True and a child food is on-hand."""
    children_onhand_subquery = Food.objects.filter(path__startswith=OuterRef('path'), depth__gt=OuterRef('depth'), onhand_users__in=shopping_users)
    return (
        Food.objects.exclude(
            Q(onhand_users__in=shopping_users) | Q(ignore_shopping=True, recipe__isnull=True) | Q(substitute__onhand_users__in=shopping_users)
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_children=True)
        .annotate(child_onhand_count=Exists(children_onhand_subquery))
        .filter(child_onhand_count=True)
    )


def sibling_substitute_filter(shopping_users):
    """Foods where substitute_siblings=True and a sibling food is on-hand."""
    sibling_onhand_subquery = Food.objects.filter(
        path__startswith=Substr(OuterRef('path'), 1, Food.steplen * (OuterRef('depth') - 1)), depth=OuterRef('depth'), onhand_users__in=shopping_users
    )
    return (
        Food.objects.exclude(
            Q(onhand_users__in=shopping_users) | Q(ignore_shopping=True, recipe__isnull=True) | Q(substitute__onhand_users__in=shopping_users)
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_siblings=True)
        .annotate(sibling_onhand=Exists(sibling_onhand_subquery))
        .filter(sibling_onhand=True)
    )
