from django import template
import markdown as md

register = template.Library()


@register.filter(name='get_class')
def get_class(value):
    return value.__class__.__name__


@register.filter()
def markdown(value):
    return md.markdown(value, extensions=['markdown.extensions.fenced_code'])
