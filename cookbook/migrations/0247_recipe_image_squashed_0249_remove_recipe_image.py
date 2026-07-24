import cookbook.models
import django.db.models.deletion
import django_prometheus.models
from django.conf import settings
from django.db import migrations, models


def copy_recipe_image_to_model(apps, schema_editor):
    """Copy each recipe's legacy ``image`` into a primary RecipeImage.

    ``file=recipe.image`` is a path-pointer, so no bytes move. Skips recipes
    that already have a RecipeImage, so this is safe to apply on an instance
    that added gallery images before upgrading. (This is the corrected,
    per-recipe copy — the original 0247 bailed out entirely the moment any
    RecipeImage existed, which is why a separate 0248 backfill was needed.)
    """
    Recipe = apps.get_model('cookbook', 'Recipe')
    RecipeImage = apps.get_model('cookbook', 'RecipeImage')

    recipes_with_images = set(
        RecipeImage.objects.values_list('recipe_id', flat=True).distinct()
    )
    batch = []
    for recipe in Recipe.objects.exclude(image__isnull=True).exclude(image__exact='').iterator(chunk_size=1000):
        if recipe.id in recipes_with_images:
            continue
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

    # Consolidates the RecipeImage introduction (create + data copy + drop the
    # legacy Recipe.image column) into one migration. `replaces` means an
    # instance that already applied 0247/0248/0249 recognises this as
    # equivalent and skips it, while fresh installs run just this one.
    replaces = [
        ('cookbook', '0247_recipe_image'),
        ('cookbook', '0248_backfill_recipe_image_corrective'),
        ('cookbook', '0249_remove_recipe_image'),
    ]

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
        migrations.RemoveField(
            model_name='recipe',
            name='image',
        ),
        migrations.AddConstraint(
            model_name='recipeimage',
            constraint=models.UniqueConstraint(condition=models.Q(('is_primary', True)), fields=('recipe',), name='unique_primary_image_per_recipe'),
        ),
    ]
