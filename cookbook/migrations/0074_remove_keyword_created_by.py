# Generated by Django 3.0.7 on 2020-07-09 19:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0073_auto_20200708_2311'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='keyword',
            name='created_by',
        ),
    ]
