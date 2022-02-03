from django.db import migrations

from cookbook.models import SearchFields


def create_searchfields(apps, schema_editor):
    SearchFields.objects.create(name='Units', field='steps__ingredients__unit__name')


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0167_userpreference_left_handed'),
    ]

    operations = [
        migrations.RunPython(
            create_searchfields
        ),
    ]
