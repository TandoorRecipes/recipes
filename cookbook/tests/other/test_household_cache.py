import pytest
from django.core.cache import caches
from django_scopes import scopes_disabled

from cookbook.helper.permission_helper import get_household_user_ids
from cookbook.models import UserSpace
from cookbook.tests.factories import HouseholdFactory, SpaceFactory, UserFactory


def _make_userspace(user, space, household=None):
    """Create a UserSpace for a user in a space, optionally with a household."""
    us = UserSpace.objects.create(user=user, space=space, active=True)
    if household:
        us.household = household
        us.save()
    return us


@pytest.mark.parametrize("cache_backend", ["default"])
class TestHouseholdCacheInvalidation:
    """Tests that get_household_user_ids cache is properly invalidated on UserSpace changes."""

    def _cache_key_household(self, space_id, household_id, user_id):
        return f'household_user_ids_{space_id}_{household_id}_user_{user_id}'

    def _cache_key_user(self, space_id, user_id):
        return f'household_user_ids_{space_id}_user_{user_id}'

    @pytest.mark.django_db
    def test_user_added_to_household_invalidates_cache(self, cache_backend):
        """When a user joins a household, the household's cache is invalidated."""
        with scopes_disabled():
            space = SpaceFactory()
            household = HouseholdFactory(space=space)
            user1 = UserFactory(space=space)
            us1 = _make_userspace(user1, space, household)

            # Prime the cache
            result = get_household_user_ids(us1)
            assert user1.id in result
            assert caches[cache_backend].get(self._cache_key_household(space.id, household.id, user1.id)) is not None

            # Add a second user to the household
            user2 = UserFactory(space=space)
            _make_userspace(user2, space, household)

            # Cache should be invalidated for user1 (existing member)
            assert caches[cache_backend].get(self._cache_key_household(space.id, household.id, user1.id)) is None

            # Fresh call should include both users
            result = get_household_user_ids(us1)
            assert user1.id in result
            assert user2.id in result

    @pytest.mark.django_db
    def test_user_removed_from_household_invalidates_old_cache(self, cache_backend):
        """When a user is removed from a household (set to None), the old household's cache is invalidated."""
        with scopes_disabled():
            space = SpaceFactory()
            household = HouseholdFactory(space=space)
            user1 = UserFactory(space=space)
            user2 = UserFactory(space=space)
            us1 = _make_userspace(user1, space, household)
            us2 = _make_userspace(user2, space, household)

            # Prime the cache — both users in household
            result = get_household_user_ids(us1)
            assert user1.id in result
            assert user2.id in result

            # Remove user2 from household
            us2.household = None
            us2.save()

            # Old household cache should be invalidated for the remaining member
            assert caches[cache_backend].get(self._cache_key_household(space.id, household.id, user1.id)) is None

            # Fresh call should only include user1
            result = get_household_user_ids(us1)
            assert user1.id in result
            assert user2.id not in result

    @pytest.mark.django_db
    def test_user_moved_between_households_invalidates_both(self, cache_backend):
        """When a user moves from household A to B, both caches are invalidated."""
        with scopes_disabled():
            space = SpaceFactory()
            household_a = HouseholdFactory(space=space)
            household_b = HouseholdFactory(space=space)
            user1 = UserFactory(space=space)
            user2 = UserFactory(space=space)
            us1 = _make_userspace(user1, space, household_a)
            us2 = _make_userspace(user2, space, household_b)

            # Prime both caches
            get_household_user_ids(us1)
            get_household_user_ids(us2)
            assert caches[cache_backend].get(self._cache_key_household(space.id, household_a.id, user1.id)) is not None
            assert caches[cache_backend].get(self._cache_key_household(space.id, household_b.id, user2.id)) is not None

            # Move user1 from household_a to household_b
            us1.household = household_b
            us1.save()

            # Both caches should be invalidated
            assert caches[cache_backend].get(self._cache_key_household(space.id, household_a.id, user1.id)) is None
            assert caches[cache_backend].get(self._cache_key_household(space.id, household_b.id, user2.id)) is None

            # Fresh call for household_b should include both users
            result_b = get_household_user_ids(us1)
            assert user1.id in result_b
            assert user2.id in result_b

            # Household_a is now empty — no UserSpace to query with,
            # so just verify the cache was cleared (asserted above)

    @pytest.mark.django_db
    def test_user_deleted_from_household_invalidates_cache(self, cache_backend):
        """When a UserSpace is deleted, the household's cache is invalidated."""
        with scopes_disabled():
            space = SpaceFactory()
            household = HouseholdFactory(space=space)
            user1 = UserFactory(space=space)
            user2 = UserFactory(space=space)
            us1 = _make_userspace(user1, space, household)
            us2 = _make_userspace(user2, space, household)

            # Prime the cache
            result = get_household_user_ids(us1)
            assert user2.id in result

            # Delete user2's UserSpace
            us2.delete()

            # Cache should be invalidated for the remaining member
            assert caches[cache_backend].get(self._cache_key_household(space.id, household.id, user1.id)) is None

            # Fresh call should only include user1
            result = get_household_user_ids(us1)
            assert user1.id in result
            assert user2.id not in result

    @pytest.mark.django_db
    def test_no_household_uses_per_user_cache(self, cache_backend):
        """Users without a household get a per-user cache key."""
        with scopes_disabled():
            space = SpaceFactory()
            user1 = UserFactory(space=space)
            us1 = _make_userspace(user1, space)

            result = get_household_user_ids(us1)
            assert result == [user1.id]
            assert caches[cache_backend].get(self._cache_key_user(space.id, user1.id)) is not None

    @pytest.mark.django_db
    def test_removed_from_household_invalidates_per_user_cache(self, cache_backend):
        """When user is removed from household, the per-user fallback cache works correctly."""
        with scopes_disabled():
            space = SpaceFactory()
            household = HouseholdFactory(space=space)
            user1 = UserFactory(space=space)
            us1 = _make_userspace(user1, space, household)

            # Prime household cache
            get_household_user_ids(us1)

            # Remove from household
            us1.household = None
            us1.save()

            # Per-user fallback key should not have stale data
            result = get_household_user_ids(us1)
            assert result == [user1.id]
