from django.test.runner import DiscoverRunner
from django_scopes import scopes_disabled


class CustomTestRunner(DiscoverRunner):
    def run_tests(self, *args, **kwargs):
        with scopes_disabled():
            return super().run_tests(*args, **kwargs)
