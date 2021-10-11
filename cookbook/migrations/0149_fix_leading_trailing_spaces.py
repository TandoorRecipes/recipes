from django.db import migrations, models
from django_scopes import scopes_disabled
models = ["Keyword", "Food", "Unit"]

def update_paths(apps, schema_editor):
    with scopes_disabled():
        for model in models:
            Node = apps.get_model("cookbook", model)
            nodes = Node.objects.all().filter(name__startswith=" ")
            for i in nodes:
                i.name = "_" + i.name
                i.save()
            nodes = Node.objects.all().filter(name__endswith=" ")
            for i in nodes:
                i.name = i.name + "_"
                i.save()


def backwards(apps, schema_editor):
    """nothing to do"""


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0148_auto_20210813_1829'),
    ]

    operations = [
        migrations.RunPython(update_paths, backwards),
    ]
