import pytest

from cookbook.urls import router

exclude_endpoints = []


@pytest.mark.parametrize("route", router.registry)
def test_pagination_exists(route):
    # route[0] = name
    # route[1] = ViewSet class
    # route[2] = reverse name

    assert ('get' not in route[1].http_method_names
            or 'get' in route[1].http_method_names and hasattr(route[1], 'pagination_class') and route[1].pagination_class is not None), f"API {route[0]} is not paginated."


def test_list_schema_completeness():
    pass


def test_get_schema_completeness():
    pass


def test_create_schema_completeness():
    pass


def test_update_schema_completeness():
    pass


def test_partialupdate_schema_completeness():
    pass


def test_destroy_schema_completeness():
    pass


def test_trace_schema_completeness():
    pass
