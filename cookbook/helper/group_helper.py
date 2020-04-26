"""
Source: https://djangosnippets.org/snippets/1703/
"""
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.utils.translation import gettext as _
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy


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
