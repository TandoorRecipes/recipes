from django.db import migrations


def backfill_primary_recipe_image(apps, schema_editor):
    """Corrective backfill for pattern-014.

    0247's backfill bailed out entirely (``if RecipeImage.objects.exists(): return``)
    the moment ANY RecipeImage existed, so recipes whose legacy ``image`` column was
    set but that have no gallery images were left without a primary RecipeImage. This
    migration fills that gap per-recipe: for every recipe with a non-empty legacy
    ``image`` and no existing images, create a primary RecipeImage that points at the
    same physical file (``file=recipe.image`` is a path-pointer, so no bytes move).

    Historical (apps.get_model) models use a plain manager — no ScopedManager /
    ScopeError — so cross-space access is unrestricted here.
    """
    Recipe = apps.get_model('cookbook', 'Recipe')
    RecipeImage = apps.get_model('cookbook', 'RecipeImage')

    recipes_with_images = set(
        RecipeImage.objects.values_list('recipe_id', flat=True).distinct()
    )

    batch = []
    qs = Recipe.objects.exclude(image__isnull=True).exclude(image__exact='').iterator(chunk_size=1000)
    for recipe in qs:
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


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0247_recipe_image'),
    ]

    operations = [
        migrations.RunPython(backfill_primary_recipe_image, migrations.RunPython.noop),
    ]
