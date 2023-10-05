import json

from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Comment, CookLog, Ingredient, Keyword, Recipe, Step


class OpenEats(Integration):

    def get_recipe_from_file(self, file):

        description = file['info']
        description_max_length = Recipe._meta.get_field('description').max_length
        if len(description) > description_max_length:
            description = description[0:description_max_length]

        recipe = Recipe.objects.create(name=file['name'].strip(), description=description, created_by=self.request.user, internal=True,
                                       servings=file['servings'], space=self.request.space, waiting_time=file['cook_time'], working_time=file['prep_time'])

        instructions = ''

        if file["directions"] != '':
            instructions += file["directions"]

        if file["source"] != '':
            instructions += '\n' + _('Recipe source:') + f'[{file["source"]}]({file["source"]})'

        cuisine_keyword, created = Keyword.objects.get_or_create(name="Cuisine", space=self.request.space)
        if file["cuisine"] != '':
            keyword, created = Keyword.objects.get_or_create(name=file["cuisine"].strip(), space=self.request.space)
            if created:
                keyword.move(cuisine_keyword, pos="last-child")
            recipe.keywords.add(keyword)

        course_keyword, created = Keyword.objects.get_or_create(name="Course", space=self.request.space)
        if file["course"] != '':
            keyword, created = Keyword.objects.get_or_create(name=file["course"].strip(), space=self.request.space)
            if created:
                keyword.move(course_keyword, pos="last-child")
            recipe.keywords.add(keyword)

        for tag in file["tags"]:
            keyword, created = Keyword.objects.get_or_create(name=tag.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        for comment in file['comments']:
            Comment.objects.create(recipe=recipe, text=comment['text'], created_by=self.request.user)
            CookLog.objects.create(recipe=recipe, rating=comment['rating'], created_by=self.request.user, space=self.request.space)

        if file["photo"] != '':
            recipe.image = f'recipes/openeats-import/{file["photo"]}'
            recipe.save()

        step = Step.objects.create(instruction=instructions, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in file['ingredients']:
            f = ingredient_parser.get_food(ingredient['food'])
            u = ingredient_parser.get_unit(ingredient['unit'])
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=ingredient['amount'], space=self.request.space,
            ))
        recipe.steps.add(step)

        return recipe

    def split_recipe_file(self, file):
        recipe_json = json.loads(file.read())
        recipe_dict = {}
        ingredient_group_dict = {}
        cuisine_group_dict = {}
        course_group_dict = {}
        tag_group_dict = {}

        for o in recipe_json:
            if o['model'] == 'recipe.recipe':
                recipe_dict[o['pk']] = {
                    'name': o['fields']['title'],
                    'info': o['fields']['info'],
                    'directions': o['fields']['directions'],
                    'source': o['fields']['source'],
                    'prep_time': o['fields']['prep_time'],
                    'cook_time': o['fields']['cook_time'],
                    'servings': o['fields']['servings'],
                    'ingredients': [],
                    'photo': o['fields']['photo'],
                    'cuisine': o['fields']['cuisine'],
                    'course': o['fields']['course'],
                    'tags': o['fields']['tags'],
                    'comments': [],
                }
            if o['model'] == 'ingredient.ingredientgroup':
                ingredient_group_dict[o['pk']] = o['fields']['recipe']
            if o['model'] == 'recipe_groups.cuisine':
                cuisine_group_dict[o['pk']] = o['fields']['title']
            if o['model'] == 'recipe_groups.course':
                course_group_dict[o['pk']] = o['fields']['title']
            if o['model'] == 'recipe_groups.tag':
                tag_group_dict[o['pk']] = o['fields']['title']

        for o in recipe_json:
            if o['model'] == 'rating.rating':
                recipe_dict[o['fields']['recipe']]["comments"].append({
                    "text": o['fields']['comment'],
                    "rating": o['fields']['rating']
                })
            if o['model'] == 'ingredient.ingredient':
                ingredient = {
                    'food': o['fields']['title'],
                    'unit': o['fields']['measurement'],
                    'amount': round(o['fields']['numerator'] / o['fields']['denominator'], 2),
                }
                recipe_dict[ingredient_group_dict[o['fields']['ingredient_group']]]['ingredients'].append(ingredient)

        for k, r in recipe_dict.items():
            if r["cuisine"] in cuisine_group_dict:
                r["cuisine"] = cuisine_group_dict[r["cuisine"]]
            if r["course"] in course_group_dict:
                r["course"] = course_group_dict[r["course"]]
            for index in range(len(r["tags"])):
                if r["tags"][index] in tag_group_dict:
                    r["tags"][index] = tag_group_dict[r["tags"][index]]

        return list(recipe_dict.values())

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
