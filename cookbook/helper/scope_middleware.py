from django.urls import reverse
from django_scopes import scope, scopes_disabled
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
from rest_framework.exceptions import AuthenticationFailed

from cookbook.views import views
from recipes import settings


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        prefix = settings.JS_REVERSE_SCRIPT_PREFIX or ''

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

            with scopes_disabled():
                if request.user.userspace_set.count() == 0 and not reverse('account_logout') in request.path:
                    return views.space_overview(request)

            # get active user space, if for some reason more than one space is active select first (group permission checks will fail, this is not intended at this point)
            user_space = request.user.userspace_set.filter(active=True).first()

            if not user_space:
                return views.space_overview(request)

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
