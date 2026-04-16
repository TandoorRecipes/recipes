import html
import re
from gettext import gettext as _

import bleach
import markdown as md
from jinja2 import Template, TemplateSyntaxError, UndefinedError
from jinja2.exceptions import SecurityError
from jinja2.sandbox import SandboxedEnvironment
from markdown.extensions.tables import TableExtension

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension


def _resolve_unit_name(ingredient):
    """Return the appropriate unit name (singular or plural) for an ingredient."""
    if not ingredient.unit:
        return ""
    if ingredient.no_amount:
        return str(ingredient.unit)
    if ingredient.unit.plural_name in (None, ""):
        return str(ingredient.unit)
    if ingredient.amount == 1:
        return str(ingredient.unit)
    return ingredient.unit.plural_name


def _resolve_food_name(ingredient):
    """Return the appropriate food name (singular or plural) for an ingredient."""
    if not ingredient.food:
        return ""
    if ingredient.no_amount:
        return str(ingredient.food)
    if ingredient.food.plural_name in (None, ""):
        return str(ingredient.food)
    if ingredient.amount == 1:
        return str(ingredient.food)
    return ingredient.food.plural_name


def _plural_name_tag(singular, plural_name, amount, no_amount):
    """Build a <plural-name> Vue component tag for reactive pluralization.

    Returns a static string if no plural_name exists, otherwise a reactive tag.
    """
    if plural_name in (None, ""):
        return html.escape(singular)

    try:
        amount_val = float(amount)
    except (ValueError, TypeError):
        amount_val = 0.0

    return (
        f"<plural-name"
        f' singular="{html.escape(singular)}"'
        f' plural="{html.escape(plural_name)}"'
        f" v-bind:amount='{amount_val}'"
        f" v-bind:factor='ingredient_factor'"
        f" :no-amount='{str(no_amount).lower()}'"
        f"></plural-name>"
    )


class IngredientObject(object):
    amount = ""
    unit = ""
    food = ""
    note = ""
    numeric_amount = 0

    def __init__(self, ingredient):
        if ingredient.no_amount:
            self.amount = ""
        else:
            try:
                amount_val = float(ingredient.amount)
            except (ValueError, TypeError):
                amount_val = 0.0
            self.amount = f"<scalable-number v-bind:number='{amount_val}' v-bind:factor='ingredient_factor'></scalable-number>"
            self.numeric_amount = amount_val
        self.unit = bleach.clean(_resolve_unit_name(ingredient))
        if ingredient.food:
            if ingredient.food.plural_name in (None, ""):
                self.food = bleach.clean(_resolve_food_name(ingredient))
            else:
                self.food = _plural_name_tag(
                    str(ingredient.food),
                    ingredient.food.plural_name,
                    ingredient.amount,
                    ingredient.no_amount,
                )
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

    allowed_tags = [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "b", "i", "strong", "em", "tt",
        "p", "br",
        "span", "div", "blockquote", "code", "pre", "hr",
        "ul", "ol", "li", "dd", "dt",
        "img",
        "a",
        "sub", "sup",
        'pre', 'table', 'td', 'tr', 'th', 'tbody', 'thead',
    ]

    allowed_attributes = {
        "*": ["id", "class", 'width', 'height'],
        "img": ["src", "alt", "title"],
        "a": ["href", "alt", "title"],
    }

    # do a first, strict round of cleaning
    instructions = bleach.clean(instructions, allowed_tags, allowed_attributes)

    # parse markdown
    instructions = md.markdown(
        instructions,
        extensions=[
            'markdown.extensions.fenced_code', 'markdown.extensions.sane_lists', 'markdown.extensions.nl2br', TableExtension(),
            UrlizeExtension(), MarkdownFormatExtension()
        ]
    )

    # prepare template context
    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    def scale(number):
        try:
            number_val = float(number)
        except (ValueError, TypeError):
            number_val = 0.0
        return f"<scalable-number v-bind:number='{number_val}' v-bind:factor='ingredient_factor'></scalable-number>"

    # compile template
    try:
        env = SandboxedEnvironment()
        instructions = env.from_string(instructions).render(ingredients=ingredients, scale=scale)
    except TemplateSyntaxError:
        return _('Could not parse template code.') + ' Error: Template Syntax broken'
    except TypeError:
        return _('Could not parse template code.') + ' Error: Unsupported types'
    except UndefinedError:
        return _('Could not parse template code.') + ' Error: Undefined Error'
    except SecurityError:
        return _('Could not parse template code.') + ' Error: Security Error'
    except Exception as e:
        return _('Could not parse template code.') + f' Error generating template.'

    # do second cleaning that allows scalable-number but only when v-bind:number is a float and v-bind:factor is 'ingredient_factor'
    def validate_scalable_number_attributes(tag, name, value):
        if name == 'v-bind:number':
            try:
                float(value)
                return True
            except (ValueError, TypeError):
                return False
        if name == 'v-bind:factor':
            return value == 'ingredient_factor'
        return False

    allowed_attributes["scalable-number"] = validate_scalable_number_attributes

    allowed_tags.append('scalable-number')

    instructions = bleach.clean(instructions, allowed_tags, allowed_attributes)

    # remove any left over { }
    instructions = instructions.replace('{','')
    instructions = instructions.replace('}','')

    return instructions
