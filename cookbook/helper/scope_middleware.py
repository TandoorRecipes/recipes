import re

from allauth.headless.contrib.rest_framework.authentication import XSessionTokenAuthentication
from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpResponseRedirect, JsonResponse
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
        NO_SCOPE_VIEWS = [
            '/admin'  # needs to be exempt from scopes otherwise admin wont work
        ]
        # views that should be served even when no space context is available
        NO_SPACE_VIEWS = []
        # views that should be served without redirection when not authenticated
        NO_AUTH_VIEWS = ['/media/',  # media is typically public, needed for recipe sharing pictures
                         '/setup/',  # initial setup page
                         '/accounts',  # HEADLESS_ONLY disabled most views here but required for 3rd party redirects
                         '/invite',  # invite link handler needs to be public
                         '/manifest.json',  # manifest should be on start page as well
                         '/_allauth',  # auth apis have their own auth handling
                         '/openapi',  # api client is public
                         '/api/server-settings/current',  # server settings are needed to control layout on login page
                         # views for unauthenticated users
                         '/account/login',
                         '/account/signup',
                         '/account/password-reset',
                         '/account/email-confirm',
                         '/account/social-signup',
                         ]

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

            if not user_space:
                if request.user.userspace_set.count() > 0:
                    # if the users has a userspace but nothing is active, activate the first one
                    user_space = request.user.userspace_set.first()
                    if user_space:
                        user_space.active = True
                        user_space.save()
                elif 'signup_token' in request.session:
                    # if user is authenticated, has no space but a signup token (InviteLink) is present, redirect to invite link logic
                    return HttpResponseRedirect(reverse('view_invite', args=[request.session.pop('signup_token', '')]))
                else:
                    return self.get_response(request)

            request.space = user_space.space
            request.user_space = user_space
            with scope(space=request.space):
                return self.get_response(request)
        else:
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

            # allow unauthenticated and space-less callbacks from external auth providers
            if re.match(rf'^{re.escape(prefix)}/accounts/(?:openid_connect/)?[a-zA-Z0-9_-]+/login/callback/?$', request.path):
                with scopes_disabled():
                    return self.get_response(request)

            # if unauthenticated requests come to the API try authenticating the user trough the OAuth (bearer) token or the session token (django allauth)
            if request.path.startswith(prefix + '/api/') or request.path.startswith(prefix + '/_allauth/') :
                authenticators = (
                    OAuth2Authentication(),
                    XSessionTokenAuthentication(),
                )
                for authenticator in authenticators:
                    try:
                        # if the user could be authenticated annotate the space to the request
                        if auth := authenticator.authenticate(request):
                            user = auth[0]
                            request.user = user
                            user_space = user.userspace_set.filter(active=True).first()
                            if user_space:
                                request.space = user_space.space
                                request.user_space = user_space
                                with scope(space=request.space):
                                    return self.get_response(request)
                    except Exception:
                        pass

                # if not authentication succeeds return 403 as redirection to login makes no sense for an API
                return JsonResponse({'detail': 'Authentication credentials were not provided or access is forbidden.'}, status=403)

            # redirect everything that wasn't handled above to login
            return HttpResponseRedirect('/account/login/?next=' + request.path)
