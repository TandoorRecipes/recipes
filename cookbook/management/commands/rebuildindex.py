from django.conf import settings
from django.contrib.postgres.search import SearchVector
from django.core.management.base import BaseCommand
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled

from cookbook.managers import DICTIONARY
from cookbook.models import Recipe, Step


# can be executed at the command line with 'python manage.py rebuildindex'
class Command(BaseCommand):
    help = _('Rebuilds full text search index on Recipe')

    def handle(self, *args, **options):
        if settings.DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql':
            self.stdout.write(self.style.WARNING(_('Only Postgresql databases use full text search, no index to rebuild')))

        try:
            language = DICTIONARY.get(translation.get_language(), 'simple')
            with scopes_disabled():
                Recipe.objects.all().update(
                    name_search_vector=SearchVector('name__unaccent', weight='A', config=language),
                    desc_search_vector=SearchVector('description__unaccent', weight='B', config=language)
                )
                Step.objects.all().update(search_vector=SearchVector('instruction__unaccent', weight='B', config=language))

                self.stdout.write(self.style.SUCCESS(_('Recipe index rebuild complete.')))
        except Exception:
            self.stdout.write(self.style.ERROR(_('Recipe index rebuild failed.')))
