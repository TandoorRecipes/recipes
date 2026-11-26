from io import BytesIO
from zipfile import ZipFile

import pytest
from django.contrib import auth
from django.core.files.base import ContentFile
from django.test import RequestFactory
from django_scopes import scope
from PIL import Image

from cookbook.integration.markdownexport import Markdown
from cookbook.models import ExportLog, Food, Ingredient, Keyword, Recipe, Step, Unit


@pytest.fixture
def markdown_exporter(u1_s1, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    request = RequestFactory().get('/')
    request.user = auth.get_user(u1_s1)
    request.space = request.user.userspace_set.first().space
    with scope(space=request.space):
        yield Markdown(request, 'MARKDOWN')


def create_recipe(exporter, name='Gochujang Tofu', steps=None):
    request = exporter.request
    recipe = Recipe.objects.create(
        name=name,
        description='A quick weeknight dinner.',
        servings=4,
        servings_text='portions',
        working_time=20,
        waiting_time=75,
        source_url='https://example.com/tofu',
        internal=True,
        created_by=request.user,
        space=request.space,
    )
    recipe.keywords.add(Keyword.objects.get_or_create(name='Vegan: always', space=request.space)[0])

    unit = Unit.objects.get_or_create(name='g', space=request.space)[0]
    tofu = Food.objects.get_or_create(name='firm tofu', space=request.space)[0]
    salt = Food.objects.get_or_create(name='salt', space=request.space)[0]

    for order, (step_name, instruction, time) in enumerate(steps or [('', 'Crumble the tofu.', 0)]):
        step = Step.objects.create(name=step_name, instruction=instruction, time=time, order=order, space=request.space)
        if order == 0:
            step.ingredients.add(Ingredient.objects.create(is_header=True, note='For the tofu', order=0, space=request.space))
            step.ingredients.add(Ingredient.objects.create(food=tofu, unit=unit, amount=300, note='crumbled', order=1, space=request.space))
            step.ingredients.add(Ingredient.objects.create(food=salt, amount=1, no_amount=True, order=2, space=request.space))
        recipe.steps.add(step)
    return recipe


def test_markdown_contains_front_matter_and_sections(markdown_exporter):
    recipe = create_recipe(markdown_exporter)

    filename, data = markdown_exporter.get_file_from_recipe(recipe)

    assert filename == 'gochujang-tofu.md'
    assert data.startswith('---\ntitle: "Gochujang Tofu"\n')
    assert 'servings: "4 portions"' in data
    assert 'working_time: "20 min"' in data
    assert 'waiting_time: "1 h 15 min"' in data
    assert 'source: "https://example.com/tofu"' in data
    assert 'keywords:\n  - "Vegan: always"\n---' in data
    assert '# Gochujang Tofu\n\nA quick weeknight dinner.' in data
    assert '## Ingredients\n\n**For the tofu**\n\n- 300 g firm tofu, crumbled\n- salt' in data
    assert '## Instructions\n\nCrumble the tofu.\n' in data
    assert '### Step' not in data


def test_markdown_names_every_step(markdown_exporter):
    recipe = create_recipe(markdown_exporter, steps=[('Prepare', 'Crumble the tofu.', 5), ('', 'Fry it.', 0)])

    _, data = markdown_exporter.get_file_from_recipe(recipe)

    assert '### Prepare\n\n*5 min*\n\nCrumble the tofu.' in data
    assert '### Step 2\n\nFry it.' in data


def test_title_with_quotes_stays_valid_yaml(markdown_exporter):
    recipe = create_recipe(markdown_exporter, name='Mom\'s "best" chili: v2')

    _, data = markdown_exporter.get_file_from_recipe(recipe)

    assert 'title: "Mom\'s \\"best\\" chili: v2"' in data


def test_export_zip_contains_markdown_and_image(markdown_exporter):
    request = markdown_exporter.request
    recipe = create_recipe(markdown_exporter)
    image = BytesIO()
    Image.new('RGB', (8, 8)).save(image, 'JPEG')
    recipe.image.save('tofu.jpeg', ContentFile(image.getvalue()))
    duplicate = create_recipe(markdown_exporter)
    el = ExportLog.objects.create(type='MARKDOWN', created_by=request.user, space=request.space)

    files = markdown_exporter.get_files_from_recipes([recipe, duplicate], el, {})

    assert len(files) == 1
    with ZipFile(BytesIO(files[0][1])) as export_zip:
        names = set(export_zip.namelist())
        assert names == {'gochujang-tofu.md', f'gochujang-tofu-{duplicate.pk}.md', 'images/gochujang-tofu.jpeg'}
        assert '![Gochujang Tofu](images/gochujang-tofu.jpeg)' in export_zip.read('gochujang-tofu.md').decode()
        assert '](images/' not in export_zip.read(f'gochujang-tofu-{duplicate.pk}.md').decode()
    el.refresh_from_db()
    assert el.exported_recipes == 2
