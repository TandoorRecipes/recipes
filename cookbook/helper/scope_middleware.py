import re

from django.http import HttpResponseRedirect
from django.urls import reverse
from django_scopes import scope, scopes_disabled
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
from rest_framework.exceptions import AuthenticationFailed

from cookbook.helper.permission_helper import create_space_for_user
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

        # Disable scopes for recipe detail requests with share link
        # This allows users from different spaces to access shared recipes
        # Security is maintained by CustomRecipePermission which validates the share link
        if (request.GET.get('share')
                and re.match(rf'^{re.escape(prefix)}/api/recipe/\d+/?$', request.path)
                and request.method in ('GET', 'HEAD', 'OPTIONS')):
            with scopes_disabled():
                request.space = None
                return self.get_response(request)

        # views that should be served with scopes_disabled
        NO_SCOPE_VIEWS = ['/admin/']
        # views that should be served even when no space context is available
        NO_SPACE_VIEWS = ['/invite/', '/accounts/', '/switch-space/']  # TODO verify this is all still needed in v2
        # views that should be served without redirection when not authenticated
        NO_AUTH_VIEWS = ['/login/', '/signup/', '/password-reset/', '/manifest.json', '/_allauth/']
        if settings.DEBUG:
            NO_AUTH_VIEWS.append('/__debug__/')

        if request.user.is_authenticated:
            for nsv in NO_SCOPE_VIEWS:
                if request.path.startswith(prefix + nsv):
                    with scopes_disabled():
                        return self.get_response(request)

            for nspv in NO_SPACE_VIEWS:
                if request.path.startswith(prefix + nspv):
                    return self.get_response(request)

            # get active user space, if for some reason more than one space is active select first (group permission checks will fail, this is not intended at this point)
            user_space = request.user.userspace_set.filter(active=True).first()

            if not user_space and request.user.userspace_set.count() > 0:
                # if the users has a userspace but nothing is active, activate the first one
                user_space = request.user.userspace_set.first()
                if user_space:
                    user_space.active = True
                    user_space.save()

            if not user_space:
                if 'signup_token' in request.session:
                    # if user is authenticated, has no space but a signup token (InviteLink) is present, redirect to invite link logic
                    return HttpResponseRedirect(reverse('view_invite', args=[request.session.pop('signup_token', '')]))
                else:
                    # if user does not yet have a space create one for him
                    user_space = create_space_for_user(request.user)

            # TODO remove the need for this view
            if user_space.groups.count() == 0 and not reverse('account_logout') in request.path:
                return views.no_groups(request)

            request.space = user_space.space
            request.user_space = user_space
            with scope(space=request.space):
                return self.get_response(request)
        else:
            # annotate space to requests to api with token auth
            if request.path.startswith(prefix + '/api/'):
                try:
                    if auth := OAuth2Authentication().authenticate(request):
                        user_space = auth[0].userspace_set.filter(active=True).first()
                        if user_space:
                            request.space = user_space.space
                            request.user_space = user_space
                            with scope(space=request.space):
                                return self.get_response(request)
                except AuthenticationFailed:
                    pass

            # allow frontend to be served for shared recipe links
            if re.search(r'/recipe/\d+/', request.path[:512]) and request.GET.get('share'):
                request.space = None
                with scopes_disabled():
                    return self.get_response(request)

            # allow frontend to be served for public pages
            for nav in NO_AUTH_VIEWS:
                if request.path.startswith(prefix + nav):
                    request.space = None
                    with scopes_disabled():
                        return self.get_response(request)

            return HttpResponseRedirect('/login/?next=' + request.path)
