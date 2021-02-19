from django_scopes import scope, scopes_disabled


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.space = request.user.userpreference.space

            #with scopes_disabled():
            with scope(space=request.space):
                return self.get_response(request)
        else:
            return self.get_response(request)
