# Combined migration for start_page_sections feature branch

import ast
import json

from django.db import migrations, models


def repair_search_text(apps, schema_editor):
    """Ensure cookbook_customfilter.search holds valid JSON strings BEFORE
    AlterField casts the column to jsonb.

    The original version of this migration assigned a parsed dict back to a
    TextField column, causing Django to serialize via str(dict) — Python repr
    with single quotes — which Postgres rejects when casting to jsonb.

    This version handles three cases idempotently so reruns are safe:
    - Already valid JSON                              → leave alone
    - Python repr from the buggy earlier migration    → ast.literal_eval + json.dumps
    - Garbage / null                                  → replace with '{}'
    """
    CustomFilter = apps.get_model('cookbook', 'CustomFilter')
    for cf in CustomFilter.objects.all():
        value = cf.search
        if value in (None, ''):
            fixed = '{}'
        else:
            try:
                json.loads(value)
                fixed = value  # already valid JSON, leave alone
            except (json.JSONDecodeError, TypeError):
                try:
                    parsed = ast.literal_eval(value)
                    fixed = json.dumps(parsed)
                except (ValueError, SyntaxError):
                    fixed = '{}'
        if fixed != value:
            cf.search = fixed
            cf.save(update_fields=['search'])


def migrate_search_to_home(apps, schema_editor):
    """Update existing users with SEARCH default to HOME."""
    UserPreference = apps.get_model('cookbook', 'UserPreference')
    UserPreference.objects.filter(default_page='SEARCH').update(default_page='HOME')


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0242_space_household_setup_completed'),
    ]

    operations = [
        # start_page_sections JSONField on UserPreference
        migrations.AddField(
            model_name='userpreference',
            name='start_page_sections',
            field=models.JSONField(blank=True, default=list),
        ),

        # CustomFilter.search TextField → JSONField
        # Repair any rows that may have been corrupted by the earlier (buggy)
        # version of this migration before the cast runs. The cast itself is
        # done by AlterField, which on PostgreSQL emits
        # ALTER COLUMN ... TYPE jsonb USING search::jsonb.
        migrations.RunPython(repair_search_text, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customfilter',
            name='search',
            field=models.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='customfilter',
            name='type',
            field=models.CharField(choices=[('RECIPE', 'Recipe'), ('FOOD', 'Food'), ('KEYWORD', 'Keyword')], default='RECIPE', max_length=128),
        ),

        # Add HOME to default_page choices + migrate existing users
        migrations.AlterField(
            model_name='userpreference',
            name='default_page',
            field=models.CharField(choices=[('HOME', 'Home'), ('SEARCH', 'Search'), ('PLAN', 'Meal-Plan'), ('BOOKS', 'Books'), ('SHOPPING', 'Shopping')], default='HOME', max_length=64),
        ),
        migrations.RunPython(migrate_search_to_home, migrations.RunPython.noop),
    ]
