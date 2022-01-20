
from recipe_scrapers._abstract import AbstractScraper
from gettext import gettext as _


class Cookidoo(AbstractScraper):
    @classmethod
    def host(cls, site='cookidoo'):
        return {
            'cookidoo': f"{site}.de",
            'cookidoo.at': f"{site}.at",
            'cookidoo.ch': f"{site}.ch",
        }.get(site)

    def normalize_instruction(self, instruction):
        if instruction is None:
            return ""
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
                instructions_gist += self.extract_instructions_text(schema_instruction_item, "#", 1)

            # add "header 1" markdown to marks the beginning of a new step
            return "".join(self.normalize_instruction(instruction)
                           for instruction in instructions_gist)
            #return "\n\n#STEP\n\n".join(
            #    self.normalize_instruction(instruction) for instruction in instructions_gist
            #)

        return instructions

    def extract_instructions_text(self, schema_item, prefix, start_step_number):
        step_number = start_step_number
        step_format = "\n\n" + prefix + _("Step {}") + "\n\n{}"
        section_format = "\n\n{}\n\n"
        instructions_gist = []
        if type(schema_item) is str:
            instructions_gist.append(step_format.format(step_number, schema_item))
        elif schema_item.get("@type") == "HowToStep":
            if schema_item.get("name", False):
                # some sites have duplicated name and text properties (1:1)
                # others have name same as text but truncated to X chars.
                # ignore name in these cases and add the name value only if it's different from the text
                if not schema_item.get("text").startswith(
                        schema_item.get("name").rstrip(".")
                ):
                    instructions_gist.append(step_format.format(step_number, schema_item.get("name")))
            instructions_gist.append(step_format.format(step_number, schema_item.get("text")))
        elif schema_item.get("@type") == "HowToSection":
            section_name = schema_item.get("name") or schema_item.get("Name") or gettext("Instructions")
            instructions_gist.append(section_format.format(section_name))
            step_number = 1
            for item in schema_item.get("itemListElement"):
                instructions_gist += self.extract_instructions_text(item, "#" + prefix, step_number)
                step_number = step_number + 1
        return instructions_gist

    def ingredients(self):
        return self.schema.ingredients()
