
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0195_invitelink_internal_note_userspace_internal_note_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='Step',
            name='show_ingredients_table',
            field=models.BooleanField(default=True),
        ),
    ]
