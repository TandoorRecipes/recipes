from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django_scopes import scopes_disabled

from cookbook.models import Space


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
