import re
import string
import unicodedata

from django.core.cache import caches

from cookbook.models import Equipment, EquipmentSet, Automation

class EquipmentSetParser:
    request = None
    ignore_rules = False,
    equipment_aliases = {}

    def __init__(self, request, cache_mode, ignore_automations=False):
        self.request = request
        self.ignore_rules  = ignore_automations

        if cache_mode:
            EQUIPMENT_CACHE_KEY = f'automation_equipment_alias_{self.request.space.pk}'
            if c:= caches['default'].get(EQUIPMENT_CACHE_KEY, None):
                self.equipment_aliases = c
                caches['default'].touch(EQUIPMENT_CACHE_KEY, 30)
            else:
                for a in Automation.objects.filter(space=self.request.space, disabled=False, type=Automation.EQUIPMENT_ALIAS).only('param_1', 'param_2').order_by('order').all():
                    self.equipment_aliases[a.param_1] = a.param_2
                caches['default'].set(EQUIPMENT_CACHE_KEY, self.equipment_aliases, 30)
        else:
            self.equipment_aliases = {}

    def apply_equipment_automation(self, equipment):
        if self.ignore_rules:
            return equipment
        else:
            if self.equipment_aliases:
                try:
                    return self.equipment_aliases[equipment]
                except KeyError:
                    return equipment
            else:
                if automation := Automation.objects.filter(space=self.request.space, type=Automation.EQUIPMENT_ALIAS, param_1=equipment, disabled=False).order_by('order').first():
                    return automation.param_2
        return equipment

    def get_equipment(self, equipment):
        if not equipment:
            return None
        if len(equipment) > 0:
            f, created = Equipment.objects.get_or_create(name=self.apply_equipment_automation(equipment), space=self.request.space)
            return f
        return None
    
    def parse_equipment_with_comma(self, tokens):
        equipment = ''
        note = ''
        start = 0
        # search for first occurrence of an argument ending in a comma
        while start < len(tokens) and not tokens[start].endswith(','):
            start += 1
        if start == len(tokens):
            # no token ending in a comma found -> use everything as equipment
            equipment = ' '.join(tokens)
        else:
            equipment = ' '.join(tokens[:start + 1])[:-1]
            note = ' '.join(tokens[start + 1:])
        return equipment, note
    
    def parse_equipment(self, tokens):
        equipment = ''
        note = ''
        if tokens[-1].endswith(')'):
            # Check if the matching opening bracket is in the same token
            if (not tokens[-1].startswith('(')) and ('(' in tokens[-1]):
                return self.parse_equipment_with_comma(tokens)
            # last argument ends with closing bracket -> look for opening bracket
            start = len(tokens) - 1
            while not tokens[start].startswith('(') and not start == 0:
                start -= 1
            if start == 0:
                # the whole list is wrapped in brackets -> assume it is an error (e.g. assumed first argument was the unit)  # noqa: E501
                raise ValueError
            elif start < 0:
                # no opening bracket anywhere -> just ignore the last bracket
                equipment, note = self.parse_equipment_with_comma(tokens)
            else:
                # opening bracket found -> split in equipment and note, remove brackets from note  # noqa: E501
                note = ' '.join(tokens[start:])[1:-1]
                equipment = ' '.join(tokens[:start])
        else:
            equipment, note = self.parse_equipment_with_comma(tokens)
        return equipment, note

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
        if x.strip() == '':
            return amount

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
        if end < len(x):
            amount += self.parse_fraction(x[end])
        return amount

    def parse(self, equipmentset):
        # initialize default values
        amount = 0
        equipment = ''
        note = ''

        if len(equipmentset) == 0:
            raise ValueError('string to parse cannot be empty')

        if len(equipmentset) < 1000 and re.search(r'^([^\W\d_])+(.)*[1-9](\d)*\s*([^\W\d_])+', equipmentset):
            match = re.search(r'[1-9](\d)*\s*([^\W\d_])+', equipmentset)
            print(f'reording from {equipmentset} to {equipmentset[match.start():match.end()] + " " + equipmentset.replace(equipmentset[match.start():match.end()], "")}')
            equipmentset = equipmentset[match.start():match.end()] + ' ' + equipmentset.replace(equipmentset[match.start():match.end()], '')

        # if the string contains parenthesis early on remove it and place it at the end
        # because its likely some kind of note
        if re.match('(.){1,6}\s\((.[^\(\)])+\)\s', equipmentset):
            match = re.search('\((.[^\(])+\)', equipmentset)
            equipmentset = equipmentset[:match.start()] + equipmentset[match.end():] + ' ' + equipmentset[match.start():match.end()]

        # leading spaces before commas result in extra tokens, clean them out
        equipmentset = equipmentset.replace(' ,', ',')

        # handle "(from) - (to)" amounts by using the minimum amount and adding the range to the description
        # "10.5 - 200 g XYZ" => "100 g XYZ (10.5 - 200)"
        equipmentset = re.sub("^(\d+|\d+[\\.,]\d+) - (\d+|\d+[\\.,]\d+) (.*)", "\\1 \\3 (\\1 - \\2)", equipmentset)

        # if amount and unit are connected add space in between
        if re.match('([0-9])+([A-z])+\s', equipmentset):
            equipmentset = re.sub(r'(?<=([a-z])|\d)(?=(?(1)\d|[a-z]))', ' ', equipmentset)

        tokens = equipmentset.split()  # split at each space into tokens
        if len(tokens) == 1:
            # there only is one argument, that must be the equipment
            equipment = tokens[0]
        else:
            try:
                # try to parse first argument as amount
                amount = self.parse_amount(tokens[0])
                # only try to parse second argument as amount if there are at least
                # three arguments if it already has a unit there can't be
                # a fraction for the amount
                if len(tokens) > 2:
                    try:
                        # try to parse second argument as amount and add that, in case of '2 1/2' or '2 ½'
                        amount += self.parse_fraction(tokens[1])
                        equipment, note = self.parse_equipment(tokens[2:])
                    except ValueError:
                        # assume that units can't end with a comma
                        if not tokens[1].endswith(','):
                            equipment, note = self.parse_equipment(tokens[1:])
                        else:
                            equipment, note = self.parse_equipment(tokens[1:])
                else:
                    equipment = tokens[1]
            except ValueError:
                try:
                    equipment, note = self.parse_equipment(tokens)
                except ValueError:
                    equipment = ' '.join(tokens[1:])

        equipment = self.apply_equipment_automation(equipment.strip())
        if len(equipment) > Equipment._meta.get_field('name').max_length:  # test if equipment name is to long
            # try splitting it at a space and taking only the first arg
            if len(equipment.split()) > 1 and len(equipment.split()[0]) < Equipment._meta.get_field('name').max_length:
                note = ' '.join(equipment.split()[1:]) + ' ' + note
                equipment = equipment.split()[0]
            else:
                note = equipment + ' ' + note
                equipment = equipment[:Equipment._meta.get_field('name').max_length]

        if len(equipment.strip()) == 0:
            raise ValueError(f'Error parsing string {equipmentset}, equipment cannot be empty')

        return amount, equipment, note[:EquipmentSet._meta.get_field('note').max_length].strip()