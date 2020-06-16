"""
Source: https://djangosnippets.org/snippets/1703/
"""
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils.translation import gettext as _
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy, reverse
from rest_framework import permissions

from cookbook.models import ShareLink


def get_allowed_groups(groups_required):
    groups_allowed = tuple(groups_required)
    if 'guest' in groups_required:
        groups_allowed = groups_allowed + ('user', 'admin')
    if 'user' in groups_required:
        groups_allowed = groups_allowed + ('admin',)
    return groups_allowed


def group_required(*groups_required):
    """Requires user membership in at least one of the groups passed in."""

    def in_groups(u):
        groups_allowed = get_allowed_groups(groups_required)
        if u.is_authenticated:
            if u.is_superuser | bool(u.groups.filter(name__in=groups_allowed)):
                return True
        return False

    return user_passes_test(in_groups, login_url='index')


class GroupRequiredMixin(object):
    """
        groups_required - list of strings, required param
    """

    groups_required = None

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.add_message(request, messages.ERROR, _('You are not logged in and therefore cannot view this page!'))
            return HttpResponseRedirect(reverse_lazy('login'))
        else:
            if not request.user.is_superuser:
                group_allowed = get_allowed_groups(self.groups_required)
                user_groups = []
                for group in request.user.groups.values_list('name', flat=True):
                    user_groups.append(group)
                if len(set(user_groups).intersection(group_allowed)) <= 0:
                    messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
                    return HttpResponseRedirect(reverse_lazy('index'))
        return super(GroupRequiredMixin, self).dispatch(request, *args, **kwargs)


class OwnerRequiredMixin(object):

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.add_message(request, messages.ERROR, _('You are not logged in and therefore cannot view this page!'))
            return HttpResponseRedirect(reverse_lazy('login'))
        else:
            obj = self.get_object()
            if not (obj.created_by == request.user or request.user.is_superuser):
                messages.add_message(request, messages.ERROR, _('You cannot interact with this object as its not owned by you!'))
                return HttpResponseRedirect(reverse('index'))

        return super(OwnerRequiredMixin, self).dispatch(request, *args, **kwargs)


def share_link_valid(recipe, share):
    """
    Verifies if a share uuid is valid for a given recipe
    """
    try:
        return True if ShareLink.objects.filter(recipe=recipe, uuid=share).exists() else False
    except ValidationError:
        return False


class DRFOwnerPermissions(permissions.BasePermission):
    """
    Custom permission class for django rest framework views
    verifies user has ownership over object
    (either user or created_by or user is request user)
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if owner := getattr(obj, 'created_by', None):
            return owner == request.user
        if owner := getattr(obj, 'user', None):
            return owner == request.user
        return False
