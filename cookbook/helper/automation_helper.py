import re

from django.core.cache import caches
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

    def apply_never_unit_automation(self, tokens):
        """
        Moves a string that should never be treated as a unit to next token and optionally replaced with default unit
        e.g. NEVER_UNIT: param1: egg, param2: None would modify ['1', 'egg', 'white'] to ['1', '', 'egg', 'white']
        or NEVER_UNIT: param1: egg, param2: pcs would modify ['1', 'egg', 'yolk'] to ['1', 'pcs', 'egg', 'yolk']
        :param1 string: string that should never be considered a unit, will be moved to token[2]
        :param2 (optional) unit as string: will insert unit string into token[1]
        :return: unit as string (possibly changed by automation)
        """

        if self.use_cache and self.never_unit is None:
            self.never_unit = {}
            NEVER_UNIT_CACHE_KEY = f'automation_never_unit_{self.request.space.pk}'
            if c := caches['default'].get(NEVER_UNIT_CACHE_KEY, None):
                self.never_unit = c
                caches['default'].touch(NEVER_UNIT_CACHE_KEY, 30)
            else:
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.NEVER_UNIT).only('param_1', 'param_2').order_by('order').all():
                    self.never_unit[a.param_1.lower()] = a.param_2
                caches['default'].set(NEVER_UNIT_CACHE_KEY, self.never_unit, 30)
        else:
            self.never_unit = {}

        new_unit = None
        alt_unit = self.apply_unit_automation(tokens[1])
        never_unit = False
        if self.never_unit:
            try:
                new_unit = self.never_unit[tokens[1].lower()]
                never_unit = True
            except KeyError:
                return tokens
        else:
            if a := Automation.objects.annotate(param_1_lower=Lower('param_1')).filter(space=self.request.space, type=Automation.NEVER_UNIT, param_1_lower__in=[
                    tokens[1].lower(), alt_unit.lower()], disabled=False).order_by('order').first():
                new_unit = a.param_2
                never_unit = True

        if never_unit:
            tokens.insert(1, new_unit)
        return tokens

    def apply_transpose_automation(self, string):
        """
        If two words (param_1 & param_2) are detected in sequence, swap their position in the ingredient string
        :param 1: first word to detect
        :param 2: second word to detect
        return: new ingredient string
        """
        if self.use_cache and self.transpose_words is None:
            self.transpose_words = {}
            TRANSPOSE_WORDS_CACHE_KEY = f'automation_transpose_words_{self.request.space.pk}'
            if c := caches['default'].get(TRANSPOSE_WORDS_CACHE_KEY, None):
                self.transpose_words = c
                caches['default'].touch(TRANSPOSE_WORDS_CACHE_KEY, 30)
            else:
                i = 0
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.TRANSPOSE_WORDS).only('param_1', 'param_2').order_by('order').all():
                    self.transpose_words[i] = [a.param_1.lower(), a.param_2.lower()]
                    i += 1
                caches['default'].set(TRANSPOSE_WORDS_CACHE_KEY, self.transpose_words, 30)
        else:
            self.transpose_words = {}

        tokens = [x.lower() for x in string.replace(',', ' ').split()]
        if self.transpose_words:
            for key, value in self.transpose_words.items():
                if value[0] in tokens and value[1] in tokens:
                    string = re.sub(rf"\b({value[0]})\W*({value[1]})\b", r"\2 \1", string, flags=re.IGNORECASE)
        else:
            for rule in Automation.objects.filter(space=self.request.space, type=Automation.TRANSPOSE_WORDS, disabled=False) \
                    .annotate(param_1_lower=Lower('param_1'), param_2_lower=Lower('param_2')) \
                    .filter(param_1_lower__in=tokens, param_2_lower__in=tokens).order_by('order'):
                if rule.param_1 in tokens and rule.param_2 in tokens:
                    string = re.sub(rf"\b({rule.param_1})\W*({rule.param_2})\b", r"\2 \1", string, flags=re.IGNORECASE)
        return string

    def apply_regex_replace_automation(self, string):
        return string
