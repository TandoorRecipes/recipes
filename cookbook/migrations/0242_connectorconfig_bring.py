from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0241_invitelink_household'),
    ]

    operations = [
        migrations.RenameField(
            model_name='connectorconfig',
            old_name='todo_entity',
            new_name='list_id',
        ),
        migrations.AddField(
            model_name='connectorconfig',
            name='email',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
        migrations.AddField(
            model_name='connectorconfig',
            name='password',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='connectorconfig',
            name='type',
            field=models.CharField(choices=[('HomeAssistant', 'HomeAssistant'), ('Bring', 'Bring')], default='HomeAssistant', max_length=128),
        ),
    ]
