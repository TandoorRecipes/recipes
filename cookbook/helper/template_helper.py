import bleach
import markdown as md
from bleach_whitelist import markdown_tags, markdown_attrs
from jinja2 import Template, TemplateSyntaxError

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
            self.amount = f'[[calculateAmount({ingredient.amount})]]'
        if ingredient.unit:
            self.unit = ingredient.unit
        else:
            self.unit = ""
        self.food = ingredient.food
        self.note = ingredient.note

    def __str__(self):
        ingredient = self.amount
        if self.unit != "":
            ingredient += f' {self.unit}'
        return f'{ingredient} {self.food}'


def render_instructions(step):  # TODO deduplicate markdown cleanup code

    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    try:
        template = Template(step.instruction)
        instructions = template.render(ingredients=ingredients)
    except TemplateSyntaxError:
        instructions = step.instruction

    tags = markdown_tags + ['pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead']
    parsed_md = md.markdown(instructions, extensions=['markdown.extensions.fenced_code', 'tables', UrlizeExtension(), MarkdownFormatExtension()])
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']

    return bleach.clean(parsed_md, tags, markdown_attrs)
