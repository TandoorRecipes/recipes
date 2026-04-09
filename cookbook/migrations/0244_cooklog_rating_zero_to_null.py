from django.db import migrations


def forward(apps, schema_editor):
    """Clean up legacy rating=0 rows.

    Prior to validate_rating normalization, Vuetify's clearable v-rating emitted 0
    on clear, which landed in the DB as a real 0-rated row. Under the new contract
    rating is NULL (unrated) or 1-5. Collapse existing 0 rows into NULL so the
    new with_rating annotation's defensive __gt=0 filter never has work to do.
    """
    CookLog = apps.get_model('cookbook', 'CookLog')
    # Historical model uses Django's plain Manager, bypassing ScopedManager.
    CookLog.objects.filter(rating=0).update(rating=None)


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0243_start_page_sections_and_custom_filter'),
    ]

    operations = [
        migrations.RunPython(forward, migrations.RunPython.noop),
    ]
