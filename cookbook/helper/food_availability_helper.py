from django.db.models import Exists, OuterRef, Q
from django.db.models.functions import Substr

from cookbook.models import Food


def _is_available(household, shopping_users):
    """
    Q filter (Food-level): food is on hand via onhand_users or has inventory.
    :param household: Household instance or None (skips InventoryEntry check)
    :param shopping_users: QuerySet of user IDs from get_household_user_ids
    :return: Q object for filtering Food querysets
    """
    q = Q(onhand_users__in=shopping_users)
    if household is not None:
        q = q | Q(
            inventoryentry__amount__gt=0,
            inventoryentry__inventory_location__household=household,
        )
    return q


def _substitute_available(household, shopping_users):
    """
    Q filter (Food-level): explicit substitute food is on hand or has inventory.
    :param household: Household instance or None (skips InventoryEntry check)
    :param shopping_users: QuerySet of user IDs from get_household_user_ids
    :return: Q object for filtering Food querysets via substitute relation
    """
    q = Q(substitute__onhand_users__in=shopping_users)
    if household is not None:
        q = q | Q(
            substitute__inventoryentry__amount__gt=0,
            substitute__inventoryentry__inventory_location__household=household,
        )
    return q


def children_substitute_filter(household, shopping_users):
    """
    Food queryset: foods with substitute_children=True and a child that is available.
    :param household: Household instance or None (skips InventoryEntry check)
    :param shopping_users: QuerySet of user IDs from get_household_user_ids
    :return: Food QuerySet suitable for use in __in subqueries
    """
    available = _is_available(household, shopping_users)
    sub_available = _substitute_available(household, shopping_users)
    children_available = Food.objects.filter(
        path__startswith=OuterRef('path'),
        depth__gt=OuterRef('depth'),
    ).filter(available)
    return (
        Food.objects.exclude(
            available | Q(ignore_shopping=True, recipe__isnull=True) | sub_available
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_children=True)
        .annotate(child_in_inventory=Exists(children_available))
        .filter(child_in_inventory=True)
    )


def sibling_substitute_filter(household, shopping_users):
    """
    Food queryset: foods with substitute_siblings=True and a sibling that is available.
    :param household: Household instance or None (skips InventoryEntry check)
    :param shopping_users: QuerySet of user IDs from get_household_user_ids
    :return: Food QuerySet suitable for use in __in subqueries
    """
    available = _is_available(household, shopping_users)
    sub_available = _substitute_available(household, shopping_users)
    sibling_available = Food.objects.filter(
        path__startswith=Substr(OuterRef('path'), 1, Food.steplen * (OuterRef('depth') - 1)),
        depth=OuterRef('depth'),
    ).filter(available)
    return (
        Food.objects.exclude(
            available | Q(ignore_shopping=True, recipe__isnull=True) | sub_available
        )
        .exclude(depth=1, numchild=0)
        .filter(substitute_siblings=True)
        .annotate(sibling_in_inventory=Exists(sibling_available))
        .filter(sibling_in_inventory=True)
    )


def recipe_availability_filter(household, shopping_users):
    """
    Recipe-level Q filter composing all 4 availability paths (direct, substitute, children, siblings).
    :param household: Household instance or None (skips InventoryEntry check)
    :param shopping_users: QuerySet of user IDs from get_household_user_ids
    :return: Q object for use as Count('steps__ingredients__food__pk', filter=THIS)
    """
    P = 'steps__ingredients__food__'

    direct = Q(**{f'{P}onhand_users__in': shopping_users})
    if household is not None:
        direct = direct | Q(**{
            f'{P}inventoryentry__amount__gt': 0,
            f'{P}inventoryentry__inventory_location__household': household,
        })

    substitute = Q(**{f'{P}substitute__onhand_users__in': shopping_users})
    if household is not None:
        substitute = substitute | Q(**{
            f'{P}substitute__inventoryentry__amount__gt': 0,
            f'{P}substitute__inventoryentry__inventory_location__household': household,
        })

    children = Q(**{f'{P}in': children_substitute_filter(household, shopping_users)})
    siblings = Q(**{f'{P}in': sibling_substitute_filter(household, shopping_users)})
    return direct | substitute | children | siblings
