from django.core.cache import caches
from django.db.models import Q
from django.db.models.functions import Lower

from cookbook.models import Automation, Food, Ingredient, Unit


class AutomationEngine():
    request = None
    use_cache = None
    food_aliases = None
    unit_aliases = None
    never_unit = None
    transpose_words = None
    description_replace = None
    instruction_replace = None

    def __init__(self, request, use_cache=True):
        self.request = request
        self.use_cache = use_cache

    def apply_keyword_automation(self, keyword):
        return keyword

    def apply_unit_automation(self, unit):
        return unit

    def apply_food_automation(self, food):
        food = food.strip()
        if self.use_cache and self.food_aliases is None:
            self.food_aliases = {}
            FOOD_CACHE_KEY = f'automation_food_alias_{self.request.space.pk}'
            if c := caches['default'].get(FOOD_CACHE_KEY, None):
                self.food_aliases = c
                caches['default'].touch(FOOD_CACHE_KEY, 30)
            else:
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.FOOD_ALIAS).only('param_1', 'param_2').order_by('order').all():
                    self.food_aliases[a.param_1.lower()] = a.param_2
                caches['default'].set(FOOD_CACHE_KEY, self.food_aliases, 30)
        else:
            self.food_aliases = {}

        if self.food_aliases:
            try:
                return self.food_aliases[food.lower()]
            except KeyError:
                return food
        else:
            if automation := Automation.objects.filter(space=self.request.space, type=Automation.FOOD_ALIAS, param_1__iexact=food, disabled=False).order_by('order').first():
                return automation.param_2
        return food

    def apply_transpose_automation(self, string):
        return string

    def apply_regex_replace_automation(self, string):
        return string
