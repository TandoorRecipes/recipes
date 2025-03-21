# Generated by Django 4.2.18 on 2025-03-14 10:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import F, Count
from django_scopes import scopes_disabled


def add_space_and_owner_to_shopping_list_recipe(apps, schema_editor):
    print('migrating shopping list recipe space attribute, this might take a while ...')
    with scopes_disabled():
        ShoppingListRecipe = apps.get_model('cookbook', 'ShoppingListRecipe')

        # delete all shopping list recipes that do not have entries as those are of no use anyway
        ShoppingListRecipe.objects.annotate(entry_count=Count('entries')).filter(entry_count__lte=0).delete()

        shopping_list_recipes = ShoppingListRecipe.objects.all().prefetch_related('entries')
        update_list = []

        for slr in shopping_list_recipes:
            if entry := slr.entries.first():
                if entry.space and entry.created_by:
                    slr.space = entry.space
                    slr.created_by = entry.created_by
                    update_list.append(slr)
                else:
                    print(slr, 'missing data on entry')
            else:
                print(slr, 'missing entry')

        ShoppingListRecipe.objects.bulk_update(update_list, ['space', 'created_by'], batch_size=500)


class Migration(migrations.Migration):
    dependencies = [
        ('cookbook', '0220_shoppinglistrecipe_created_by_and_more'),
    ]

    operations = [
        migrations.RunPython(add_space_and_owner_to_shopping_list_recipe),
    ]
