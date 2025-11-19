import json
import re
import traceback
import uuid
from decimal import Decimal
from io import BytesIO
from zipfile import ZipFile
from gettext import gettext as _

from django.db import transaction

from cookbook.helper import ingredient_parser
from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step, Food, Unit, SupermarketCategory, PropertyType, Property, MealType, MealPlan, CookLog, ShoppingListEntry


class Mealie1(Integration):
    """
    integration for mealie past version 1.0
    """

    def get_recipe_from_file(self, file):
        mealie_database = json.loads(BytesIO(file.read('database.json')).getvalue().decode("utf-8"))
        self.import_log.total_recipes = len(mealie_database['recipes'])
        self.import_log.msg += f"Importing {len(mealie_database["categories"]) + len(mealie_database["tags"])} tags and categories as keywords...\n"
        self.import_log.save()

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

        self.import_log.msg += f"Importing {len(mealie_database["multi_purpose_labels"])} multi purpose labels as supermarket categories...\n"
        self.import_log.save()

        supermarket_categories_dict = {}
        for m in mealie_database['multi_purpose_labels']:
            if supermarket_category := SupermarketCategory.objects.filter(name=m['name'], space=self.request.space).first():
                supermarket_categories_dict[m['id']] = supermarket_category.pk
            else:
                supermarket_category = SupermarketCategory.objects.create(name=m['name'], space=self.request.space)
                supermarket_categories_dict[m['id']] = supermarket_category.pk

        self.import_log.msg += f"Importing {len(mealie_database["ingredient_foods"])} foods...\n"
        self.import_log.save()

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

        self.import_log.msg += f"Importing {len(mealie_database["ingredient_units"])} units...\n"
        self.import_log.save()

        units_dict = {}
        for u in mealie_database['ingredient_units']:
            if unit := Unit.objects.filter(name=u['name'], space=self.request.space).first():
                units_dict[u['id']] = unit.pk
            else:
                unit = Unit.objects.create(name=u['name'], plural_name=u['plural_name'], description=u['description'], space=self.request.space)
                units_dict[u['id']] = unit.pk

        recipes_dict = {}
        recipe_property_factor_dict = {}
        recipes = []
        recipe_keyword_relation = []
        for r in mealie_database['recipes']:
            if Recipe.objects.filter(space=self.request.space, name=r['name']).exists() and not self.import_duplicates:
                self.import_log.msg += f"Ignoring {r['name']} because a recipe with this name already exists.\n"
                self.import_log.save()
            else:
                servings = 1
                try:
                    servings = r['recipe_servings'] if r['recipe_servings'] and r['recipe_servings'] != 0 else 1
                except KeyError:
                    pass

                recipe = Recipe.objects.create(
                    waiting_time=parse_time(r['perform_time']),
                    working_time=parse_time(r['prep_time']),
                    description=r['description'][:512],
                    name=r['name'],
                    source_url=r['org_url'],
                    servings=servings,
                    servings_text=r['recipe_yield'].strip() if r['recipe_yield'] else "",
                    internal=True,
                    created_at=r['created_at'],
                    space=self.request.space,
                    created_by=self.request.user,
                )

                if not self.nutrition_per_serving:
                    recipe_property_factor_dict[r['id']] = recipe.servings

                self.import_log.msg += self.get_recipe_processed_msg(recipe)
                self.import_log.imported_recipes += 1
                self.import_log.save()

                recipes.append(recipe)
                recipes_dict[r['id']] = recipe.pk
                recipe_keyword_relation.append(Recipe.keywords.through(recipe_id=recipe.pk, keyword_id=self.keyword.pk))

        Recipe.keywords.through.objects.bulk_create(recipe_keyword_relation, ignore_conflicts=True)

        self.import_log.msg += f"Importing {len(mealie_database["recipe_instructions"])} instructions...\n"
        self.import_log.save()

        steps_relation = []
        first_step_of_recipe_dict = {}
        step_id_dict = {}
        for s in mealie_database['recipe_instructions']:
            if s['recipe_id'] in recipes_dict:
                step = Step.objects.create(instruction=(s['text'] if s['text'] else "") + (f" \n {s['summary']}" if 'summary' in s and s['summary'] else ""),
                                           order=s['position'],
                                           name=s['title'],
                                           space=self.request.space)
                steps_relation.append(Recipe.steps.through(recipe_id=recipes_dict[s['recipe_id']], step_id=step.pk))
                step_id_dict[s["id"]] = step.pk
                if s['recipe_id'] not in first_step_of_recipe_dict:
                    first_step_of_recipe_dict[s['recipe_id']] = step.pk

        # it is possible for a recipe to not have steps but have ingredients, in that case create an empty step to add them to later
        for r in recipes_dict.keys():
            if r not in first_step_of_recipe_dict:
                step = Step.objects.create(instruction='',
                                    order=0,
                                    name='',
                                    space=self.request.space)
                steps_relation.append(Recipe.steps.through(recipe_id=recipes_dict[r], step_id=step.pk))
                first_step_of_recipe_dict[r] = step.pk

        for n in mealie_database['notes']:
            if n['recipe_id'] in recipes_dict:
                step = Step.objects.create(instruction=n['text'],
                                           name=n['title'],
                                           order=100,
                                           space=self.request.space)
                steps_relation.append(Recipe.steps.through(recipe_id=recipes_dict[n['recipe_id']], step_id=step.pk))

        Recipe.steps.through.objects.bulk_create(steps_relation)

        ingredient_parser = IngredientParser(self.request, True)

        self.import_log.msg += f"Importing {len(mealie_database["recipes_ingredients"])} ingredients...\n"
        self.import_log.save()

        # mealie stores the reference to a step (instruction) from an ingredient (reference) in the recipe_ingredient_ref_link table
        recipe_ingredient_ref_link_dict = {}
        for ref in mealie_database['recipe_ingredient_ref_link']:
            recipe_ingredient_ref_link_dict[ref["reference_id"]] = ref["instruction_id"]

        ingredients_relation = []
        for i in mealie_database['recipes_ingredients']:
            if i['recipe_id'] in recipes_dict:
                if i['title']:
                    title_ingredient = Ingredient.objects.create(
                        note=i['title'],
                        is_header=True,
                        space=self.request.space,
                    )
                    ingredients_relation.append(Step.ingredients.through(step_id=get_step_id(i, first_step_of_recipe_dict, step_id_dict,recipe_ingredient_ref_link_dict), ingredient_id=title_ingredient.pk))
                if i['food_id']:
                    ingredient = Ingredient.objects.create(
                        food_id=foods_dict[i['food_id']] if i['food_id'] in foods_dict else None,
                        unit_id=units_dict[i['unit_id']] if i['unit_id'] in units_dict else None,
                        original_text=i['original_text'],
                        order=i['position'],
                        amount=i['quantity'] if i['quantity'] else 0,
                        note=i['note'],
                        space=self.request.space,
                    )
                    ingredients_relation.append(Step.ingredients.through(step_id=get_step_id(i, first_step_of_recipe_dict, step_id_dict,recipe_ingredient_ref_link_dict), ingredient_id=ingredient.pk))
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
                    ingredients_relation.append(Step.ingredients.through(step_id=get_step_id(i, first_step_of_recipe_dict, step_id_dict,recipe_ingredient_ref_link_dict), ingredient_id=ingredient.pk))
        Step.ingredients.through.objects.bulk_create(ingredients_relation)

        self.import_log.msg += f"Importing {len(mealie_database["recipes_to_categories"]) + len(mealie_database["recipes_to_tags"])} category and keyword relations...\n"
        self.import_log.save()

        recipe_keyword_relation = []
        for rC in mealie_database['recipes_to_categories']:
            if rC['recipe_id'] in recipes_dict:
                recipe_keyword_relation.append(Recipe.keywords.through(recipe_id=recipes_dict[rC['recipe_id']], keyword_id=keywords_categories_dict[rC['category_id']]))

        for rT in mealie_database['recipes_to_tags']:
            if rT['recipe_id'] in recipes_dict:
                recipe_keyword_relation.append(Recipe.keywords.through(recipe_id=recipes_dict[rT['recipe_id']], keyword_id=keywords_tags_dict[rT['tag_id']]))

        Recipe.keywords.through.objects.bulk_create(recipe_keyword_relation, ignore_conflicts=True)

        self.import_log.msg += f"Importing {len(mealie_database["recipe_nutrition"])} properties...\n"
        self.import_log.save()

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
                if r['recipe_id'] in recipes_dict:
                    for key in property_types_dict:
                        if key in r and r[key]:
                            properties_relation.append(
                                Property(property_type_id=property_types_dict[key].pk,
                                         property_amount=Decimal(str(r[key])) / (
                                             Decimal(str(recipe_property_factor_dict[r['recipe_id']])) if r['recipe_id'] in recipe_property_factor_dict else 1),
                                         open_data_food_slug=r['recipe_id'],
                                         space=self.request.space))
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

        self.import_log.msg += f"Importing {len(mealie_database["recipe_comments"]) + len(mealie_database["recipe_timeline_events"])} comments and cook logs...\n"
        self.import_log.save()

        cook_log_list = []
        for c in mealie_database['recipe_comments']:
            if c['recipe_id'] in recipes_dict:
                cook_log_list.append(CookLog(
                    recipe_id=recipes_dict[c['recipe_id']],
                    comment=c['text'],
                    created_at=c['created_at'],
                    created_by=self.request.user,
                    space=self.request.space,
                ))

        for c in mealie_database['recipe_timeline_events']:
            if c['recipe_id'] in recipes_dict:
                if c['event_type'] == 'comment':
                    cook_log_list.append(CookLog(
                        recipe_id=recipes_dict[c['recipe_id']],
                        comment=c['message'],
                        created_at=c['created_at'],
                        created_by=self.request.user,
                        space=self.request.space,
                    ))

        CookLog.objects.bulk_create(cook_log_list)

        if self.import_meal_plans:
            self.import_log.msg += f"Importing {len(mealie_database["group_meal_plans"])} meal plans...\n"
            self.import_log.save()

            meal_types_dict = {}
            meal_plans = []
            for m in mealie_database['group_meal_plans']:
                if m['recipe_id'] in recipes_dict:
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

        if self.import_shopping_lists:
            self.import_log.msg += f"Importing {len(mealie_database["shopping_list_items"])} shopping list items...\n"
            self.import_log.save()

            shopping_list_items = []
            for sli in mealie_database['shopping_list_items']:
                if not sli['checked']:
                    if sli['food_id']:
                        shopping_list_items.append(ShoppingListEntry(
                            amount=sli['quantity'],
                            unit_id=units_dict[sli['unit_id']] if sli['unit_id'] else None,
                            food_id=foods_dict[sli['food_id']] if sli['food_id'] else None,
                            created_by=self.request.user,
                            space=self.request.space,
                        ))
                    elif not sli['food_id'] and sli['note'].strip():
                        amount, unit, food, note = ingredient_parser.parse(sli['note'].strip())
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        shopping_list_items.append(ShoppingListEntry(
                            amount=amount,
                            unit=u,
                            food=f,
                            created_by=self.request.user,
                            space=self.request.space,
                        ))
            ShoppingListEntry.objects.bulk_create(shopping_list_items)

        self.import_log.msg += f"Importing Images. This might take some time ...\n"
        self.import_log.save()
        for r in mealie_database['recipes']:
            try:
                if recipe := Recipe.objects.filter(pk=recipes_dict[r['id']]).first():
                    self.import_recipe_image(recipe, BytesIO(file.read(f'data/recipes/{str(uuid.UUID(str(r['id'])))}/images/original.webp')), filetype='.webp')
            except Exception:
                pass

        return recipes

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')


def get_step_id(i, first_step_of_recipe_dict, step_id_dict, recipe_ingredient_ref_link_dict):
    try:
        return step_id_dict[recipe_ingredient_ref_link_dict[i['reference_id']]]
    except KeyError:
        return first_step_of_recipe_dict[i['recipe_id']]