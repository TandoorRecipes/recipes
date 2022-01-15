from django.urls import reverse
from django_scopes import scope, scopes_disabled
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

from cookbook.views import views
from recipes import settings


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        prefix = settings.JS_REVERSE_SCRIPT_PREFIX or ''
        if request.user.is_authenticated:

            if request.path.startswith(prefix + '/admin/'):
                with scopes_disabled():
                    return self.get_response(request)

            if request.path.startswith(prefix + '/signup/') or request.path.startswith(prefix + '/invite/'):
                return self.get_response(request)

            if request.path.startswith(prefix + '/accounts/'):
                return self.get_response(request)

            with scopes_disabled():
                if request.user.userpreference.space is None and not reverse('account_logout') in request.path:
                    return views.no_space(request)

            if request.user.groups.count() == 0 and not reverse('account_logout') in request.path:
                return views.no_groups(request)

            request.space = request.user.userpreference.space
            # with scopes_disabled():
            with scope(space=request.space):
                return self.get_response(request)
        else:
            if request.path.startswith(prefix + '/api/'):
                try:
                    if auth := TokenAuthentication().authenticate(request):
                        request.space = auth[0].userpreference.space
                        with scope(space=request.space):
                            return self.get_response(request)
                except AuthenticationFailed:
                    pass

            with scopes_disabled():
                request.space = None
                return self.get_response(request)
