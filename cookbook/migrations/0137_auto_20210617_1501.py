# Generated by Django 3.2.4 on 2021-06-17 13:01

from django.db import migrations
from django.db.models import Subquery, OuterRef
from django_scopes import scopes_disabled
from django.db import migrations, models
import django.db.models.deletion


def migrate_spaces(apps, schema_editor):
    with scopes_disabled():
        Recipe = apps.get_model('cookbook', 'Recipe')
        Step = apps.get_model('cookbook', 'Step')
        Ingredient = apps.get_model('cookbook', 'Ingredient')
        NutritionInformation = apps.get_model('cookbook', 'NutritionInformation')

        Step.objects.filter(recipe__isnull=True).delete()
        Ingredient.objects.filter(step__recipe__isnull=True).delete()
        NutritionInformation.objects.filter(recipe__isnull=True).delete()

        Step.objects.update(space=Subquery(Step.objects.filter(pk=OuterRef('pk')).values('recipe__space')[:1]))
        Ingredient.objects.update(space=Subquery(Ingredient.objects.filter(pk=OuterRef('pk')).values('step__recipe__space')[:1]))
        NutritionInformation.objects.update(space=Subquery(NutritionInformation.objects.filter(pk=OuterRef('pk')).values('recipe__space')[:1]))


class Migration(migrations.Migration):
    dependencies = [
        ('cookbook', '0136_auto_20210617_1343'),
    ]

    operations = [
        migrations.RunPython(migrate_spaces),

    ]
