from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Household, InventoryLocation

LIST_URL = 'api:household-list'
DETAIL_URL = 'api:household-detail'


def test_delete_household_referenced_by_inventory_location_is_blocked(u1_s1, space_1):
    """A household referenced by an InventoryLocation (PROTECT) must return a
    clean 4xx (403), not a 500, and the household must survive.

    u1_s1 is made the space owner so the request passes CustomIsSpaceOwner and
    reaches the delete (the defect is the unhandled ProtectedError, not perms).
    """
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        space_1.created_by = user
        space_1.save()
        hh = Household.objects.create(name='Protected HH', space=space_1)
        InventoryLocation.objects.create(name='Pantry', household=hh, created_by=user, space=space_1)

    r = u1_s1.delete(reverse(DETAIL_URL, args={hh.id}))
    assert r.status_code == 403

    # delete was blocked (not a 500 / partial); the household is still retrievable
    assert u1_s1.get(reverse(DETAIL_URL, args={hh.id})).status_code == 200
