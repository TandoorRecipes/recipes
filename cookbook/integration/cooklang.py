import os
from io import BytesIO, StringIO
from zipfile import ZipFile

from recipe_scrapers._utils import get_minutes

from cookbook.helper.cooklang_parser import Recipe as CooklangRecipe
from cookbook.helper.HelperFunctions import match_or_fuzzymatch, validate_import_url
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text
from cookbook.integration.integration import Integration
from cookbook.models import Keyword, Recipe, Step


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
            "waiting time": ["idle time"],
            "source url": ["source", "url", "link", "website"]
            # "nutrition": ["nutritional", "health information"]
        }
        for key in cooklang_metadata.keys():
            print(key, cooklang_metadata[key])
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
                            try:
                                tandoor_recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=item)[0])
                            except:
                                pass
                    case "working time":
                        tandoor_recipe.working_time = get_minutes(cooklang_metadata[key])
                    case "waiting time":
                        tandoor_recipe.waiting_time = get_minutes(cooklang_metadata[key])
                    case "source url":
                        if validate_import_url(cooklang_metadata[key]):
                            tandoor_recipe.source_url = cooklang_metadata[key]
                    # case "nutrition":
                    #     pass
                    case _:
                        setattr(tandoor_recipe, keyword, cooklang_metadata[key])
            else:
                try:
                    tandoor_recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=cooklang_metadata[key])[0])
                except:
                    pass

    # ----------------------------------------------------Integration Method Override Functions----------------------------------------------------

    # def import_file_name_filter(self, file) -> bool:
    #     # check file extension, return True if extension is correct
    #     pass

    def get_recipe_from_file(self, file) -> Recipe:
        # Import Recipe Logic - convert information from file into Recipe() object
        file_text = file.read()
        cooklang_object = CooklangRecipe.parse(file_text)
        recipe = Recipe.objects.create(
            name=os.path.basename(file.name).split('.')[0], description="", created_by=self.request.user, internal=True, servings=0, space=self.request.space
        )
        # specific metadata setup function
        self.apply_metadata_cooklang_to_tandoor(cooklang_object.metadata, recipe)
        # Translate the Steps and their related Ingredients
        # i = 0
        # for step in cooklang_object.steps:
        #     step = Step.objects.create(instruction=None, order=i, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients)
        #

        # todo implement Ingredients

        return recipe

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
