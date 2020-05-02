from django import template
import markdown as md
import bleach
from bleach_whitelist import markdown_tags, markdown_attrs, all_styles, print_attrs
from django.urls import reverse

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension
from cookbook.models import get_model_name

register = template.Library()


@register.filter()
def get_class_name(value):
    return value.__class__.__name__


@register.filter()
def get_class(value):
    return value.__class__


@register.simple_tag
def delete_url(model, pk):
    return reverse(f'delete_{get_model_name(model)}', args=[pk])


@register.filter()
def markdown(value):
    tags = markdown_tags + ['pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead']
    parsed_md = md.markdown(value, extensions=['markdown.extensions.fenced_code', 'tables',  UrlizeExtension(), MarkdownFormatExtension()])
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']
    return bleach.clean(parsed_md, tags, markdown_attrs)
