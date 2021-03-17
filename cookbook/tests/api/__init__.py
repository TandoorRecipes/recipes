from django.test import utils
from django_scopes import scopes_disabled

# disables scoping error in all queries used inside the test FUNCTIONS
# FIXTURES need to have their own scopes_disabled!!
# This is done by hook pytest_fixture_setup in conftest.py for all non yield fixtures
utils.setup_databases = scopes_disabled()(utils.setup_databases)
