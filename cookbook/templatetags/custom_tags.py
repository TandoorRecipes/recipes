import bleach
import markdown as md
from bleach_whitelist import markdown_tags, markdown_attrs
from django import template
from django.db.models import Avg
from django.urls import reverse, NoReverseMatch

from cookbook.helper.mdx_attributes import MarkdownFormatExtension
from cookbook.helper.mdx_urlize import UrlizeExtension
from cookbook.models import get_model_name
from recipes import settings

register = template.Library()


@register.filter()
def get_class_name(value):
    return value.__class__.__name__


@register.filter()
def get_class(value):
    return value.__class__


@register.simple_tag
def delete_url(model, pk):
    try:
        return reverse(f'delete_{get_model_name(model)}', args=[pk])
    except NoReverseMatch:
        return None


@register.filter()
def markdown(value):
    tags = markdown_tags + ['pre', 'table', 'td', 'tr', 'th', 'tbody', 'style', 'thead']
    parsed_md = md.markdown(value, extensions=['markdown.extensions.fenced_code', 'tables', UrlizeExtension(), MarkdownFormatExtension()])
    markdown_attrs['*'] = markdown_attrs['*'] + ['class']
    return bleach.clean(parsed_md, tags, markdown_attrs)


@register.simple_tag
def recipe_rating(recipe, user):
    if not user.is_authenticated:
        return ''
    rating = recipe.cooklog_set.filter(created_by=user).aggregate(Avg('rating'))
    if rating['rating__avg']:

        rating_stars = ''
        for i in range(int(rating['rating__avg'])):
            rating_stars = rating_stars + '<i class="fas fa-star fa-xs"></i>'

        if rating['rating__avg'] % 1 >= 0.5:
            rating_stars = rating_stars + '<i class="fas fa-star-half-alt fa-xs"></i>'

        return rating_stars
    else:
        return ''


@register.simple_tag
def recipe_last(recipe, user):
    if not user.is_authenticated:
        return ''
    last = recipe.cooklog_set.filter(created_by=user).last()
    if last:
        return last.created_at
    else:
        return ''


@register.simple_tag
def is_debug():
    return settings.DEBUG
