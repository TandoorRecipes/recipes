import base64
from io import BytesIO
from lxml import etree
import requests
from pathlib import Path

from bs4 import BeautifulSoup, Tag

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time, iso_duration_to_minutes
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step, Keyword
from recipe_scrapers import scrape_html


class Gourmet(Integration):

    def split_recipe_file(self, file):
        encoding = 'utf-8'
        byte_string = file.read()
        text_obj = byte_string.decode(encoding, errors="ignore")
        soup = BeautifulSoup(text_obj, "html.parser")
        return soup.find_all("div", {"class": "recipe"})

    def get_ingredients_recursive(self, step, ingredients, ingredient_parser):
        if isinstance(ingredients, Tag):
            for ingredient in ingredients.children:
                if not isinstance(ingredient, Tag):
                    continue

                if ingredient.name in ["li"]:
                    step_name = "".join(ingredient.findAll(text=True, recursive=False)).strip().rstrip(":")

                    step.ingredients.add(Ingredient.objects.create(
                        is_header=True,
                        note=step_name[:256],
                        original_text=step_name,
                        space=self.request.space,
                    ))
                    next_ingrediets = ingredient.find("ul", {"class": "ing"})
                    self.get_ingredients_recursive(step, next_ingrediets, ingredient_parser)

                else:
                    try:
                        amount, unit, food, note = ingredient_parser.parse(ingredient.text.strip())
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        step.ingredients.add(
                            Ingredient.objects.create(
                                food=f,
                                unit=u,
                                amount=amount,
                                note=note,
                                original_text=ingredient.text.strip(),
                                space=self.request.space,
                            )
                        )
                    except ValueError:
                        pass

    def get_recipe_from_file(self, file):
        # 'file' comes is as a beautifulsoup object

        source_url = None
        for item in file.find_all('a'):
            if item.has_attr('href'):
                source_url = item.get("href")
                break

        name = file.find("p", {"class": "title"}).find("span", {"itemprop": "name"}).text.strip()

        recipe = Recipe.objects.create(
            name=name[:128],
            source_url=source_url,
            created_by=self.request.user,
            internal=True,
            space=self.request.space,
        )

        for category in file.find_all("span", {"itemprop": "recipeCategory"}):
            keyword, created = Keyword.objects.get_or_create(name=category.text, space=self.request.space)
            recipe.keywords.add(keyword)

        try:
            recipe.servings = parse_servings(file.find("span", {"itemprop": "recipeYield"}).text.strip())
        except AttributeError:
            pass

        try:
            prep_time = file.find("span", {"itemprop": "prepTime"}).text.strip().split()
            prep_time[0] = prep_time[0].replace(',', '.')
            if prep_time[1].lower() in ['stunde', 'stunden', 'hour', 'hours']:
                prep_time_min = int(float(prep_time[0]) * 60)
            elif prep_time[1].lower() in ['tag', 'tage', 'day', 'days']:
                prep_time_min = int(float(prep_time[0]) * 60 * 24)
            else:
                prep_time_min = int(prep_time[0])
            recipe.waiting_time = prep_time_min
        except AttributeError:
            pass

        try:
            cook_time = file.find("span", {"itemprop": "cookTime"}).text.strip().split()
            cook_time[0] = cook_time[0].replace(',', '.')
            if cook_time[1].lower() in ['stunde', 'stunden', 'hour', 'hours']:
                cook_time_min = int(float(cook_time[0]) * 60)
            elif cook_time[1].lower() in ['tag', 'tage', 'day', 'days']:
                cook_time_min = int(float(cook_time[0]) * 60 * 24)
            else:
                cook_time_min = int(cook_time[0])

            recipe.working_time = cook_time_min
        except AttributeError:
            pass

        for cuisine in file.find_all('span', {'itemprop': 'recipeCuisine'}):
            cuisine_name = cuisine.text
            keyword = Keyword.objects.get_or_create(space=self.request.space, name=cuisine_name)
            if len(keyword):
                recipe.keywords.add(keyword[0])

        for category in file.find_all('span', {'itemprop': 'recipeCategory'}):
            category_name = category.text
            keyword = Keyword.objects.get_or_create(space=self.request.space, name=category_name)
            if len(keyword):
                recipe.keywords.add(keyword[0])

        step = Step.objects.create(
            instruction='',
            space=self.request.space,
            show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
        )

        ingredient_parser = IngredientParser(self.request, True)

        ingredients = file.find("ul", {"class": "ing"})
        self.get_ingredients_recursive(step, ingredients, ingredient_parser)

        instructions = file.find("div", {"class": "instructions"})
        if isinstance(instructions, Tag):
            for instruction in instructions.children:
                if not isinstance(instruction, Tag) or instruction.text == "":
                    continue
                if instruction.name == "h3":
                    if step.instruction:
                        step.save()
                        recipe.steps.add(step)
                        step = Step.objects.create(
                            instruction='',
                            space=self.request.space,
                        )

                    step.name = instruction.text.strip()[:128]
                else:
                    if instruction.name == "div":
                        for instruction_step in instruction.children:
                            for br in instruction_step.find_all("br"):
                                br.replace_with("\n")
                            step.instruction += instruction_step.text.strip() + ' \n\n'

        notes = file.find("div", {"class": "modifications"})
        if notes:
            for n in notes.children:
                if n.text == "":
                    continue
                if n.name == "h3":
                    step.instruction += f'*{n.text.strip()}:* \n\n'
                else:
                    for br in n.find_all("br"):
                        br.replace_with("\n")

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
            image_path = file.find("img").get("src")
            image_filename = image_path.split("\\")[1]

            for f in self.import_zip.filelist:
                zip_file_name = Path(f.filename).name
                if image_filename == zip_file_name:
                    image_file = self.import_zip.read(f)
                    image_bytes = BytesIO(image_file)
                    self.import_recipe_image(recipe, image_bytes, filetype='.jpeg')
                    break
        except Exception as e:
            print(recipe.name, ': failed to import image ', str(e))

        recipe.save()
        return recipe

    def get_files_from_recipes(self, recipes, el, cookie):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
