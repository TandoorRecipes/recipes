import bleach
import markdown as md
from bleach_whitelist import markdown_tags, markdown_attrs
from jinja2 import Template

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension


class IngredientObject(object):
    amount = None
    unit = None
    food = None

    def __init__(self, ingredient):
        self.amount = f'[[calculateAmount({ingredient.amount})]]'
        self.unit = ingredient.unit
        self.food = ingredient.food

    def __str__(self):
        return f'{self.amount} {self.unit} {self.food}'


def render_instructions(step):  # TODO deduplicate markdown cleanup code

    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    template = Template(step.instruction)
    instructions = template.render(ingredients=ingredients)

    tags = markdown_tags + ['pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead']
    parsed_md = md.markdown(instructions, extensions=['markdown.extensions.fenced_code', 'tables', UrlizeExtension(), MarkdownFormatExtension()])
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']

    return bleach.clean(parsed_md, tags, markdown_attrs)
