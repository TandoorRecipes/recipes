import re

from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient


class OpenEats(Integration):

    def get_recipe_from_file(self, file):

        return None

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
