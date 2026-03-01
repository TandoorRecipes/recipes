from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0237_remove_mealtype_mt_unique_name_per_space_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='food',
            name='diet',
            field=models.CharField(
                blank=True,
                choices=[
                    ('VEGAN', 'Vegan'),
                    ('VEGETARIAN', 'Vegetarian'),
                    ('PESCATARIAN', 'Pescatarian'),
                    ('GLUTEN_FREE', 'Gluten Free'),
                    ('LACTOSE_FREE', 'Lactose Free'),
                    ('HALAL', 'Halal'),
                    ('KOSHER', 'Kosher'),
                ],
                default=None,
                max_length=32,
                null=True,
            ),
        ),
    ]
