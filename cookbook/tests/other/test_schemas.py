import pytest
from django.urls.resolvers import URLPattern, URLResolver
from drf_spectacular.openapi import AutoSchema
from rest_framework.viewsets import ModelViewSet

from cookbook.urls import urlpatterns

skipped_schemas = ['api_sync']


def has_choice_field(model):
    model_fields = model._meta.get_fields()
    return any(field.get_internal_type() == 'CharField'
               and hasattr(field, 'choices') and field.choices
               for field in model_fields)


def is_list_function(callback):
    return (hasattr(callback, 'initkwargs')
            and callback.initkwargs.get('detail') == False
            and hasattr(callback, 'cls') and hasattr(callback.cls, 'list'))


# generates list of all api enpoints
def enumerate_urlpatterns(urlpatterns, base_url=''):
    for i, url_pattern in enumerate(urlpatterns):
        # api-root isn't an endpoint, so skip it
        if isinstance(url_pattern,
                      URLPattern) and url_pattern.name == 'api-root':
            continue
        # if the url pattern starts with 'api/' it is an api endpoint and should be part of the list
        if isinstance(url_pattern, URLPattern):
            pattern = f"{base_url}{str(url_pattern.pattern)}"
            # DRF endpoints generate two patterns, no need to test both
            if pattern[:4] == 'api/' and pattern[
                    -25:] != '.(?P<format>[a-z0-9]+)/?$':
                api_endpoints.append(url_pattern)
        # if the pattern is a URLResolver then it is a list of URLPatterns and needs to be enumerated again, prepending the url_pattern
        elif isinstance(url_pattern, URLResolver):
            base_url_resolver = f"{base_url}{str(url_pattern.pattern)}/"
            enumerate_urlpatterns(url_pattern.url_patterns, base_url_resolver)


api_endpoints = []
enumerate_urlpatterns(urlpatterns)
# filtered list of api_endpoints that only includes the LIST (or detail=False) endpoints
list_api_endpoints = [a for a in api_endpoints if is_list_function(a.callback)]
# filtered list of api_endpoints that only includes endpoints that have type ModelViewSet and a Choice CharField
enum_api_endpoints = [
    a for a in list_api_endpoints
    if hasattr(a.callback, 'cls') and issubclass(a.callback.cls, ModelViewSet)
    and has_choice_field(a.callback.cls.serializer_class.Meta.model)
]


@pytest.mark.parametrize("api", list_api_endpoints, ids=lambda api: api.name)
def test_pagination_exists(api):
    assert hasattr(api.callback.cls, 'pagination_class') and (
        api.callback.cls.pagination_class is not None
        or getattr(api.callback.cls,
                   'pagination_disabled')), f"API {api.name} is not paginated."


@pytest.mark.parametrize("api", api_endpoints, ids=lambda api: api.name)
def test_autoschema_exists(api):
    if api.name in skipped_schemas:
        return
    assert issubclass(api.callback.cls.schema.__class__, AutoSchema)


# @pytest.mark.parametrize("api", enum_api_endpoints, ids=lambda api: api.name)
# def test_schema_enum(api):
#     model = api.callback.cls.serializer_class.Meta.model
#     has_choice_field = any(field.get_internal_type() == 'CharField' and hasattr(field, 'choices') and field.choices for field in model.get_fields())
