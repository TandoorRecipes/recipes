import re
from io import BytesIO
from typing import Any

import requests
import yaml

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import NutritionInformation, Keyword, Ingredient, Recipe, Step
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time


class CookBookApp(Integration):

    def import_file_name_filter(self, zip_info_object):
        return zip_info_object.filename.endswith('.yml')

    def get_recipe_from_file(self, file):
        # Load in yaml file as python dict
        recipe_json: dict[str,Any] = yaml.safe_load(file.getvalue())

        # Initialize recipe class
        description = str(recipe_json['description'].strip())
        description = description[:500] if len(description) > 500 else description
        recipe = Recipe.objects.create(
            name=recipe_json['name'].strip(),
            description=description,
            created_by=self.request.user,
            internal=True,
            space=self.request.space,
        )

        # Start by converting all instructions into steps
        for s in recipe_json['directions']:
            step = Step.objects.create(
                instruction=s,
                space=self.request.space,
                show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
            )
            recipe.steps.add(step)

        # Append ingredients to the first step (or create one if empty)
        step = recipe.steps.first() # Pointer to first step
        if not step:  # Create pointer if there are no steps
            step = Step.objects.create(
                instruction='',
                space=self.request.space,
            )
            recipe.steps.add(step)

        # Attempt to parse through each ingredient (user freeform so anything goes)
        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in recipe_json['ingredients']:
            if not ingredient:
                continue
            amount, unit, food, note = ingredient_parser.parse(ingredient)
            f = ingredient_parser.get_food(food)
            u = ingredient_parser.get_unit(unit)
            step.ingredients.add(Ingredient.objects.create(
                food=f,
                unit=u,
                amount=amount,
                note=note,
                original_text=ingredient,
                space=self.request.space,
            ))
            
        # Tandoor doesn't have notes, append it as the last step
        if 'notes' in recipe_json and len(recipe_json['notes']) > 0:
            notes_text = f"#### Notes\n\n{recipe_json['notes']}"
            step = Step.objects.create(
                instruction=notes_text,
                space=self.request.space,
            )
            recipe.steps.add(step)

        if 'tags' in recipe_json and len(recipe_json['tags']) > 0:
            for tag in recipe_json['tags']:
                keyword, _ = Keyword.objects.get_or_create(name=tag.strip(), space=self.request.space)
                recipe.keywords.add(keyword)

        if 'prep_time' in recipe_json and recipe_json['prep_time'] is not None:
            recipe.waiting_time = parse_time(recipe_json['prep_time'])

        if 'cook_time' in recipe_json and recipe_json['cook_time'] is not None:
            recipe.working_time = parse_time(recipe_json['cook_time'])

        if 'servings' in recipe_json and recipe_json['servings'] is not None:
            recipe.servings = parse_servings(recipe_json['servings'])
            recipe.servings_text = parse_servings_text(recipe_json['servings'])

        if 'source' in recipe_json and recipe_json['source'] is not None:
            recipe.source_url = recipe_json['source']

        # Attempt to parse through nutrition multi-line string
        if 'nutrition' in recipe_json:
            nutrition = {}
            nutrition_list = recipe_json['nutrition'].lower().splitlines()
            for item in nutrition_list:
                try:
                    if 'calories' in item:
                        nutrition['calories'] = int(re.search(r'\d+', item).group())
                    elif 'protein' in item:
                        nutrition['proteins'] = int(re.search(r'\d+', item).group())
                    elif 'fat' in item:
                        nutrition['fats'] = int(re.search(r'\d+', item).group())
                    elif 'carb' in item:
                        nutrition['carbohydrates'] = int(re.search(r'\d+', item).group())
                except Exception:
                    pass
            if nutrition != {}:
                recipe.nutrition = NutritionInformation.objects.create(**nutrition, space=self.request.space)

        # Try to import an image link, this may be blocked by cors
        try:
            url = recipe_json["image"]
            if validate_import_url(url):
                response = requests.get(url)
                self.import_recipe_image(recipe, BytesIO(response.content))
        except Exception as e:
            print('failed to import image ', str(e))

        recipe.save()
        return recipe
