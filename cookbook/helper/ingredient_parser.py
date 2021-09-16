import re
import string
import unicodedata

from cookbook.models import Unit, Food


class IngredientParser:
    request = None
    ignore_rules = False
    food_aliases = []
    unit_aliases = []

    def __init__(self, request, cache_mode, ignore_automations=False):
        """
        Initialize ingredient parser
        :param request: request context (to control caching, rule ownership, etc.)
        :param cache_mode: defines if all rules should be loaded on initialization (good when parser is used many times) or if they should be retrieved every time (good when parser is not used many times in a row)
        :param ignore_automations: ignore automation rules, allows to use ingredient parser without database access/request (request can be None)
        """
        self.request = request
        self.ignore_rules = ignore_automations
        if cache_mode:
            self.food_aliases = []
            self.unit_aliases = []

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
        unit = ''
        note = ''

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

        if unit.startswith('(') or unit.startswith('-'):  # i dont know any unit that starts with ( or - so its likely an alternative like 1L (500ml) Water or 2-3
            unit = ''
            note = x
        return amount, unit, note

    def parse_ingredient_with_comma(self, tokens):
        ingredient = ''
        note = ''
        start = 0
        # search for first occurrence of an argument ending in a comma
        while start < len(tokens) and not tokens[start].endswith(','):
            start += 1
        if start == len(tokens):
            # no token ending in a comma found -> use everything as ingredient
            ingredient = ' '.join(tokens)
        else:
            ingredient = ' '.join(tokens[:start + 1])[:-1]
            note = ' '.join(tokens[start + 1:])
        return ingredient, note

    def parse_ingredient(self, tokens):
        ingredient = ''
        note = ''
        if tokens[-1].endswith(')'):
            # Check if the matching opening bracket is in the same token
            if (not tokens[-1].startswith('(')) and ('(' in tokens[-1]):
                return self.parse_ingredient_with_comma(tokens)
            # last argument ends with closing bracket -> look for opening bracket
            start = len(tokens) - 1
            while not tokens[start].startswith('(') and not start == 0:
                start -= 1
            if start == 0:
                # the whole list is wrapped in brackets -> assume it is an error (e.g. assumed first argument was the unit)  # noqa: E501
                raise ValueError
            elif start < 0:
                # no opening bracket anywhere -> just ignore the last bracket
                ingredient, note = self.parse_ingredient_with_comma(tokens)
            else:
                # opening bracket found -> split in ingredient and note, remove brackets from note  # noqa: E501
                note = ' '.join(tokens[start:])[1:-1]
                ingredient = ' '.join(tokens[:start])
        else:
            ingredient, note = self.parse_ingredient_with_comma(tokens)
        return ingredient, note

    def parse(self, x):
        # initialize default values
        amount = 0
        unit = ''
        ingredient = ''
        note = ''
        unit_note = ''

        # if the string contains parenthesis early on remove it and place it at the end
        # because its likely some kind of note
        if re.match('(.){1,6}\s\((.[^\(\)])+\)\s', x):
            match = re.search('\((.[^\(])+\)', x)
            x = x[:match.start()] + x[match.end():] + ' ' + x[match.start():match.end()]

        tokens = x.split()
        if len(tokens) == 1:
            # there only is one argument, that must be the ingredient
            ingredient = tokens[0]
        else:
            try:
                # try to parse first argument as amount
                amount, unit, unit_note = self.parse_amount(tokens[0])
                # only try to parse second argument as amount if there are at least
                # three arguments if it already has a unit there can't be
                # a fraction for the amount
                if len(tokens) > 2:
                    try:
                        if not unit == '':
                            # a unit is already found, no need to try the second argument for a fraction
                            # probably not the best method to do it, but I didn't want to make an if check and paste the exact same thing in the else as already is in the except  # noqa: E501
                            raise ValueError
                        # try to parse second argument as amount and add that, in case of '2 1/2' or '2 ½'
                        amount += self.parse_fraction(tokens[1])
                        # assume that units can't end with a comma
                        if len(tokens) > 3 and not tokens[2].endswith(','):
                            # try to use third argument as unit and everything else as ingredient, use everything as ingredient if it fails  # noqa: E501
                            try:
                                ingredient, note = self.parse_ingredient(tokens[3:])
                                unit = tokens[2]
                            except ValueError:
                                ingredient, note = self.parse_ingredient(tokens[2:])
                        else:
                            ingredient, note = self.parse_ingredient(tokens[2:])
                    except ValueError:
                        # assume that units can't end with a comma
                        if not tokens[1].endswith(','):
                            # try to use second argument as unit and everything else as ingredient, use everything as ingredient if it fails  # noqa: E501
                            try:
                                ingredient, note = self.parse_ingredient(tokens[2:])
                                if unit == '':
                                    unit = tokens[1]
                                else:
                                    note = tokens[1]
                            except ValueError:
                                ingredient, note = self.parse_ingredient(tokens[1:])
                        else:
                            ingredient, note = self.parse_ingredient(tokens[1:])
                else:
                    # only two arguments, first one is the amount
                    # which means this is the ingredient
                    ingredient = tokens[1]
            except ValueError:
                try:
                    # can't parse first argument as amount
                    # -> no unit -> parse everything as ingredient
                    ingredient, note = self.parse_ingredient(tokens)
                except ValueError:
                    ingredient = ' '.join(tokens[1:])

        if unit_note not in note:
            note += ' ' + unit_note
        return amount, unit.strip(), ingredient.strip(), note.strip()

    def get_unit(self, unit):
        """
        Get or create a unit for given space respecting possible automations
        :param unit: string unit
        :return: None if unit passed is invalid, Unit object otherwise
        """
        if not unit:
            return None
        if len(unit) > 0:
            u, created = Unit.objects.get_or_create(name=unit, space=self.request.space)
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
            f, created = Food.objects.get_or_create(name=food, space=self.request.space)
            return f
        return None
