from django import template
import markdown as md
import bleach
from bleach_whitelist import markdown_tags, markdown_attrs
from django.templatetags.static import static

from cookbook.models import UserPreference

register = template.Library()


@register.filter(name='get_class')
def get_class(value):
    return value.__class__.__name__


@register.filter()
def markdown(value):
    return bleach.clean(md.markdown(value, extensions=['markdown.extensions.fenced_code']), markdown_tags, markdown_attrs)


@register.simple_tag
def theme_url(request):
    try:
        themes = {
            UserPreference.BOOTSTRAP: 'themes/bootstrap.min.css',
            UserPreference.FLATLY: 'themes/flatly.min.css',
            UserPreference.DARKLY: 'themes/darkly.min.css',
            UserPreference.SUPERHERO: 'themes/superhero.min.css',
        }
        if request.user.userpreference.theme in themes:
            return static(themes[request.user.userpreference.theme])
        else:
            raise AttributeError
    except AttributeError:
        return static('themes/bootstrap.min.css')
