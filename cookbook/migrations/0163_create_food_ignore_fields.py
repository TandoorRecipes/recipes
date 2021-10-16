from cookbook.models import FoodParentIgnore
from django.db import migrations


def create_ignorefields(apps, schema_editor):
    FoodParentIgnore.objects.create(name='Supermarket Category', field='name')
    FoodParentIgnore.objects.create(name='Ignore Shopping', field='ignore_shopping')
    FoodParentIgnore.objects.create(name='Diet', field='diet')
    FoodParentIgnore.objects.create(name='Substitute', field='substitute')
    FoodParentIgnore.objects.create(name='Substitute Children', field='substitute_children')
    FoodParentIgnore.objects.create(name='Substitute Siblings', field='substitute_siblings')


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0162_food_inherit'),
    ]

    operations = [
        migrations.RunPython(
            create_ignorefields
        ),
    ]
