import pytest
from django.urls import reverse


def test_index():
    # TODO add appropriate test
    pass


def test_search():
    # TODO add appropriate test
    pass


def test_view():
    # TODO add appropriate test
    pass


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_books(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_books')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_plan(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_plan')).status_code == arg[1]


def test_plan_entry():
    # TODO add appropriate test
    pass


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_shopping(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_shopping')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_settings(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_settings')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_history(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_history')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 302],
    ['a1_s1', 302],
])
def test_system(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_system')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 302],
    ['u1_s1', 302],
    ['a1_s1', 302],
])
def test_setup(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('view_setup')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 200],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_markdown_doc(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('docs_markdown')).status_code == arg[1]


@pytest.mark.parametrize("arg", [
    ['a_u', 302],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_api_info(arg, request, ext_recipe_1_s1):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse('docs_api')).status_code == arg[1]
