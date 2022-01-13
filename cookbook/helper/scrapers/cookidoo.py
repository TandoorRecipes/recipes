
from recipe_scrapers._abstract import AbstractScraper
from gettext import gettext as _


class Cookidoo(AbstractScraper):
    @classmethod
    def host(cls, site='cookidoo'):
        return {
            'cookidoo': f"{site}.de",
            #'cookidoo.at': f"{site}.at",
            #'cookidoo.ch': f"{site}.ch",
        }.get(site)

    def normalize_instruction(self, instruction):
        return instruction \
            .replace("<nobr>", "**")\
            .replace("</nobr>", "**")\
            .replace("", _('Linkslauf'))\
            .replace("", _('Kochlöffel'))

    def instructions(self):
        instructions = self.schema.data.get("recipeInstructions") or ""

        if isinstance(instructions, list):
            instructions_gist = []
            for schema_instruction_item in instructions:
                instructions_gist += self.schema._extract_howto_instructions_text(
                    schema_instruction_item
                )

            # add "header 1" markdown to marks the beginning of a new step
            return "\n\n#STEP\n\n".join(
                self.normalize_instruction(instruction) for instruction in instructions_gist
            )

        return instructions

    def ingredients(self):
        return self.schema.ingredients()
