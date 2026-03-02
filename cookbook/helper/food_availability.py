from django.db.models import Exists, OuterRef, Q
from django.db.models.functions import Substr

from cookbook.models import Food


def _in_inventory(household):
    """Q filter (Food-level): food has inventory with amount > 0."""
    return Q(
        inventoryentry__amount__gt=0,
        inventoryentry__inventory_location__household=household,
    )


def _substitute_in_inventory(household):
    """Q filter (Food-level): explicit substitute food is in inventory."""
    return Q(
        substitute__inventoryentry__amount__gt=0,
        substitute__inventoryentry__inventory_location__household=household,
    )


def children_substitute_filter(household):
    """Food QS: foods with substitute_children=True and a child in inventory."""
    in_inv = _in_inventory(household)
    sub_inv = _substitute_in_inventory(household)
    children_in_inv = Food.objects.filter(
        path__startswith=OuterRef('path'),
        depth__gt=OuterRef('depth'),
    ).filter(in_inv)
    return (
        Food.objects.exclude(
            in_inv | Q(ignore_shopping=True, recipe__isnull=True) | sub_inv
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_children=True)
        .annotate(child_in_inventory=Exists(children_in_inv))
        .filter(child_in_inventory=True)
    )


def sibling_substitute_filter(household):
    """Food QS: foods with substitute_siblings=True and a sibling in inventory."""
    in_inv = _in_inventory(household)
    sub_inv = _substitute_in_inventory(household)
    sibling_in_inv = Food.objects.filter(
        path__startswith=Substr(OuterRef('path'), 1, Food.steplen * (OuterRef('depth') - 1)),
        depth=OuterRef('depth'),
    ).filter(in_inv)
    return (
        Food.objects.exclude(
            in_inv | Q(ignore_shopping=True, recipe__isnull=True) | sub_inv
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_siblings=True)
        .annotate(sibling_in_inventory=Exists(sibling_in_inv))
        .filter(sibling_in_inventory=True)
    )


def recipe_availability_filter(household):
    """Q filter (Recipe-level): composed filter for all 4 availability paths.

    Returns Q object to be used as: Count('steps__ingredients__food__pk', filter=THIS)
    """
    P = 'steps__ingredients__food__'
    direct = Q(**{
        f'{P}inventoryentry__amount__gt': 0,
        f'{P}inventoryentry__inventory_location__household': household,
    })
    substitute = Q(**{
        f'{P}substitute__inventoryentry__amount__gt': 0,
        f'{P}substitute__inventoryentry__inventory_location__household': household,
    })
    children = Q(**{f'{P}in': children_substitute_filter(household)})
    siblings = Q(**{f'{P}in': sibling_substitute_filter(household)})
    return direct | substitute | children | siblings
