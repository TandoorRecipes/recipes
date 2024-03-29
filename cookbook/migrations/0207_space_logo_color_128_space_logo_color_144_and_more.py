# Generated by Django 4.2.7 on 2024-01-06 15:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0206_rename_sticky_navbar_userpreference_nav_sticky_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='space',
            name='logo_color_128',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_128', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_144',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_144', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_180',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_180', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_192',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_192', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_32',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_32', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_512',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_512', to='cookbook.userfile'),
        ),
        migrations.AddField(
            model_name='space',
            name='logo_color_svg',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='space_logo_color_svg', to='cookbook.userfile'),
        ),
    ]
