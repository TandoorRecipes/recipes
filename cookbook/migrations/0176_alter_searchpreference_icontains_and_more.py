# Generated by Django 4.0.4 on 2022-06-14 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0175_remove_userpreference_space'),
    ]

    operations = [
        migrations.AlterField(
            model_name='searchpreference',
            name='icontains',
            field=models.ManyToManyField(blank=True, related_name='icontains_fields', to='cookbook.searchfields'),
        ),
        migrations.AlterField(
            model_name='searchpreference',
            name='trigram',
            field=models.ManyToManyField(blank=True, related_name='trigram_fields', to='cookbook.searchfields'),
        ),
        migrations.AlterField(
            model_name='searchpreference',
            name='unaccent',
            field=models.ManyToManyField(blank=True, related_name='unaccent_fields', to='cookbook.searchfields'),
        ),
    ]
