import importlib

import pytest
from allauth.account.models import EmailAddress
from django.apps import apps
from django.contrib.auth.models import User
from django_scopes import scopes_disabled

migration = importlib.import_module('cookbook.migrations.0243_auto_20261018_1149')


@pytest.mark.django_db
def test_migration_keeps_existing_primary_email():
    with scopes_disabled():
        user = User.objects.create(username='admin', is_superuser=True)
        EmailAddress.objects.create(user=user, email='admin@example.com', primary=True, verified=False)

        migration.apply_migration(apps, None)

        primary = EmailAddress.objects.get(user=user, primary=True)
        assert primary.email == 'admin@example.com'
        assert not primary.verified
        placeholder = EmailAddress.objects.get(user=user, email='admin@default-adminmail.tandoor')
        assert placeholder.verified
        assert not placeholder.primary
