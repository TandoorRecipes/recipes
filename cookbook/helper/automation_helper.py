from django.core.cache import caches
from django.db.models import Q
from django.db.models.functions import Lower

from cookbook.models import Automation


class AutomationEngine:
    request = None
    use_cache = None
    food_aliases = None
    keyword_aliases = None
    unit_aliases = None
    never_unit = None
    transpose_words = None
    description_replace = None
    instruction_replace = None

    def __init__(self, request, use_cache=True):
        self.request = request
        self.use_cache = use_cache

    def apply_keyword_automation(self, keyword):
        keyword = keyword.strip()
        if self.use_cache and self.keyword_aliases is None:
            self.keyword_aliases = {}
            KEYWORD_CACHE_KEY = f'automation_keyword_alias_{self.request.space.pk}'
            if c := caches['default'].get(KEYWORD_CACHE_KEY, None):
                self.keyword_aliases = c
                caches['default'].touch(KEYWORD_CACHE_KEY, 30)
            else:
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.KEYWORD_ALIAS).only('param_1', 'param_2').order_by('order').all():
                    self.keyword_aliases[a.param_1.lower()] = a.param_2
                caches['default'].set(KEYWORD_CACHE_KEY, self.keyword_aliases, 30)
        else:
            self.keyword_aliases = {}
        if self.keyword_aliases:
            try:
                keyword = self.keyword_aliases[keyword.lower()]
            except KeyError:
                pass
        else:
            if automation := Automation.objects.filter(space=self.request.space, type=Automation.KEYWORD_ALIAS, param_1__iexact=keyword, disabled=False).order_by('order').first():
                return automation.param_2
        return keyword

    def apply_unit_automation(self, unit):
        unit = unit.strip()
        if self.use_cache and self.unit_aliases is None:
            self.unit_aliases = {}
            UNIT_CACHE_KEY = f'automation_unit_alias_{self.request.space.pk}'
            if c := caches['default'].get(UNIT_CACHE_KEY, None):
                self.unit_aliases = c
                caches['default'].touch(UNIT_CACHE_KEY, 30)
            else:
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.UNIT_ALIAS).only('param_1', 'param_2').order_by('order').all():
                    self.unit_aliases[a.param_1.lower()] = a.param_2
                caches['default'].set(UNIT_CACHE_KEY, self.unit_aliases, 30)
        else:
            self.unit_aliases = {}
        if self.unit_aliases:
            try:
                unit = self.unit_aliases[unit.lower()]
            except KeyError:
                pass
        else:
            if automation := Automation.objects.filter(space=self.request.space, type=Automation.UNIT_ALIAS, param_1__iexact=unit, disabled=False).order_by('order').first():
                return automation.param_2
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
