import html
from gettext import gettext as _

import bleach
import markdown as md
from jinja2 import TemplateSyntaxError, UndefinedError
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
    return (
        f"<plural-name"
        f' singular="{html.escape(singular)}"'
        f' plural="{html.escape(plural_name)}"'
        f" v-bind:amount='{float(amount)}'"
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
            self.amount = f"<scalable-number v-bind:number='{bleach.clean(str(ingredient.amount))}' v-bind:factor='ingredient_factor'></scalable-number>"
            self.numeric_amount = float(ingredient.amount)
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

    tags = {
        "h1", "h2", "h3", "h4", "h5", "h6",
        "b", "i", "strong", "em", "tt",
        "p", "br",
        "span", "div", "blockquote", "code", "pre", "hr",
        "ul", "ol", "li", "dd", "dt",
        "img",
        "a",
        "sub", "sup",
        'pre', 'table', 'td', 'tr', 'th', 'tbody', 'thead'
    }
    parsed_md = md.markdown(
        instructions,
        extensions=[
            'markdown.extensions.fenced_code', 'markdown.extensions.sane_lists', 'markdown.extensions.nl2br', TableExtension(),
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

    def scale(number):
        return f"<scalable-number v-bind:number='{bleach.clean(str(number))}' v-bind:factor='ingredient_factor'></scalable-number>"

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
    except Exception:
        return _('Could not parse template code.') + ' Error generating template.'

    return instructions
