from io import BytesIO
from zipfile import ZipFile

from bs4 import BeautifulSoup, Tag
from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import iso_duration_to_minutes, parse_servings
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step
from recipes.settings import DEBUG


class CopyMeThat(Integration):

    def import_file_name_filter(self, zip_info_object):
        if DEBUG:
            print("testing", zip_info_object.filename, zip_info_object.filename == 'recipes.html')
        return zip_info_object.filename == 'recipes.html'

    def get_recipe_from_file(self, file):
        # 'file' comes is as a beautifulsoup object
        try:
            source = file.find("a", {"id": "original_link"}).text
        except AttributeError:
            source = None

        recipe = Recipe.objects.create(name=file.find("div", {"id": "name"}).text.strip(
        )[:128], source_url=source, created_by=self.request.user, internal=True, space=self.request.space, )

        for category in file.find_all("span", {"class": "recipeCategory"}):
            keyword, created = Keyword.objects.get_or_create(name=category.text, space=self.request.space)
            recipe.keywords.add(keyword)

        try:
            recipe.servings = parse_servings(file.find("a", {"id": "recipeYield"}).text.strip())
            recipe.working_time = iso_duration_to_minutes(file.find("span", {"meta": "prepTime"}).text.strip())
            recipe.waiting_time = iso_duration_to_minutes(file.find("span", {"meta": "cookTime"}).text.strip())
        except AttributeError:
            pass

        try:
            if len(file.find("span", {"id": "starred"}).text.strip()) > 0:
                recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=_('Favorite'))[0])
        except AttributeError:
            pass

        try:
            if len(file.find("span", {"id": "made_this"}).text.strip()) > 0:
                recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=_('I made this'))[0])
        except AttributeError:
            pass

        step = Step.objects.create(instruction='', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients, )

        ingredient_parser = IngredientParser(self.request, True)

        ingredients = file.find("ul", {"id": "recipeIngredients"})
        if isinstance(ingredients, Tag):
            for ingredient in ingredients.children:
                if not isinstance(ingredient, Tag) or not ingredient.text.strip() or "recipeIngredient_spacer" in ingredient['class']:
                    continue
                if any(x in ingredient['class'] for x in ["recipeIngredient_subheader", "recipeIngredient_note"]):
                    step.ingredients.add(
                        Ingredient.objects.create(
                            is_header=True,
                            note=ingredient.text.strip()[
                                :256],
                            original_text=ingredient.text.strip(),
                            space=self.request.space,
                        ))
                else:
                    amount, unit, food, note = ingredient_parser.parse(ingredient.text.strip())
                    f = ingredient_parser.get_food(food)
                    u = ingredient_parser.get_unit(unit)
                    step.ingredients.add(Ingredient.objects.create(food=f, unit=u, amount=amount, note=note, original_text=ingredient.text.strip(), space=self.request.space, ))

        instructions = file.find("ol", {"id": "recipeInstructions"})
        if isinstance(instructions, Tag):
            for instruction in instructions.children:
                if not isinstance(instruction, Tag) or instruction.text == "":
                    continue
                if "instruction_subheader" in instruction['class']:
                    if step.instruction:
                        step.save()
                        recipe.steps.add(step)
                        step = Step.objects.create(instruction='', space=self.request.space, )

                    step.name = instruction.text.strip()[:128]
                else:
                    step.instruction += instruction.text.strip() + ' \n\n'

        notes = file.find_all("li", {"class": "recipeNote"})
        if notes:
            step.instruction += '*Notes:* \n\n'

            for n in notes:
                if n.text == "":
                    continue
                step.instruction += '*' + n.text.strip() + '* \n\n'

        description = ''
        try:
            description = file.find("div", {"id": "description"}).text.strip()
        except AttributeError:
            pass
        if len(description) <= 512:
            recipe.description = description
        else:
            recipe.description = description[:480] + ' ... (full description below)'
            step.instruction += '*Description:* \n\n*' + description + '* \n\n'

        step.save()
        recipe.steps.add(step)

        # import the Primary recipe image that is stored in the Zip
        try:
            for f in self.files:
                if '.zip' in f['name']:
                    import_zip = ZipFile(f['file'])
                    self.import_recipe_image(recipe, BytesIO(import_zip.read(file.find("img", class_="recipeImage").get("src"))), filetype='.jpeg')
        except Exception as e:
            print(recipe.name, ': failed to import image ', str(e))

        recipe.save()
        return recipe

    def split_recipe_file(self, file):
        soup = BeautifulSoup(file, "html.parser")
        return soup.find_all("div", {"class": "recipe"})
