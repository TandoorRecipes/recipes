from cookbook.models import SearchFields
from django.db import migrations


def create_searchfields(apps, schema_editor):
    SearchFields.objects.create(name='Name', field='name')
    SearchFields.objects.create(name='Description', field='description')
    SearchFields.objects.create(name='Instructions', field='steps__instruction')
    SearchFields.objects.create(name='Ingredients', field='steps__ingredients__food__name')
    SearchFields.objects.create(name='Keywords', field='keywords__name')


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0143_build_full_text_index'),
    ]

    operations = [
        migrations.RunPython(
            create_searchfields
        ),
    ]
