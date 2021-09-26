from django.urls import reverse
from django_scopes import scope, scopes_disabled

from cookbook.views import views
from recipes import settings


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:

            prefix = settings.JS_REVERSE_SCRIPT_PREFIX or ''
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
            with scopes_disabled():
                request.space = None
                return self.get_response(request)
