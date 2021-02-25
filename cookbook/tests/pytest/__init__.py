from django.test import utils
from django_scopes import scopes_disabled

# disables scoping error in all queries used inside the test functions
# fixtures need to have their own scopes_disabled
utils.setup_databases = scopes_disabled()(utils.setup_databases)
