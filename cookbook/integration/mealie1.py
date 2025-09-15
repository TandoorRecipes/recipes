import json
import re
from io import BytesIO
from zipfile import ZipFile
from gettext import gettext as _

from django.db import transaction

from cookbook.helper import ingredient_parser
from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step, Food, Unit, SupermarketCategory, PropertyType, Property, MealType, MealPlan


class Mealie1(Integration):
    """
    integration for mealie past version 1.0
    """

    def get_recipe_from_file(self, file):
        mealie_database = json.loads(BytesIO(file.read('database.json')).getvalue().decode("utf-8"))

        keywords_categories_dict = {}
        for c in mealie_database['categories']:
            if keyword := Keyword.objects.filter(name=c['name'], space=self.request.space).first():
                keywords_categories_dict[c['id']] = keyword.pk
            else:
                keyword = Keyword.objects.create(name=c['name'], space=self.request.space)
                keywords_categories_dict[c['id']] = keyword.pk

        keywords_tags_dict = {}
        for t in mealie_database['tags']:
            if keyword := Keyword.objects.filter(name=t['name'], space=self.request.space).first():
                keywords_tags_dict[t['id']] = keyword.pk
            else:
                keyword = Keyword.objects.create(name=t['name'], space=self.request.space)
                keywords_tags_dict[t['id']] = keyword.pk

        supermarket_categories_dict = {}
        for m in mealie_database['multi_purpose_labels']:
            if supermarket_category := SupermarketCategory.objects.filter(name=m['name'], space=self.request.space).first():
                supermarket_categories_dict[m['id']] = supermarket_category.pk
            else:
                supermarket_category = SupermarketCategory.objects.create(name=m['name'], space=self.request.space)
                supermarket_categories_dict[m['id']] = supermarket_category.pk

        foods_dict = {}
        for f in mealie_database['ingredient_foods']:
            if food := Food.objects.filter(name=f['name'], space=self.request.space).first():
                foods_dict[f['id']] = food.pk
            else:
                food = {'name': f['name'],
                        'plural_name': f['plural_name'],
                        'description': f['description'],
                        'space': self.request.space}

                if f['label_id'] and f['label_id'] in supermarket_categories_dict:
                    food['supermarket_category_id'] = supermarket_categories_dict[f['label_id']]

                food = Food.objects.create(**food)
                if f['on_hand']:
                    food.onhand_users.add(self.request.user)
                foods_dict[f['id']] = food.pk

        units_dict = {}
        for u in mealie_database['ingredient_units']:
            if unit := Unit.objects.filter(name=u['name'], space=self.request.space).first():
                units_dict[u['id']] = unit.pk
            else:
                unit = Unit.objects.create(name=u['name'], plural_name=u['plural_name'], description=u['description'], space=self.request.space)
                units_dict[u['id']] = unit.pk

        recipes_dict = {}
        recipes = []
        for r in mealie_database['recipes']:
            recipe = Recipe.objects.create(
                waiting_time=parse_time(r['perform_time']),
                working_time=parse_time(r['prep_time']),
                description=r['description'][:512],
                name=r['name'],
                source_url=r['org_url'],
                servings=r['recipe_servings'] if r['recipe_servings'] and r['recipe_servings'] != 0 else 1,
                servings_text=r['recipe_yield'].strip() if r['recipe_yield'] else "",
                internal=True,
                created_at=r['created_at'],
                space=self.request.space,
                created_by=self.request.user,
            )
            recipes.append(recipe)
            recipes_dict[r['id']] = recipe.pk

        steps_relation = []
        first_step_of_recipe_dict = {}
        for s in mealie_database['recipe_instructions']:
            step = Step.objects.create(instruction=(s['text'] if s['text'] else "") + (f" \n {s['summary']}" if s['summary'] else ""),
                                       order=s['position'],
                                       name=s['title'],
                                       space=self.request.space)
            steps_relation.append(Recipe.steps.through(recipe_id=recipes_dict[s['recipe_id']], step_id=step.pk))
            if s['recipe_id'] not in first_step_of_recipe_dict:
                first_step_of_recipe_dict[s['recipe_id']] = step.pk

        for n in mealie_database['notes']:
            step = Step.objects.create(instruction=n['text'],
                                       name=n['title'],
                                       order=100,
                                       space=self.request.space)
            steps_relation.append(Recipe.steps.through(recipe_id=recipes_dict[n['recipe_id']], step_id=step.pk))

        Recipe.steps.through.objects.bulk_create(steps_relation)

        ingredient_parser = IngredientParser(self.request, True)

        ingredients_relation = []
        for i in mealie_database['recipes_ingredients']:
            if i['title']:
                title_ingredient = Ingredient.objects.create(
                    note=i['title'],
                    is_header=True,
                    space=self.request.space,
                )
                ingredients_relation.append(Step.ingredients.through(step_id=first_step_of_recipe_dict[i['recipe_id']], ingredient_id=title_ingredient.pk))
            if i['food_id']:
                ingredient = Ingredient.objects.create(
                    food_id=foods_dict[i['food_id']] if i['food_id'] in foods_dict else None,
                    unit_id=units_dict[i['unit_id']] if i['unit_id'] in units_dict else None,
                    original_text=i['original_text'],
                    order=i['position'],
                    amount=i['quantity'],
                    note=i['note'],
                    space=self.request.space,
                )
                ingredients_relation.append(Step.ingredients.through(step_id=first_step_of_recipe_dict[i['recipe_id']], ingredient_id=ingredient.pk))
            elif i['note'].strip():
                amount, unit, food, note = ingredient_parser.parse(i['note'].strip())
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                ingredient = Ingredient.objects.create(
                    food=f,
                    unit=u,
                    amount=amount,
                    note=note,
                    original_text=i['original_text'],
                    space=self.request.space,
                )
                ingredients_relation.append(Step.ingredients.through(step_id=first_step_of_recipe_dict[i['recipe_id']], ingredient_id=ingredient.pk))
        Step.ingredients.through.objects.bulk_create(ingredients_relation)

        recipe_keyword_relation = []
        for rC in mealie_database['recipes_to_categories']:
            recipe_keyword_relation.append(Recipe.keywords.through(recipe_id=recipes_dict[rC['recipe_id']], keyword_id=keywords_categories_dict[rC['category_id']]))

        for rT in mealie_database['recipes_to_tags']:
            recipe_keyword_relation.append(Recipe.keywords.through(recipe_id=recipes_dict[rT['recipe_id']], keyword_id=keywords_tags_dict[rT['tag_id']]))

        Recipe.keywords.through.objects.bulk_create(recipe_keyword_relation, ignore_conflicts=True)

        property_types_dict = {
            'calories': PropertyType.objects.get_or_create(name=_('Calories'), space=self.request.space, defaults={'unit': 'kcal', 'fdc_id': 1008})[0],
            'carbohydrate_content': PropertyType.objects.get_or_create(name=_('Carbohydrates'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1005})[0],
            'cholesterol_content': PropertyType.objects.get_or_create(name=_('Cholesterol'), space=self.request.space, defaults={'unit': 'mg', 'fdc_id': 1253})[0],
            'fat_content': PropertyType.objects.get_or_create(name=_('Fat'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1004})[0],
            'fiber_content': PropertyType.objects.get_or_create(name=_('Fiber'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1079})[0],
            'protein_content': PropertyType.objects.get_or_create(name=_('Protein'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1003})[0],
            'saturated_fat_content': PropertyType.objects.get_or_create(name=_('Saturated Fat'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1258})[0],
            'sodium_content': PropertyType.objects.get_or_create(name=_('Sodium'), space=self.request.space, defaults={'unit': 'mg', 'fdc_id': 1093})[0],
            'sugar_content': PropertyType.objects.get_or_create(name=_('Sugar'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1063})[0],
            'trans_fat_content': PropertyType.objects.get_or_create(name=_('Trans Fat'), space=self.request.space, defaults={'unit': 'g', 'fdc_id': 1257})[0],
            'unsaturated_fat_content': PropertyType.objects.get_or_create(name=_('Unsaturated Fat'), space=self.request.space, defaults={'unit': 'g'})[0],
        }

        with transaction.atomic():
            recipe_properties_relation = []
            properties_relation = []
            for r in mealie_database['recipe_nutrition']:
                for key in property_types_dict:
                    if r[key]:
                        # the mealie UI does not communicate to the user if nutrition's are per serving or recipe, expect per serving by default
                        # TODO add option for user to choose between recipe and serving properties (use recipe_property_factor_dict with pre-calculated property factors)
                        properties_relation.append(
                            Property(property_type_id=property_types_dict[key].pk, property_amount=r[key], open_data_food_slug=r['recipe_id'], space=self.request.space))
            properties = Property.objects.bulk_create(properties_relation)
            property_ids = []
            for p in properties:
                recipe_properties_relation.append(Recipe.properties.through(recipe_id=recipes_dict[p.open_data_food_slug], property_id=p.pk))
                property_ids.append(p.pk)
            Recipe.properties.through.objects.bulk_create(recipe_properties_relation, ignore_conflicts=True)
            Property.objects.filter(id__in=property_ids).update(open_data_food_slug=None)

        # delete unused property types
        for pT in property_types_dict:
            try:
                property_types_dict[pT].delete()
            except:
                pass

        meal_types_dict = {}
        meal_plans = []
        for m in mealie_database['group_meal_plans']:
            if not m['entry_type'] in meal_types_dict:
                meal_type = MealType.objects.get_or_create(name=m['entry_type'], created_by=self.request.user, space=self.request.space)[0]
                meal_types_dict[m['entry_type']] = meal_type.pk
            meal_plans.append(MealPlan(
                recipe_id=recipes_dict[m['recipe_id']] if m['recipe_id'] else None,
                title=m['title'] if m['title'] else "",
                note=m['text'] if m['text'] else "",
                from_date=m['date'],
                to_date=m['date'],
                meal_type_id=meal_types_dict[m['entry_type']],
                created_by=self.request.user,
                space=self.request.space,
            ))

        MealPlan.objects.bulk_create(meal_plans)

        return recipes

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
