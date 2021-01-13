import bleach
import markdown as md
from bleach_whitelist import markdown_attrs, markdown_tags
from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension
from jinja2 import Template, TemplateSyntaxError


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
            self.unit = bleach.clean(str(ingredient.unit))
        else:
            self.unit = ""
        self.food = bleach.clean(str(ingredient.food))
        self.note = bleach.clean(str(ingredient.note))

    def __str__(self):
        ingredient = self.amount
        if self.unit != "":
            ingredient += f' {self.unit}'
        return f'{ingredient} {self.food}'


def render_instructions(step):  # TODO deduplicate markdown cleanup code
    instructions = step.instruction

    tags = markdown_tags + [
        'pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead'
    ]
    parsed_md = md.markdown(
        instructions,
        extensions=[
            'markdown.extensions.fenced_code', 'tables',
            UrlizeExtension(), MarkdownFormatExtension()
        ]
    )
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']

    instructions = bleach.clean(parsed_md, tags, markdown_attrs)

    ingredients = []

    for i in step.ingredients.all():
        ingredients.append(IngredientObject(i))

    try:
        template = Template(instructions)
        instructions = template.render(ingredients=ingredients)
    except TemplateSyntaxError:
        pass

    return instructions
