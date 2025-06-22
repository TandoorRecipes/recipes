import re
import string
import unicodedata

from cookbook.helper.automation_helper import AutomationEngine
from cookbook.models import Food, Ingredient, Unit


class IngredientParser:
    request = None
    ignore_rules = False
    automation = None

    def __init__(self, request, cache_mode=True, ignore_automations=False):
        """
        Initialize ingredient parser
        :param request: request context (to control caching, rule ownership, etc.)
        :param cache_mode: defines if all rules should be loaded on initialization (good when parser is used many times) or if they should be retrieved every time (good when parser is not used many times in a row)
        :param ignore_automations: ignore automation rules, allows to use ingredient parser without database access/request (request can be None)
        """
        self.request = request
        self.ignore_rules = ignore_automations
        if not self.ignore_rules:
            self.automation = AutomationEngine(self.request, use_cache=cache_mode)

    def get_unit(self, unit):
        """
        Get or create a unit for given space respecting possible automations
        :param unit: string unit
        :return: None if unit passed is invalid, Unit object otherwise
        """
        if not unit:
            return None
        if len(unit) > 0:
            if self.ignore_rules:
                u, created = Unit.objects.get_or_create(name=unit.strip(), space=self.request.space)
            else:
                u, created = Unit.objects.get_or_create(name=self.automation.apply_unit_automation(unit), space=self.request.space)
            return u
        return None

    def get_food(self, food):
        """
        Get or create a food for given space respecting possible automations
        :param food: string food
        :return: None if food passed is invalid, Food object otherwise
        """
        if not food:
            return None
        if len(food) > 0:
            if self.ignore_rules:
                f, created = Food.objects.get_or_create(name=food.strip(), space=self.request.space)
            else:
                f, created = Food.objects.get_or_create(name=self.automation.apply_food_automation(food), space=self.request.space)
            return f
        return None

    def parse_fraction(self, x):
        if len(x) == 1 and 'fraction' in unicodedata.decomposition(x):
            frac_split = unicodedata.decomposition(x[-1:]).split()
            return (float((frac_split[1]).replace('003', ''))
                    / float((frac_split[3]).replace('003', '')))
        else:
            frac_split = x.split('/')
            if not len(frac_split) == 2:
                raise ValueError
            try:
                return int(frac_split[0]) / int(frac_split[1])
            except ZeroDivisionError:
                raise ValueError

    def parse_amount(self, x):
        amount = 0
        unit = None
        note = ''
        if x.strip() == '':
            return amount, unit, note

        did_check_frac = False
        end = 0
        while (end < len(x) and (x[end] in string.digits
                                 or (
            (x[end] == '.' or x[end] == ',' or x[end] == '/')
            and end + 1 < len(x)
            and x[end + 1] in string.digits
        ))):
            end += 1
        if end > 0:
            if "/" in x[:end]:
                amount = self.parse_fraction(x[:end])
            else:
                amount = float(x[:end].replace(',', '.'))
        else:
            amount = self.parse_fraction(x[0])
            end += 1
            did_check_frac = True
        if end < len(x):
            if did_check_frac:
                unit = x[end:]
            else:
                try:
                    amount += self.parse_fraction(x[end])
                    unit = x[end + 1:]
                except ValueError:
                    unit = x[end:]

        if unit is not None and unit.strip() == '':
            unit = None

        if unit is not None and (unit.startswith('(') or unit.startswith(
                '-')):  # i dont know any unit that starts with ( or - so its likely an alternative like 1L (500ml) Water or 2-3
            unit = None
            note = x
        return amount, unit, note

    def parse_food_with_comma(self, tokens):
        food = ''
        note = ''
        start = 0
        # search for first occurrence of an argument ending in a comma
        while start < len(tokens) and not tokens[start].endswith((',', ';', ':')):
            start += 1
        if start == len(tokens):
            # no token ending in a comma found -> use everything as food
            food = ' '.join(tokens)
        else:
            food = ' '.join(tokens[:start + 1])[:-1]
            note = ' '.join(tokens[start + 1:])
        return food, note

    def parse_food(self, tokens):
        food = ''
        note = ''
        if tokens[-1].endswith(')'):
            # Check if the matching opening bracket is in the same token
            if (not tokens[-1].startswith('(')) and ('(' in tokens[-1]):
                return self.parse_food_with_comma(tokens)
            # last argument ends with closing bracket -> look for opening bracket
            start = len(tokens) - 1
            while not tokens[start].startswith('(') and not start == 0:
                start -= 1
            if start == 0:
                # the whole list is wrapped in brackets -> assume it is an error (e.g. assumed first argument was the unit)  # noqa: E501
                raise ValueError
            elif start < 0:
                # no opening bracket anywhere -> just ignore the last bracket
                food, note = self.parse_food_with_comma(tokens)
            else:
                # opening bracket found -> split in food and note, remove brackets from note  # noqa: E501
                note = ' '.join(tokens[start:])[1:-1]
                food = ' '.join(tokens[:start])
        else:
            food, note = self.parse_food_with_comma(tokens)
        return food, note

    def parse(self, ingredient):
        """
        Main parsing function, takes an ingredient string (e.g. '1 l Water') and extracts amount, unit, food, ...
        :param ingredient: string ingredient
        :return: amount, unit (can be None), food, note (can be empty)
        """
        # initialize default values
        amount = 0
        unit = None
        food = ''
        note = ''
        unit_note = ''

        if len(ingredient) == 0:
            raise ValueError('string to parse cannot be empty')

        if len(ingredient) > 512:
            raise ValueError('cannot parse ingredients with more than 512 characters')

        # some people/languages put amount and unit at the end of the ingredient string
        # if something like this is detected move it to the beginning so the parser can handle it
        if len(ingredient) < 1000 and re.search(r'^([^\W\d_])+(.)*[1-9](\d)*\s*([^\W\d_])+', ingredient):
            match = re.search(r'[1-9](\d)*\s*([^\W\d_])+', ingredient)
            print(f'reording from {ingredient} to {ingredient[match.start():match.end()] + " " + ingredient.replace(ingredient[match.start():match.end()], "")}')
            ingredient = ingredient[match.start():match.end()] + ' ' + ingredient.replace(ingredient[match.start():match.end()], '')

        # if the string contains parenthesis early on remove it and place it at the end
        # because its likely some kind of note
        if re.match('(.){1,6}\\s\\((.[^\\(\\)])+\\)\\s', ingredient):
            match = re.search('\\((.[^\\(])+\\)', ingredient)
            ingredient = ingredient[:match.start()] + ingredient[match.end():] + ' ' + ingredient[match.start():match.end()]

        # leading spaces before commas result in extra tokens, clean them out
        ingredient = ingredient.replace(' ,', ',')

        # handle "(from) - (to)" amounts by using the minimum amount and adding the range to the description
        # "10.5 - 200 g XYZ" => "100 g XYZ (10.5 - 200)"
        ingredient = re.sub("^(\\d+|\\d+[\\.,]\\d+) - (\\d+|\\d+[\\.,]\\d+) (.*)", "\\1 \\3 (\\1 - \\2)", ingredient)

        # if amount and unit are connected add space in between
        if re.match('([0-9])+([A-z])+\\s', ingredient):
            ingredient = re.sub(r'(?<=([a-z])|\d)(?=(?(1)\d|[a-z]))', ' ', ingredient)

        if not self.ignore_rules:
            ingredient = self.automation.apply_transpose_automation(ingredient)

        tokens = ingredient.split()  # split at each space into tokens
        if len(tokens) == 1:
            # there only is one argument, that must be the food
            food = tokens[0]
        else:
            try:
                # try to parse first argument as amount
                amount, unit, unit_note = self.parse_amount(tokens[0])
                # only try to parse second argument as amount if there are at least
                # three arguments if it already has a unit there can't be
                # a fraction for the amount
                if len(tokens) > 2:
                    if not self.ignore_rules:
                        tokens = self.automation.apply_never_unit_automation(tokens)
                    try:
                        if unit is not None:
                            # a unit is already found, no need to try the second argument for a fraction
                            # probably not the best method to do it, but I didn't want to make an if check and paste the exact same thing in the else as already is in the except
                            raise ValueError
                        # try to parse second argument as amount and add that, in case of '2 1/2' or '2 ½'
                        amount += self.parse_fraction(tokens[1])
                        # assume that units can't end with a comma
                        if len(tokens) > 3 and not tokens[2].endswith(','):
                            # try to use third argument as unit and everything else as food, use everything as food if it fails
                            try:
                                food, note = self.parse_food(tokens[3:])
                                unit = tokens[2]
                            except ValueError:
                                food, note = self.parse_food(tokens[2:])
                        else:
                            food, note = self.parse_food(tokens[2:])
                    except ValueError:
                        # assume that units can't end with a comma
                        if not tokens[1].endswith(','):
                            # try to use second argument as unit and everything else as food, use everything as food if it fails
                            try:
                                food, note = self.parse_food(tokens[2:])
                                if unit is None:
                                    unit = tokens[1]
                                else:
                                    note = tokens[1]
                            except ValueError:
                                food, note = self.parse_food(tokens[1:])
                        else:
                            food, note = self.parse_food(tokens[1:])
                else:
                    # only two arguments, first one is the amount
                    # which means this is the food
                    food = tokens[1]
            except ValueError:
                try:
                    # can't parse first argument as amount
                    # -> no unit -> parse everything as food
                    food, note = self.parse_food(tokens)
                except ValueError:
                    food = ' '.join(tokens[1:])

        if unit_note not in note:
            note += ' ' + unit_note

        if unit and not self.ignore_rules:
            unit = self.automation.apply_unit_automation(unit)

        if food and not self.ignore_rules:
            food = self.automation.apply_food_automation(food)
        if len(food) > Food._meta.get_field('name').max_length:  # test if food name is to long
            # try splitting it at a space and taking only the first arg
            if len(food.split()) > 1 and len(food.split()[0]) < Food._meta.get_field('name').max_length:
                note = ' '.join(food.split()[1:]) + ' ' + note
                food = food.split()[0]
            else:
                note = food + ' ' + note
                food = food[:Food._meta.get_field('name').max_length]

        if len(food.strip()) == 0:
            raise ValueError(f'Error parsing string {ingredient}, food cannot be empty')

        return amount, unit, food, note[:Ingredient._meta.get_field('note').max_length].strip()
