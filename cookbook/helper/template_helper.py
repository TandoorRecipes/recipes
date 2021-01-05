import bleach
import markdown as md
from bleach_whitelist import markdown_tags, markdown_attrs
from jinja2 import Template

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension


def render_instructions(step):  # TODO deduplicate markdown cleanup code

    template = Template(step.instruction)
    instructions = template.render(ingredients=step.ingredients.all())

    tags = markdown_tags + ['pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead']
    parsed_md = md.markdown(instructions, extensions=['markdown.extensions.fenced_code', 'tables', UrlizeExtension(), MarkdownFormatExtension()])
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']

    return bleach.clean(parsed_md, tags, markdown_attrs)
