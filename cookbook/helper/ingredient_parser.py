import string
import unicodedata

from cookbook.models import Unit, Food


def parse_fraction(x):
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


def parse_amount(x):
    amount = 0
    unit = ''

    did_check_frac = False
    end = 0
    while (
            end < len(x)
            and (
                    x[end] in string.digits
                    or (
                            (x[end] == '.' or x[end] == ',' or x[end] == '/')
                            and end + 1 < len(x)
                            and x[end + 1] in string.digits
                    )
            )
    ):
        end += 1
    if end > 0:
        if "/" in x[:end]:
            amount = parse_fraction(x[:end])
        else:
            amount = float(x[:end].replace(',', '.'))
    else:
        amount = parse_fraction(x[0])
        end += 1
        did_check_frac = True
    if end < len(x):
        if did_check_frac:
            unit = x[end:]
        else:
            try:
                amount += parse_fraction(x[end])
                unit = x[end + 1:]
            except ValueError:
                unit = x[end:]
    return amount, unit


def parse_ingredient_with_comma(tokens):
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


def parse_ingredient(tokens):
    ingredient = ''
    note = ''
    if tokens[-1].endswith(')'):
        # Check if the matching opening bracket is in the same token
        if (not tokens[-1].startswith('(')) and ('(' in tokens[-1]):
            return parse_ingredient_with_comma(tokens)
        # last argument ends with closing bracket -> look for opening bracket
        start = len(tokens) - 1
        while not tokens[start].startswith('(') and not start == 0:
            start -= 1
        if start == 0:
            # the whole list is wrapped in brackets -> assume it is an error (e.g. assumed first argument was the unit)  # noqa: E501
            raise ValueError
        elif start < 0:
            # no opening bracket anywhere -> just ignore the last bracket
            ingredient, note = parse_ingredient_with_comma(tokens)
        else:
            # opening bracket found -> split in ingredient and note, remove brackets from note  # noqa: E501
            note = ' '.join(tokens[start:])[1:-1]
            ingredient = ' '.join(tokens[:start])
    else:
        ingredient, note = parse_ingredient_with_comma(tokens)
    return ingredient, note


def parse(x):
    # initialize default values
    amount = 0
    unit = ''
    ingredient = ''
    note = ''

    tokens = x.split()
    if len(tokens) == 1:
        # there only is one argument, that must be the ingredient
        ingredient = tokens[0]
    else:
        try:
            # try to parse first argument as amount
            amount, unit = parse_amount(tokens[0])
            # only try to parse second argument as amount if there are at least
            # three arguments if it already has a unit there can't be
            # a fraction for the amount
            if len(tokens) > 2:
                try:
                    if not unit == '':
                        # a unit is already found, no need to try the second argument for a fraction  # noqa: E501
                        # probably not the best method to do it, but I didn't want to make an if check and paste the exact same thing in the else as already is in the except  # noqa: E501
                        raise ValueError
                    # try to parse second argument as amount and add that, in case of '2 1/2' or '2 ½'  # noqa: E501
                    amount += parse_fraction(tokens[1])
                    # assume that units can't end with a comma
                    if len(tokens) > 3 and not tokens[2].endswith(','):
                        # try to use third argument as unit and everything else as ingredient, use everything as ingredient if it fails  # noqa: E501
                        try:
                            ingredient, note = parse_ingredient(tokens[3:])
                            unit = tokens[2]
                        except ValueError:
                            ingredient, note = parse_ingredient(tokens[2:])
                    else:
                        ingredient, note = parse_ingredient(tokens[2:])
                except ValueError:
                    # assume that units can't end with a comma
                    if not tokens[1].endswith(','):
                        # try to use second argument as unit and everything else as ingredient, use everything as ingredient if it fails  # noqa: E501
                        try:
                            ingredient, note = parse_ingredient(tokens[2:])
                            unit = tokens[1]
                        except ValueError:
                            ingredient, note = parse_ingredient(tokens[1:])
                    else:
                        ingredient, note = parse_ingredient(tokens[1:])
            else:
                # only two arguments, first one is the amount
                # which means this is the ingredient
                ingredient = tokens[1]
        except ValueError:
            try:
                # can't parse first argument as amount
                # -> no unit -> parse everything as ingredient
                ingredient, note = parse_ingredient(tokens)
            except ValueError:
                ingredient = ' '.join(tokens[1:])
    return amount, unit.strip(), ingredient.strip(), note.strip()


# small utility functions to prevent emtpy unit/food creation
def get_unit(unit, space):
    if len(unit) > 0:
        u, created = Unit.objects.get_or_create(name=unit, space=space)
        return u
    return None


def get_food(food, space):
    if len(food) > 0:
        f, created = Food.objects.get_or_create(name=food, space=space)
        return f
    return None
