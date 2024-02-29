from django.contrib import auth
from django.contrib.auth.models import Group
from django_scopes import scopes_disabled

from cookbook.helper.permission_helper import (has_group_permission, is_object_owner,
                                               is_space_owner, switch_user_active_space)
from cookbook.models import Food, RecipeBook, RecipeBookEntry, Space, UserSpace


def test_has_group_permission(u1_s1, a_u, space_2):
    with scopes_disabled():
        # test that a normal user has user permissions
        assert has_group_permission(auth.get_user(u1_s1), ('guest',), no_cache=True)
        assert has_group_permission(auth.get_user(u1_s1), ('user',), no_cache=True)
        assert not has_group_permission(auth.get_user(u1_s1), ('admin',), no_cache=True)

        # test that permissions are not taken from non active spaces
        us = UserSpace.objects.create(user=auth.get_user(u1_s1), space=space_2, active=False)
        us.groups.add(Group.objects.get(name='admin'))
        assert not has_group_permission(auth.get_user(u1_s1), ('admin',), no_cache=True)

        # disable all spaces and enable space 2 permission to check if permission is now valid
        auth.get_user(u1_s1).userspace_set.update(active=False)
        us.active = True
        us.save()
        assert has_group_permission(auth.get_user(u1_s1), ('admin',), no_cache=True)

        # test that group permission checks fail if more than one userspace is active
        auth.get_user(u1_s1).userspace_set.update(active=True)
        assert not has_group_permission(auth.get_user(u1_s1), ('user',), no_cache=True)

        # test that anonymous users don't have any permissions
        assert not has_group_permission(auth.get_user(a_u), ('guest',), no_cache=True)
        assert not has_group_permission(auth.get_user(a_u), ('user',), no_cache=True)
        assert not has_group_permission(auth.get_user(a_u), ('admin',), no_cache=True)


def test_is_owner(u1_s1, u2_s1, u1_s2, a_u, space_1, recipe_1_s1):
    with scopes_disabled():
        s = Space.objects.create(name='Test', created_by=auth.get_user(u1_s1))

        assert is_object_owner(auth.get_user(u1_s1), s)
        assert not is_object_owner(auth.get_user(u2_s1), s)
        assert not is_object_owner(auth.get_user(u1_s2), s)
        assert not is_object_owner(auth.get_user(a_u), s)

        rb = RecipeBook.objects.create(name='Test', created_by=auth.get_user(u1_s1), space=space_1)

        assert is_object_owner(auth.get_user(u1_s1), rb)
        assert not is_object_owner(auth.get_user(u2_s1), rb)
        assert not is_object_owner(auth.get_user(u1_s2), rb)
        assert not is_object_owner(auth.get_user(a_u), rb)

        rbe = RecipeBookEntry.objects.create(book=rb, recipe=recipe_1_s1)

        assert is_object_owner(auth.get_user(u1_s1), rbe)
        assert not is_object_owner(auth.get_user(u2_s1), rbe)
        assert not is_object_owner(auth.get_user(u1_s2), rbe)
        assert not is_object_owner(auth.get_user(a_u), rbe)


def test_is_space_owner(u1_s1, u2_s1, space_1, space_2):
    with scopes_disabled():
        f = Food.objects.create(name='Test', space=space_1)
        space_1.created_by = auth.get_user(u1_s1)
        space_1.save()

        assert is_space_owner(auth.get_user(u1_s1), f)
        assert is_space_owner(space_1.created_by, f)
        assert not is_space_owner(auth.get_user(u2_s1), f)

        f.space = space_2
        f.save()

        assert not is_space_owner(auth.get_user(u1_s1), f)
        assert not is_space_owner(space_1.created_by, f)
        assert not is_space_owner(auth.get_user(u2_s1), f)


def test_switch_user_active_space(u1_s1, u1_s2, space_1, space_2):
    with scopes_disabled():
        # can switch to already active space
        assert switch_user_active_space(auth.get_user(u1_s1), space_1) == auth.get_user(u1_s1).userspace_set.filter(active=True).get()

        # cannot switch to a space the user does not belong to
        assert switch_user_active_space(auth.get_user(u1_s1), space_2) is None

        # can join another space and be member of two spaces
        us = UserSpace.objects.create(user=auth.get_user(u1_s1), space=space_2, active=False)
        assert len(auth.get_user(u1_s1).userspace_set.all()) == 2

        # can switch into newly created space
        assert switch_user_active_space(auth.get_user(u1_s1), space_2) == us
