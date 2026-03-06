from django.db.models import Exists, OuterRef, Q
from django.db.models.functions import Substr

from cookbook.models import Food


def _is_available(household, shopping_users):
    q = Q(onhand_users__in=shopping_users)
    if household is not None:
        q = q | Q(
            inventoryentry__amount__gt=0,
            inventoryentry__inventory_location__household=household,
        )
    return q


def _substitute_available(household, shopping_users):
    q = Q(substitute__onhand_users__in=shopping_users)
    if household is not None:
        q = q | Q(
            substitute__inventoryentry__amount__gt=0,
            substitute__inventoryentry__inventory_location__household=household,
        )
    return q


def _already_resolved(household, shopping_users):
    """Foods already resolved via direct availability, substitutes, or ignore_shopping."""
    return (
        _is_available(household, shopping_users)
        | _substitute_available(household, shopping_users)
        | Q(ignore_shopping=True, recipe__isnull=True)
    )


def _tree_substitute_filter(household, shopping_users, *, tree_field, tree_q):
    """Common logic for children/sibling substitute filters.

    Args:
        tree_field: The boolean field to filter on ('substitute_children' or 'substitute_siblings').
        tree_q: Q filter for related foods in the tree (children or siblings).
    """
    available = _is_available(household, shopping_users)
    related_available = Food.objects.filter(tree_q).filter(available)
    return (
        Food.objects.exclude(_already_resolved(household, shopping_users))
        .exclude(depth=1, numchild=0)
        .filter(**{tree_field: True})
        .annotate(has_available_relative=Exists(related_available))
        .filter(has_available_relative=True)
    )


def children_substitute_filter(household, shopping_users):
    return _tree_substitute_filter(
        household, shopping_users,
        tree_field='substitute_children',
        tree_q=Q(path__startswith=OuterRef('path'), depth__gt=OuterRef('depth')),
    )


def sibling_substitute_filter(household, shopping_users):
    return _tree_substitute_filter(
        household, shopping_users,
        tree_field='substitute_siblings',
        tree_q=Q(
            path__startswith=Substr(OuterRef('path'), 1, Food.steplen * (OuterRef('depth') - 1)),
            depth=OuterRef('depth'),
        ),
    )