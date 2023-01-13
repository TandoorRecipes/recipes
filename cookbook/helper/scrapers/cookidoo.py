from recipe_scrapers._abstract import AbstractScraper
from gettext import gettext as _


class Cookidoo(AbstractScraper):

    def normalize_instruction(self, instruction):
        if instruction is None:
            return ""
        # handle Thermomix-specific instructions that happen in nearly every receipe on Cookidoo
        return instruction \
            .replace("<nobr>", "**") \
            .replace("</nobr>", "**") \
            .replace("", _('Linkslauf')) \
            .replace("", _('Kochlöffel')) \
            .replace("", _('Kneten')) \
            .replace("Andicken ", _('Andicken')) \
            .replace("Erwärmen ", _('Erwärmen')) \
            .replace("Fermentieren ", _('Fermentieren')) \
            .replace("Rühraufsatz einsetzen", "**Rühraufsatz einsetzen**") \
            .replace("Rühraufsatz entfernen", "**Rühraufsatz entfernen**")

    def instructions(self):
        instructions = self.schema.data.get("recipeInstructions") or ""

        if isinstance(instructions, list):
            instructions_gist = []
            for schema_instruction_item in instructions:
                # combine lists of instructions per section into a flat list
                instructions_gist += self.extract_instructions_text(schema_instruction_item, "",)

            steps = []
            for instruction in instructions_gist:
                steps.append(self.normalize_instruction(instruction))

            return steps

        return instructions

    def extract_instructions_text(self, schema_item, prefix):
        instructions_gist = []
        if type(schema_item) is str:
            instructions_gist.append(prefix + schema_item)
        elif schema_item.get("@type") == "HowToStep":
            # steps make up simple recipes or a section of a more complex recipe
            if schema_item.get("name", False):
                # name may be the text in full or truncated
                if not schema_item.get("text").startswith(
                        schema_item.get("name").rstrip(".")
                ):
                    instructions_gist.append(schema_item.get("name"))
            instructions_gist.append(schema_item.get("text"))
        elif schema_item.get("@type") == "HowToSection":
            # complex recipes are made up of named sections that are made up of steps
            section_name = schema_item.get("name") or schema_item.get("Name") or _("Instructions")
            instructions_gist.append("**" + section_name + "**")
            for item in schema_item.get("itemListElement"):
                instructions_gist += self.extract_instructions_text(item, "#" + prefix)
        return instructions_gist

    def ingredients(self):
        return self.schema.ingredients()
