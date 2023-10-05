from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class RezKonv(Integration):

    def get_recipe_from_file(self, file):

        ingredient_mode = False
        direction_mode = False

        ingredients = []
        directions = []
        for line in file.replace('\r', '').replace('\n\n', '\n').split('\n'):
            if 'Titel:' in line:
                title = line.replace('Titel:', '').strip()
            if 'Kategorien:' in line:
                tags = line.replace('Kategorien:', '').strip()
            if ingredient_mode and (
                    'quelle' in line.lower() or 'source' in line.lower() or (line == '' and len(ingredients) > 0)):
                ingredient_mode = False
                direction_mode = True
            if ingredient_mode:
                if line != '' and '===' not in line and 'Zubereitung' not in line:
                    ingredients.append(line.strip())
            if direction_mode:
                if line.strip() != '' and line.strip() != '=====':
                    directions.append(line.strip())
            if 'Zutaten:' in line or 'Ingredients' in line or 'Menge:' in line:
                ingredient_mode = True

        recipe = Recipe.objects.create(name=title, created_by=self.request.user, internal=True,
                                       space=self.request.space)

        for k in tags.split(','):
            keyword, created = Keyword.objects.get_or_create(name=k.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        step = Step.objects.create(
            instruction='  \n'.join(directions) + '\n\n', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
        )

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def split_recipe_file(self, file):
        recipe_list = []
        current_recipe = ''
        # TODO build algorithm to try trough encodings and fail if none work, use for all importers
        # encoding_list = ['windows-1250', 'latin-1']
        encoding = 'windows-1250'
        for fl in file.readlines():
            try:
                line = fl.decode(encoding)
            except UnicodeDecodeError:
                encoding = 'latin-1'
                line = fl.decode(encoding)
            if line.startswith('=====') and 'rezkonv' in line.lower():
                if current_recipe != '':
                    recipe_list.append(current_recipe)
                    current_recipe = ''
                else:
                    current_recipe = ''
            else:
                current_recipe += line + '\n'

        if current_recipe != '':
            recipe_list.append(current_recipe)

        return recipe_list
