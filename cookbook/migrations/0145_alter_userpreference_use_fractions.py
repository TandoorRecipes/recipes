# Generated by Django 3.2.4 on 2021-07-03 08:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0144_alter_userpreference_search_style'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpreference',
            name='use_fractions',
            field=models.BooleanField(default=False),
        ),
    ]
