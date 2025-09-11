from django.contrib.auth.models import Group
from django.http import HttpResponseRedirect
from django.urls import reverse
from django_scopes import scope, scopes_disabled
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
from psycopg2.errors import UniqueViolation
from rest_framework.exceptions import AuthenticationFailed

import random

from cookbook.models import Space, UserSpace
from cookbook.views import views
from recipes import settings


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        prefix = settings.SCRIPT_NAME or ''

        # need to disable scopes for writing requests into userpref and enable for loading ?
        if request.path.startswith(prefix + '/api/user-preference/'):
            with scopes_disabled():
                return self.get_response(request)

        if request.user.is_authenticated:

            if request.path.startswith(prefix + '/admin/'):
                with scopes_disabled():
                    return self.get_response(request)

            if request.path.startswith(prefix + '/signup/') or request.path.startswith(prefix + '/invite/'):
                return self.get_response(request)

            if request.path.startswith(prefix + '/accounts/'):
                return self.get_response(request)

            if request.path.startswith(prefix + '/switch-space/'):
                return self.get_response(request)

            # get active user space, if for some reason more than one space is active select first (group permission checks will fail, this is not intended at this point)
            user_space = request.user.userspace_set.filter(active=True).first()

            if not user_space:
                if request.user.userspace_set.count() > 0:
                    # if the users has a userspace but nothing is active, activate the first one
                    user_space = request.user.userspace_set.filter(active=True).first()
                    user_space.active = True
                    user_space.save()
                else:
                    # if user does not yet have a space create one for him
                    user_space = create_space_for_user(request.user)

            # TODO remove the need for this view
            if user_space.groups.count() == 0 and not reverse('account_logout') in request.path:
                return views.no_groups(request)

            request.space = user_space.space
            with scope(space=request.space):
                return self.get_response(request)
        else:
            if request.path.startswith(prefix + '/api/'):
                try:
                    if auth := OAuth2Authentication().authenticate(request):
                        user_space = auth[0].userspace_set.filter(active=True).first()
                        if user_space:
                            request.space = user_space.space
                            with scope(space=request.space):
                                return self.get_response(request)
                except AuthenticationFailed:
                    pass

            with scopes_disabled():
                request.space = None
                return self.get_response(request)


def create_space_for_user(user, name=None):
    with scopes_disabled():
        if not name:
            name = f"{user.username}'s Space"

        if Space.objects.filter(name=name).exists():
            name = f'{name} #{random.randrange(1, 10 ** 5)}'

        created_space = Space(name=name,
                              created_by=user,
                              max_file_storage_mb=settings.SPACE_DEFAULT_MAX_FILES,
                              max_recipes=settings.SPACE_DEFAULT_MAX_RECIPES,
                              max_users=settings.SPACE_DEFAULT_MAX_USERS,
                              allow_sharing=settings.SPACE_DEFAULT_ALLOW_SHARING,
                              ai_enabled=settings.SPACE_AI_ENABLED,
                              ai_credits_monthly=settings.SPACE_AI_CREDITS_MONTHLY,
                              space_setup_completed=False, )
        created_space.save()

        UserSpace.objects.filter(user=user).update(active=False)
        user_space = UserSpace.objects.create(space=created_space, user=user, active=True)
        user_space.groups.add(Group.objects.filter(name='admin').get())

        return user_space
