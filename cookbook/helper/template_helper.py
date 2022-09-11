from gettext import gettext as _

import bleach
import markdown as md
from bleach_allowlist import markdown_attrs, markdown_tags
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


def render_instructions(step):  # TODO deduplicate markdown cleanup code
    instructions = step.instruction

    tags = markdown_tags + [
        'pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead', 'img'
    ]
    parsed_md = md.markdown(
        instructions,
        extensions=[
            'markdown.extensions.fenced_code', TableExtension(),
            UrlizeExtension(), MarkdownFormatExtension()
        ]
    )
    markdown_attrs['*'] = markdown_attrs['*'] + ['class', 'width', 'height']

    instructions = bleach.clean(parsed_md, tags, markdown_attrs)

    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    try:
        template = Template(instructions)
        instructions = template.render(ingredients=ingredients)
    except TemplateSyntaxError:
        return _('Could not parse template code.') + ' Error: Template Syntax broken'
    except UndefinedError:
        return _('Could not parse template code.') + ' Error: Undefined Error'

    return instructions
