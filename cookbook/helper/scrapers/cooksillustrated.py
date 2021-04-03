import json
from recipe_scrapers._abstract import AbstractScraper


class CooksIllustrated(AbstractScraper):
    @classmethod
    def host(cls):
        return "cooksillustrated.com"

    def title(self):
        return self.schema.title()

    def image(self):
        return self.schema.image()

    def total_time(self):
        if not self.recipe:
            self.get_recipe()
        return self.recipe['recipeTimeNote']

    def yields(self):
        if not self.recipe:
            self.get_recipe()
        return self.recipe['yields']

    def ingredients(self):
        if not self.recipe:
            self.get_recipe()
        ingredients = []
        for group in self.recipe['ingredientGroups']:
            ingredients += group['fields']['recipeIngredientItems']
        return [
            "{} {} {}{}".format(
                i['fields']['qty'],
                i['fields']['measurement'],
                i['fields']['ingredient']['fields']['title'],
                i['fields']['postText']
            )
            for i in ingredients
        ]

    def instructions(self):
        if not self.recipe:
            self.get_recipe()
        return "\n".join([self.recipe['whyThisWorks']] +
                    [
                        instruction['fields']['content']
                        for instruction in self.recipe['instructions']
                    ]
        )

    def nutrients(self):
        raise NotImplementedError("This should be implemented.")

    def get_recipe(self):
        j = json.loads(self.soup.find(type='application/json').string)
        name = list(j['props']['initialState']['content']['documents'])[0]
        self.recipe = j['props']['initialState']['content']['documents'][name]
