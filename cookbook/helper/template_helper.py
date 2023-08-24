from gettext import gettext as _

import bleach
import markdown as md
from jinja2 import Template, TemplateSyntaxError, UndefinedError
from markdown.extensions.tables import TableExtension

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension


class IngredientObject(object):
    amount = ""
    unit = ""
    food = ""
    note = ""

    def __init__(self, ingredient):
        if ingredient.no_amount:
            self.amount = ""
        else:
            self.amount = f"<scalable-number v-bind:number='{bleach.clean(str(ingredient.amount))}' v-bind:factor='ingredient_factor'></scalable-number>"
        if ingredient.unit:
            if ingredient.unit.plural_name in (None, ""):
                self.unit = bleach.clean(str(ingredient.unit))
            else:
                if ingredient.always_use_plural_unit or ingredient.amount > 1 and not ingredient.no_amount:
                    self.unit = bleach.clean(ingredient.unit.plural_name)
                else:
                    self.unit = bleach.clean(str(ingredient.unit))
        else:
            self.unit = ""
        if ingredient.food:
            if ingredient.food.plural_name in (None, ""):
                self.food = bleach.clean(str(ingredient.food))
            else:
                if ingredient.always_use_plural_food or ingredient.amount > 1 and not ingredient.no_amount:
                    self.food = bleach.clean(str(ingredient.food.plural_name))
                else:
                    self.food = bleach.clean(str(ingredient.food))
        else:
            self.food = ""
        self.note = bleach.clean(str(ingredient.note))

    def __str__(self):
        ingredient = self.amount
        if self.unit != "":
            ingredient += f' {self.unit}'
        return f'{ingredient} {self.food}'


class EquipmentSetObject(object):
    equipment = ""
    amount = ""
    note = ""

    def __init__(self, equipmentset):
        if equipmentset.amount >= 0:
            self.amount = ""
        else:
            self.amount = f"<scalable-number v-bind:number='{bleach.clean(str(equipmentset.amount))}' v-bind:factor='equipmentset_factor'></scalable-number>"

        if equipmentset.equipment:
            if equipmentset.equipment.plural_name in (None, ""):
                self.equipment = bleach.clean(str(equipmentset.equipment))
            else:
                if equipmentset.equipment.always_use_plural or equipmentset.amount > 1:
                    self.equipment = bleach.clean(str(equipmentset.equipment.plural_name))
                else:
                    self.equipment = bleach.clean(str(equipmentset.equipment))
        else:
            self.equipment = ""
        self.note = bleach.clean(str(equipmentset.note))
    
    def __str__(self):
        if self.amount != "":
            return self.equipment
        else:
            return f'{self.amount} {self.equipment}'


def render_instructions(step):  # TODO deduplicate markdown cleanup code
    instructions = step.instruction

    tags = {
        "h1", "h2", "h3", "h4", "h5", "h6",
        "b", "i", "strong", "em", "tt",
        "p", "br",
        "span", "div", "blockquote", "code", "pre", "hr",
        "ul", "ol", "li", "dd", "dt",
        "img",
        "a",
        "sub", "sup",
        'pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead'
    }
    parsed_md = md.markdown(
        instructions,
        extensions=[
            'markdown.extensions.fenced_code', TableExtension(),
            UrlizeExtension(), MarkdownFormatExtension()
        ]
    )
    markdown_attrs = {
        "*": ["id", "class", 'width', 'height'],
        "img": ["src", "alt", "title"],
        "a": ["href", "alt", "title"],
    }

    instructions = bleach.clean(parsed_md, tags, markdown_attrs)

    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    equipmentsets = []
    for e in step.equipmentsets.all():
        equipmentsets.append(EquipmentSetObject(e))

    try:
        template = Template(instructions)
        instructions = template.render(ingredients=ingredients, equipmentsets=equipmentsets)
    except TemplateSyntaxError:
        return _('Could not parse template code.') + ' Error: Template Syntax broken'
    except UndefinedError:
        return _('Could not parse template code.') + ' Error: Undefined Error'

    return instructions
