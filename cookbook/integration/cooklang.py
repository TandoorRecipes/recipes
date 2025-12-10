import os
from io import BytesIO, StringIO

from recipe_scrapers._utils import get_minutes

from cookbook.helper.cooklang_parser import Recipe as CooklangRecipe
from cookbook.helper.HelperFunctions import match_or_fuzzymatch, validate_import_url
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text
from cookbook.integration.integration import Integration
from cookbook.models import Food, Ingredient, Keyword, Recipe, Step, Unit

# from zipfile import ZipFile


class Cooklang(Integration):
    # ----------------------------------------------------Helper Functions----------------------------------------------------
    def apply_metadata_cooklang_to_tandoor(self, cooklang_metadata: dict, tandoor_recipe: Recipe) -> None:
        # find exact matches in metadata, if none, then try fuzzy matching
        # all non-matched values become keywords
        tandoor_recipe_meta_types = {
            "name": ["title"],
            "description": ["summary", "details"],
            "servings": ["serves", "makes", "batch", "yields"],
            "keywords": ["tags", "keys"],
            "working time": ["time", "duration"],
            "source url": ["source", "url", "link", "website"]
            # "nutrition": ["nutritional", "health information"]
        }
        for key in cooklang_metadata.keys():
            keyword, certainty = match_or_fuzzymatch(key, tandoor_recipe_meta_types)
            if certainty >= 75:
                match keyword:
                    case "servings":
                        tandoor_recipe.servings = parse_servings(cooklang_metadata[key])
                        tandoor_recipe.servings_text = parse_servings_text(cooklang_metadata[key])
                    case "keywords":
                        for item in cooklang_metadata[key].split(","):
                            item = item.lstrip()
                            if not item:
                                continue
                            tandoor_recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=item)[0])

                    case "working time":
                        tandoor_recipe.working_time = get_minutes(cooklang_metadata[key])
                    case "source url":
                        if validate_import_url(cooklang_metadata[key]):
                            tandoor_recipe.source_url = cooklang_metadata[key]
                    # case "nutrition":
                    #     pass
                    case _:
                        setattr(tandoor_recipe, keyword, cooklang_metadata[key])
            else:
                tandoor_recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=cooklang_metadata[key])[0])

    # ------------------------------------------Integration Method Override Functions------------------------------------------

    def get_recipe_from_file(self, file) -> Recipe:
        # Import Recipe Logic - convert information from file into Recipe() object
        file_text = file.getvalue().decode("utf-8")
        try:
            cooklang_object = CooklangRecipe.parse(file_text)
        except Exception as e:
            raise e
        recipe = Recipe.objects.create(
            name=os.path.basename(file.name).replace('.cook', ""), description="", created_by=self.request.user, internal=True, servings=1, space=self.request.space
        )
        # specific metadata setup function
        self.apply_metadata_cooklang_to_tandoor(cooklang_object.metadata, recipe)
        # Translate the Steps and their related Ingredients
        i = 0
        for step in cooklang_object.steps:
            instruction_string = ""
            ingredients_list = []
            for block in step.blocks:
                match block.type:
                    case "Ingredient":
                        if not block.value.quantity.amount:
                            block.value.quantity.amount = 1
                        ingredients_list.append(
                            Ingredient.objects.create(
                                food=Food.objects.get_or_create(name=block.value.name, space=self.request.space)[0],
                                unit=Unit.objects.get_or_create(name=block.value.quantity.unit, space=self.request.space)[0],
                                amount=block.value.quantity.amount,
                                space=self.request.space,
                            )
                        )
                        amount = block.value.quantity.amount
                        if int(amount) == amount:
                            amount = int(amount)
                        instruction_string = instruction_string + f"{amount}" + f"{block.value.quantity.unit} " + block.value.name
                    case "Timer":
                        # assumes that any timers are waiting time
                        timer_string = f"{int(block.value.quantity)} " + block.value.unit
                        instruction_string = instruction_string + timer_string
                        if time := get_minutes(timer_string):
                            recipe.waiting_time += time
                        # treat working time as a total time
                        if recipe.working_time < recipe.waiting_time:
                            recipe.working_time = recipe.waiting_time
                    case "inline comment":
                        instruction_string = instruction_string + "(" + block.value + ")"
                    case "block comment":
                        instruction_string = instruction_string + "***" + block.value + "***"
                    case _:
                        instruction_string += block.value
            step = Step.objects.create(
                instruction=instruction_string, order=i, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients
            )
            for step_ingredient in ingredients_list:
                step.ingredients.add(step_ingredient)
            recipe.steps.add(step)
            i += 1
        recipe.save()
        return recipe

    # def import_file_name_filter(self, file) -> bool:
    #     # check file extension, return True if extension is correct
    #     pass

    # def get_file_from_recipe(self, recipe) -> tuple[str, str]:
    #     # Export Recipe Logic - convert from Recipe() object to a writable string in your integration's format
    #     # return 'Filename.extension', 'file string'
    #     pass

    # def get_files_from_recipes(self, recipes, el, cookie) -> list[list[str, bytes]]:
    #     # 'el' and 'cookie' are passed through by the calling function 'do_export'
    #     export_zip_stream = BytesIO()
    #     export_zip_obj = ZipFile(export_zip_stream, 'w')
    #
    #     for recipe in recipes:
    #         if True:  # add any verification logic
    #             # get string data and filename from get_file_from_recipe() method and save it to a zip stream
    #             recipe_stream = StringIO()
    #             filename, data = self.get_file_from_recipe(recipe)
    #             recipe_stream.write(data)
    #             export_zip_obj.writestr(f'{recipe.name}/{filename}', recipe_stream.getvalue())
    #             recipe_stream.close()
    #
    #         el.exported_recipes += 1
    #         el.msg += self.get_recipe_processed_msg(recipe)
    #         el.save()
    #
    #     export_zip_obj.close()
    #
    #     # returns a [[file name, zip stream data]]
    #     # self.get_export_file_name is an inherited from the Integration class and doesn't require definition
    #     return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
