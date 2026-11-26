import json
from io import BytesIO
from zipfile import ZipFile

from django.utils.text import slugify

from cookbook.helper.image_processing import get_filetype
from cookbook.integration.integration import Integration


class Markdown(Integration):
    """
    Export only integration that writes every recipe as a readable markdown file.
    Metadata goes into a YAML front matter block, images are stored next to the files in an images folder.
    """

    @staticmethod
    def yaml_value(value):
        # a JSON string is a valid double quoted YAML scalar, so names with colons or quotes stay intact
        return json.dumps(str(value), ensure_ascii=False)

    @staticmethod
    def format_minutes(minutes):
        hours, minutes = divmod(minutes, 60)
        if hours and minutes:
            return f'{hours} h {minutes} min'
        if hours:
            return f'{hours} h'
        return f'{minutes} min'

    @staticmethod
    def format_ingredient(ingredient):
        if ingredient.is_header:
            return f'\n**{ingredient.note or ""}**\n'

        parts = []
        if ingredient.amount and not ingredient.no_amount:
            parts.append(f'{float(ingredient.amount):g}')
        if ingredient.unit:
            parts.append(str(ingredient.unit))
        if ingredient.food:
            parts.append(str(ingredient.food))
        line = ' '.join(parts)
        if ingredient.note:
            line = f'{line}, {ingredient.note}' if line else ingredient.note
        return f'- {line}'

    def get_file_stem(self, recipe):
        return slugify(recipe.name) or f'recipe-{recipe.pk}'

    def get_markdown(self, recipe, image_path=None):
        front_matter = ['---', f'title: {self.yaml_value(recipe.name)}']
        if recipe.servings:
            servings = f'{recipe.servings:g}'
            if recipe.servings_text:
                servings += f' {recipe.servings_text}'
            front_matter.append(f'servings: {self.yaml_value(servings)}')
        if recipe.working_time:
            front_matter.append(f'working_time: {self.yaml_value(self.format_minutes(recipe.working_time))}')
        if recipe.waiting_time:
            front_matter.append(f'waiting_time: {self.yaml_value(self.format_minutes(recipe.waiting_time))}')
        if recipe.source_url:
            front_matter.append(f'source: {self.yaml_value(recipe.source_url)}')
        keywords = [k.name for k in recipe.keywords.all()]
        if keywords:
            front_matter.append('keywords:')
            front_matter.extend(f'  - {self.yaml_value(k)}' for k in keywords)
        front_matter.append('---')

        lines = ['\n'.join(front_matter), f'# {recipe.name}']
        if image_path:
            lines.append(f'![{recipe.name}]({image_path})')
        if recipe.description:
            lines.append(recipe.description.strip())

        steps = list(recipe.steps.all())

        ingredients = [self.format_ingredient(i) for s in steps for i in s.ingredients.all()]
        if ingredients:
            lines.append('## Ingredients\n\n' + '\n'.join(ingredients).strip())

        instructions = []
        for number, step in enumerate(steps, start=1):
            parts = []
            if len(steps) > 1 or step.name:
                parts.append(f'### {step.name or f"Step {number}"}')
            if step.time:
                parts.append(f'*{self.format_minutes(step.time)}*')
            if step.step_recipe:
                parts.append(f'See recipe: {step.step_recipe.name}')
            if step.instruction and step.instruction.strip():
                parts.append(step.instruction.strip())
            if parts:
                instructions.append('\n\n'.join(parts))
        if instructions:
            lines.append('## Instructions\n\n' + '\n\n'.join(instructions))

        return '\n\n'.join(lines) + '\n'

    def get_file_from_recipe(self, recipe):
        return f'{self.get_file_stem(recipe)}.md', self.get_markdown(recipe)

    def get_files_from_recipes(self, recipes, el, cookie):
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')
        used_stems = set()

        for r in recipes:
            if r.internal and r.space == self.request.space:
                stem = self.get_file_stem(r)
                if stem in used_stems:
                    stem = f'{stem}-{r.pk}'
                used_stems.add(stem)

                image_path = None
                if r.image:
                    try:
                        image_path = f'images/{stem}{get_filetype(r.image.file.name)}'
                        export_zip_obj.writestr(image_path, r.image.file.read())
                    except (ValueError, FileNotFoundError):
                        image_path = None

                export_zip_obj.writestr(f'{stem}.md', self.get_markdown(r, image_path))

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(r)
            el.save()

        export_zip_obj.close()

        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
