import cookbook.models
import django.db.models.deletion
import django_prometheus.models
from django.conf import settings
from django.db import migrations, models


def copy_recipe_image_to_model(apps, schema_editor):
    Recipe = apps.get_model('cookbook', 'Recipe')
    RecipeImage = apps.get_model('cookbook', 'RecipeImage')
    if RecipeImage.objects.exists():
        return
    batch = []
    for recipe in Recipe.objects.exclude(image__isnull=True).exclude(image__exact='').iterator(chunk_size=1000):
        creator_id = recipe.created_by_id or recipe.space.created_by_id
        batch.append(RecipeImage(
            recipe=recipe,
            file=recipe.image,
            is_primary=True,
            order=0,
            created_by_id=creator_id,
            space=recipe.space,
        ))
        if len(batch) >= 1000:
            RecipeImage.objects.bulk_create(batch)
            batch.clear()
    if batch:
        RecipeImage.objects.bulk_create(batch)


def copy_recipe_image_back(apps, schema_editor):
    RecipeImage = apps.get_model('cookbook', 'RecipeImage')
    for ri in RecipeImage.objects.filter(is_primary=True).select_related('recipe').iterator(chunk_size=1000):
        ri.recipe.image = ri.file
        ri.recipe.save(update_fields=['image'])


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0246_migrate_customfilter_v1_to_v2'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RecipeImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.ImageField(upload_to='recipes/')),
                ('crop_data', models.JSONField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('is_primary', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='cookbook.recipe')),
                ('space', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cookbook.space')),
            ],
            options={
                'ordering': ['order', 'pk'],
            },
            bases=(django_prometheus.models.ExportModelOperationsMixin('recipe_image'), models.Model, cookbook.models.PermissionModelMixin),
        ),
        migrations.RunPython(copy_recipe_image_to_model, copy_recipe_image_back),
    ]
