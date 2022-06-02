from django.core.management.commands.loaddata import Command as LoaddataCommand
from django_scopes import scopes_disabled


class Command(LoaddataCommand):
    def handle(self, *args, **options):
        with scopes_disabled():
            return super().handle(*args, **options)
