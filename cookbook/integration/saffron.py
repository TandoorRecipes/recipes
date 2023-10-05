from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class Saffron(Integration):

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False

        ingredients = []
        directions = []
        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'Title:' in line:
                title = line.replace('Title:', '').strip()
            if 'Description:' in line:
                description = line.replace('Description:', '').strip()
            if 'Yield:' in line:
                directions.append(_('Servings') + ' ' + line.replace('Yield:', '').strip() + '\n')
            if 'Cook:' in line:
                directions.append(_('Waiting time') + ' ' + line.replace('Cook:', '').strip() + '\n')
            if 'Prep:' in line:
                directions.append(_('Preparation Time') + ' ' + line.replace('Prep:', '').strip() + '\n')
            if 'Cookbook:' in line:
                directions.append(_('Cookbook') + ' ' + line.replace('Cookbook:', '').strip() + '\n')
            if 'Section:' in line:
                directions.append(_('Section') + ' ' + line.replace('Section:', '').strip() + '\n')
            if ingredient_mode:
                if len(line) > 2 and 'Instructions:' not in line:
                    ingredients.append(line.strip())
            if direction_mode:
                if len(line) > 2:
                    directions.append(line.strip())
            if 'Ingredients:' in line:
                ingredient_mode = True
            if 'Instructions:' in line:
                ingredient_mode = False
                direction_mode = True

        recipe = Recipe.objects.create(name=title, description=description, created_by=self.request.user, internal=True, space=self.request.space, )

        step = Step.objects.create(instruction='\n'.join(directions), space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients, )

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            amount, unit, food, note = ingredient_parser.parse(ingredient)
            f = ingredient_parser.get_food(food)
            u = ingredient_parser.get_unit(unit)
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
            ))
        recipe.steps.add(step)

        return recipe

    def get_file_from_recipe(self, recipe):

        data = "Title: " + recipe.name if recipe.name else "" + "\n"
        data += "Description: " + recipe.description if recipe.description else "" + "\n"
        data += "Source: \n"
        data += "Original URL: \n"
        data += "Yield: " + str(recipe.servings) + "\n"
        data += "Cookbook: \n"
        data += "Section: \n"
        data += "Image: \n"

        recipeInstructions = []
        recipeIngredient = []
        for s in recipe.steps.all():
            recipeInstructions.append(s.instruction)

            for i in s.ingredients.all():
                recipeIngredient.append(f'{float(i.amount)} {i.unit} {i.food}')

        data += "Ingredients: \n"
        for ingredient in recipeIngredient:
            data += ingredient + "\n"

        data += "Instructions: \n"
        for instruction in recipeInstructions:
            data += instruction + "\n"

        return recipe.name + '.txt', data

    def get_files_from_recipes(self, recipes, el, cookie):
        files = []
        for r in recipes:
            filename, data = self.get_file_from_recipe(r)
            files.append([filename, data])

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(r)
            el.save()

        return files
