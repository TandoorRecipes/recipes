import pytest
from django.urls import reverse


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['g1_s2', 302],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_external_link_permission(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('api_get_external_file_link', args=[ext_recipe_1_s1.pk])).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_external_file_permission(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('api_get_recipe_file', args=[ext_recipe_1_s1.pk])).status_code == arg[1]
