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
            step_number = 1
            for schema_instruction_item in instructions:
                instructions_gist += self.extract_instructions_text(schema_instruction_item, "#", step_number)
                step_number = step_number + 1

            # join all steps into a recipe
            return "".join(self.normalize_instruction(instruction)
                           for instruction in instructions_gist)

        return instructions

    def extract_instructions_text(self, schema_item, prefix, start_step_number):
        step_number = start_step_number
        step_format = "\n\n" + prefix + _("Step {}") + "\n\n{}"
        section_format = "\n\n{}\n\n"
        instructions_gist = []
        if type(schema_item) is str:
            instructions_gist.append(step_format.format(step_number, schema_item))
            step_number = step_number + 1
        elif schema_item.get("@type") == "HowToStep":
            # steps make up simple recipes or a section of a more complex recipe
            if schema_item.get("name", False):
                # name may be the text in full or truncated
                if not schema_item.get("text").startswith(
                        schema_item.get("name").rstrip(".")
                ):
                    instructions_gist.append(step_format.format(step_number, schema_item.get("name")))
            instructions_gist.append(step_format.format(step_number, schema_item.get("text")))
        elif schema_item.get("@type") == "HowToSection":
            # complex recipes are made up of named sections that are made up of steps
            section_name = schema_item.get("name") or schema_item.get("Name") or _("Instructions")
            instructions_gist.append(section_format.format(section_name))
            step_number = 1
            for item in schema_item.get("itemListElement"):
                instructions_gist += self.extract_instructions_text(item, "#" + prefix, step_number)
                step_number = step_number + 1
        return instructions_gist

    def ingredients(self):
        return self.schema.ingredients()
