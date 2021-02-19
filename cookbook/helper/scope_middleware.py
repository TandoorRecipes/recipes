from django_scopes import scope


class ScopeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.space = request.user.userpreference.space

            with scope(space=request.space):
                return self.get_response(request)
        else:
            return self.get_response(request)
