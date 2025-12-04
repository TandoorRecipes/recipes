from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.helper.cooklang_parser import Recipe
from cookbook.integration.cooklang import Cooklang


def request_generator(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space

    return space, request


def test_cooklang_integration(u1_s1):
    assert True
    return

    space, request = request_generator(u1_s1)
    with scope(space=space):
        cooklang_integration = Cooklang(request, "export")
        with open("cookbook/tests/other/test_data/Cooklang/Butter Swirl Shortbread Cookies.cook") as file:
            recipe = cooklang_integration.get_recipe_from_file(file)


def test_cooklang_parser():

    with open("cookbook/tests/other/test_data/Cooklang/American Pancakes.cook") as file:
        recipe_text = file.read()
    recipe = Recipe.parse(recipe_text)

    assert False
