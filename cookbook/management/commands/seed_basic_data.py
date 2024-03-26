from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector
from django.core.management.base import BaseCommand
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled

from cookbook.managers import DICTIONARY
from cookbook.models import Recipe, Step, Space


class Command(BaseCommand):
    help = 'Seeds some basic data (space, account, food)'

    def handle(self, *args, **options):
        with scopes_disabled():
            user = User.objects.get_or_create(username='test')[0]
            user.set_password('test')
            user.save()

            space = Space.objects.get_or_create(
                name='Test Space',
                created_by=user
            )[0]
