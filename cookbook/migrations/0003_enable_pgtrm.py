from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('cookbook', '0002_auto_20191119_2035'),
    ]

    operations = [
        TrigramExtension(),
    ]
