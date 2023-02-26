# Generated by Django 4.1.7 on 2023-02-26 06:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0191_foodnutrition_food_nutrition_unique_per_space_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='unitconversion',
            name='base_unit',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unit_conversion_base_unit', to='cookbook.unit'),
        ),
        migrations.AlterField(
            model_name='unitconversion',
            name='converted_unit',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unit_conversion_converted_unit', to='cookbook.unit'),
        ),
    ]
