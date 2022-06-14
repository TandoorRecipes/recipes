from django.core.management.commands.dumpdata import Command as DumpdataCommand
from django_scopes import scopes_disabled


class Command(DumpdataCommand):
    def handle(self, *args, **options):
        with scopes_disabled():
            return super().handle(*args, **options)
