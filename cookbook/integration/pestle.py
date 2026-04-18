from io import BytesIO
from django.utils.translation import gettext as _
import re

import json

import requests

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import (
    parse_servings,
    iso_duration_to_minutes,
)
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, NutritionInformation, Recipe, Step, Keyword


class Pestle(Integration):

    def split_recipe_file(self, file) -> list[str]:
        encoding = "utf-8"
        byte_string = file.read()
        text_obj = byte_string.decode(encoding, errors="ignore")
        json_export = json.loads(text_obj)
        return json_export

    def get_recipe_from_file(self, file):

        recipe_dict: dict = file

        description = ""
        if "description" in recipe_dict:
            description = ("" if len(recipe_dict["description"].strip()) > 500 else recipe_dict["description"].strip())

        recipe = Recipe.objects.create(
            name=recipe_dict["name"].strip(),
            description=description,
            created_by=self.request.user,
            internal=True,
            servings=(parse_servings(recipe_dict["recipeYield"]) if "recipeYield" in recipe_dict else 1),
            space=self.request.space,
        )

        total_time = (iso_duration_to_minutes(recipe_dict["totalTime"]) if "totalTime" in recipe_dict else 0)

        prep_time = (iso_duration_to_minutes(recipe_dict["prepTime"]) if ("prepTime" in recipe_dict) else 0)

        recipe.waiting_time = (iso_duration_to_minutes(recipe_dict["cookTime"]) if "cookTime" in recipe_dict else 0)
        recipe.working_time = (prep_time if prep_time > 0 else total_time - recipe.waiting_time)
        if "source" in recipe_dict:
            recipe.source_url = recipe_dict["source"].strip()

        if "recipeCategory" in recipe_dict and len(recipe_dict["recipeCategory"]) > 0:
            recipe.keywords.add(Keyword.objects.get_or_create(
                space=self.request.space,
                name=recipe_dict["recipeCategory"][0].capitalize(),
            )[0])

        if "keywords" in recipe_dict and len(recipe_dict["keywords"]) > 0:
            for key in recipe_dict["keywords"]:

                if "," in key:
                    for x in key.split(","):
                        recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=x)[0])
                else:
                    recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=key)[0])

        if ("recipeIngredient" in recipe_dict and len(recipe_dict["recipeIngredient"]) > 0):
            ingredient_step = Step.objects.create(
                name=_("Ingredients"),
                space=self.request.space,
                show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
            )
            for ingredient in recipe_dict["recipeIngredient"]:
                ingredient_parser = IngredientParser(self.request, True)
                if "quantity" in ingredient and "name" in ingredient:
                    ingredient_step.ingredients.add(
                        Ingredient.objects.create(
                            food=ingredient_parser.get_food(ingredient["name"]),
                            unit=(ingredient_parser.get_unit(ingredient["unit"]) if "unit" in ingredient else None),
                            amount=ingredient["quantity"],
                            original_text=ingredient["text"],
                            space=self.request.space,
                        )
                    )
                else:
                    amount, unit, food, note = ingredient_parser.parse(ingredient["text"])
                    f = ingredient_parser.get_food(food)
                    u = ingredient_parser.get_unit(unit)
                    ingredient_step.ingredients.add(Ingredient.objects.create(
                        food=f,
                        unit=u,
                        amount=amount,
                        original_text=ingredient["text"],
                        space=self.request.space,
                    ))
            recipe.steps.add(ingredient_step)

        instructions = recipe_dict["recipeInstructions"]

        # Ignore recipe sections if only one exists
        if len(instructions) == 1 and instructions[0]["@type"] == 0:
            instructions = instructions[0]["itemListElement"]

        for index, s in enumerate(instructions):
            if "@type" not in s or s["@type"] == 1 or s["@type"] == 2:
                step = Step.objects.create(
                    instruction=s["text"],
                    name=_("Step") + " " + {index + 1},
                    space=self.request.space,
                    show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            # Handle Pestle Sections
            elif s["@type"] == 0:
                steps = []
                for item in s["itemListElement"]:
                    steps.append(item["text"])
                steps = [f"{i+1}. {text}\n" for i, text in enumerate(steps)]
                step = Step.objects.create(
                    instruction="\n".join(steps),
                    name=s["name"],
                    space=self.request.space,
                    show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            recipe.steps.add(step)

        if "nutrition" in recipe_dict:
            nutrition = {}
            if recipe_dict["nutrition"]["calories"] is not None:
                nutrition["calories"] = int(re.search(r"\d+", recipe_dict["nutrition"]["calories"]).group())
            if recipe_dict["nutrition"]["proteinContent"] is not None:
                nutrition["proteins"] = int(re.search(r"\d+", recipe_dict["nutrition"]["proteinContent"]).group())
            if recipe_dict["nutrition"]["fatContent"] is not None:
                nutrition["fats"] = int(re.search(r"\d+", recipe_dict["nutrition"]["fatContent"]).group())
            if recipe_dict["nutrition"]["carbohydrateContent"] is not None:
                nutrition["carbohydrates"] = int(re.search(r"\d+", recipe_dict["nutrition"]["carbohydrateContent"]).group())

            if nutrition != {}:
                recipe.nutrition = NutritionInformation.objects.create(**nutrition, space=self.request.space)
                recipe.save()

        if "image" in recipe_dict and len(recipe_dict["image"]) > 0:
            response = requests.get(recipe_dict["image"][0]["url"])
            if response.ok and response.content:
                self.import_recipe_image(
                    recipe,
                    BytesIO(response.content),
                )
        return recipe

    def get_files_from_recipes(self, recipes, el, cookie):
        raise NotImplementedError("Method not implemented in storage integration")

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError("Method not implemented in storage integration")
