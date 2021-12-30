import traceback

from django.apps import AppConfig
from django.conf import settings
from django.db import OperationalError, ProgrammingError
from django_scopes import scopes_disabled

from recipes.settings import DEBUG


class CookbookConfig(AppConfig):
    name = 'cookbook'

    def ready(self):
        # post_save signal is only necessary if using full-text search on postgres
        if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2',
                                                       'django.db.backends.postgresql']:
            import cookbook.signals  # noqa

        if not settings.DISABLE_TREE_FIX_STARTUP:
            # when starting up run fix_tree to:
            #   a) make sure that nodes are sorted when switching between sort modes
            #   b) fix problems, if any, with tree consistency
            with scopes_disabled():
                try:
                    from cookbook.models import Keyword, Food
                    #Keyword.fix_tree(fix_paths=True) # disabled for now, causes to many unknown issues
                    #Food.fix_tree(fix_paths=True)
                except OperationalError:
                    if DEBUG:
                        traceback.print_exc()
                    pass  # if model does not exist there is no need to fix it
                except ProgrammingError:
                    if DEBUG:
                        traceback.print_exc()
                    pass  # if migration has not been run database cannot be fixed yet
                except Exception:
                    if DEBUG:
                        traceback.print_exc()
                    pass  # dont break startup just because fix could not run, need to investigate cases when this happens
