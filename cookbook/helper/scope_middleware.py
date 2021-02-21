from django.shortcuts import redirect
from django.urls import reverse
from django_scopes import scope, scopes_disabled


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:

            if request.user.groups.count() == 0:
                return redirect('view_no_group')

            with scopes_disabled():
                if request.user.userpreference.space is None and not reverse('view_no_space') in request.path and not reverse('account_logout') in request.path:
                    return redirect(reverse('view_no_space'))

            if request.path.startswith('/admin/'):
                with scopes_disabled():
                    return self.get_response(request)

            request.space = request.user.userpreference.space
            # with scopes_disabled():
            with scope(space=request.space):
                return self.get_response(request)
        else:
            return self.get_response(request)
