import re

from django.core.cache import caches
from django.db.models.functions import Lower

from cookbook.models import Automation


class AutomationEngine:
    request = None
    source = None
    use_cache = None
    food_aliases = None
    keyword_aliases = None
    unit_aliases = None
    never_unit = None
    transpose_words = None
    regex_replace = {
        Automation.DESCRIPTION_REPLACE: None,
        Automation.INSTRUCTION_REPLACE: None,
        Automation.FOOD_REPLACE: None,
        Automation.UNIT_REPLACE: None,
        Automation.NAME_REPLACE: None,
    }

    def __init__(self, request, use_cache=True, source=None):
        self.request = request
        self.use_cache = use_cache
        if not source:
            self.source = "default_string_to_avoid_false_regex_match"
        else:
            self.source = source

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
        return self.apply_regex_replace_automation(unit, Automation.UNIT_REPLACE)

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
                return self.apply_regex_replace_automation(food, Automation.FOOD_REPLACE)
        else:
            if automation := Automation.objects.filter(space=self.request.space, type=Automation.FOOD_ALIAS, param_1__iexact=food, disabled=False).order_by('order').first():
                return automation.param_2
        return self.apply_regex_replace_automation(food, Automation.FOOD_REPLACE)

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
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.TRANSPOSE_WORDS).only(
                        'param_1', 'param_2').order_by('order').all()[:512]:
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
                    .filter(param_1_lower__in=tokens, param_2_lower__in=tokens).order_by('order')[:512]:
                if rule.param_1 in tokens and rule.param_2 in tokens:
                    string = re.sub(rf"\b({rule.param_1})\W*({rule.param_2})\b", r"\2 \1", string, flags=re.IGNORECASE)
        return string

    def apply_regex_replace_automation(self, string, automation_type):
        # TODO add warning - maybe on SPACE page? when a max of 512 automations of a specific type is exceeded (ALIAS types excluded?)
        """
        Replaces strings in a recipe field that are from a matched source
        field_type are Automation.type that apply regex replacements
        Automation.DESCRIPTION_REPLACE
        Automation.INSTRUCTION_REPLACE
        Automation.FOOD_REPLACE
        Automation.UNIT_REPLACE
        Automation.NAME_REPLACE

        regex replacment utilized the following fields from the Automation model
        :param 1: source that should apply the automation in regex format ('.*' for all)
        :param 2: regex pattern to match ()
        :param 3: replacement string (leave blank to delete)
        return: new string
        """
        if self.use_cache and self.regex_replace[automation_type] is None:
            self.regex_replace[automation_type] = {}
            REGEX_REPLACE_CACHE_KEY = f'automation_regex_replace_{self.request.space.pk}'
            if c := caches['default'].get(REGEX_REPLACE_CACHE_KEY, None):
                self.regex_replace[automation_type] = c[automation_type]
                caches['default'].touch(REGEX_REPLACE_CACHE_KEY, 30)
            else:
                i = 0
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=automation_type).only(
                        'param_1', 'param_2', 'param_3').order_by('order').all()[:512]:
                    self.regex_replace[automation_type][i] = [a.param_1, a.param_2, a.param_3]
                    i += 1
                caches['default'].set(REGEX_REPLACE_CACHE_KEY, self.regex_replace, 30)
        else:
            self.regex_replace[automation_type] = {}

        if self.regex_replace[automation_type]:
            for rule in self.regex_replace[automation_type].values():
                if re.match(rule[0], (self.source)[:512]):
                    string = re.sub(rule[1], rule[2], string, flags=re.IGNORECASE)
        else:
            for rule in Automation.objects.filter(space=self.request.space, disabled=False, type=automation_type).only(
                    'param_1', 'param_2', 'param_3').order_by('order').all()[:512]:
                if re.match(rule.param_1, (self.source)[:512]):
                    string = re.sub(rule.param_2, rule.param_3, string, flags=re.IGNORECASE)
        return string
