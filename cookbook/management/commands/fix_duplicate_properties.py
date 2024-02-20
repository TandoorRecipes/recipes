from django.conf import settings
from django.contrib.postgres.search import SearchVector
from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled

from cookbook.managers import DICTIONARY
from cookbook.models import Recipe, Step, FoodProperty, Food


# can be executed at the command line with 'python manage.py rebuildindex'
class Command(BaseCommand):
    help = _('Fixes foods with ')

    def add_arguments(self, parser):
        parser.add_argument('-d', '--dry-run', help='does not delete properties but instead prints them', action='store_true')

    def handle(self, *args, **options):
        with scopes_disabled():
            foods_with_duplicate_properties = Food.objects.annotate(property_type_count=Count('foodproperty__property__property_type') - Count('foodproperty__property__property_type', distinct=True)).filter(property_type_count__gt=0).all()
            for f in foods_with_duplicate_properties:
                found_property_types = []
                for fp in f.properties.all():
                    if fp.property_type.id in found_property_types:
                        if options['dry_run']:
                            print(f'Property id {fp.id} duplicate type {fp.property_type}({fp.property_type.id}) for food {f}({f.id})')
                        else:
                            print(f'DELETING property id {fp.id} duplicate type {fp.property_type}({fp.property_type.id}) for food {f}({f.id})')
                            fp.delete()

                    else:
                        found_property_types.append(fp.property_type.id)
