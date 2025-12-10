# Cooklang parser forked from on https://github.com/luizribeiro/py-cooklang cooklang.py as of 11/18/25 - MIT License
# Modifications by doylelew

import copy
import re
from dataclasses import dataclass
from typing import Optional, Union


@dataclass
class Quantity:
    amount: Union[str, float]
    unit: Optional[str] = None

    @classmethod
    def parse(cls, raw) -> "Quantity":
        amount = raw
        unit = ""
        if len(quantity_tokens := re.split(r'%', amount)) == 2:
            amount = quantity_tokens[0]
            unit = quantity_tokens[1]
        if amount != "":
            try:
                float(amount)
            except ValueError:
                whole_num = 0
                if len(integer_fraction_tokens := re.split(r' ', amount)) == 2:
                    whole_num = int(integer_fraction_tokens[0])
                    amount = integer_fraction_tokens[1]

                if len(fraction := re.split(r'/', amount)) == 2:
                    amount = int(fraction[0]) / int(fraction[1])
                    amount += whole_num
                else:
                    raise Exception(f"Cooklang:Quantity:parse Syntax Error: measurements must be in float or #/# format, received {amount}")
            amount = round(float(amount), 3)
        return Quantity(amount=amount, unit=unit)

    @classmethod
    def add_optional(cls, a: Optional["Quantity"], b: Optional["Quantity"]) -> Optional["Quantity"]:
        if a and b:
            return a + b
        elif a or b:
            return a or b
        return None

    def __add__(self, other: "Quantity") -> "Quantity":
        if self.unit != other.unit:
            raise ValueError(f"Cannot add unit {self.unit} to {other.unit}")
        new_amount = self.amount + other.amount
        return Quantity(
            amount=new_amount,
            unit=self.unit,
        )


@dataclass
class Timer:
    ingredient_str: str
    quantity: float
    unit: str

    @classmethod
    def parse(cls, raw) -> "Timer":
        if len(timer_tokens := re.split(r'[{%]', raw)) < 3:
            raise Exception(f"Cooklang:Recipe:Timer Syntax Error: timers must be in {{num%unit}} format, received {raw}")
        ingredient = timer_tokens[0]
        quantity = timer_tokens[1]
        unit = timer_tokens[2].replace("}", "")

        try:
            float(quantity)
        except ValueError:
            whole_num = 0
            if len(integer_fraction_tokens := re.split(r' ', quantity)) == 2:
                whole_num = int(integer_fraction_tokens[0])
                quantity = integer_fraction_tokens[1]
            if len(fraction := re.split(r'/', quantity)) == 2:
                quantity = int(fraction[0]) / int(fraction[1])
                quantity += whole_num
            else:
                raise Exception(f"Cooklang:Timer:parse Syntax Error: measurements must be in float or #/# format, received {quantity}")
        quantity = round(float(quantity), 3)
        return Timer(ingredient_str=ingredient, quantity=quantity, unit=unit)


@dataclass
class Ingredient:
    name: str
    quantity: Optional[Quantity] = None

    @classmethod
    def parse(cls, raw: str) -> "Ingredient":
        ingredient = raw
        quantity = ""
        if len(ingredient_tokens := re.split(r'{', raw)) == 2:
            ingredient = ingredient_tokens[0]
            quantity = ingredient_tokens[1].replace('}', '')
        return Ingredient(
            name=ingredient,
            quantity=Quantity.parse(quantity),
        )

    def __add__(self, other: "Ingredient") -> "Ingredient":
        if self.name != other.name:
            raise ValueError(f"Cannot add ingredient {self.name} with {other.name}", )
        return Ingredient(
            name=self.name,
            quantity=Quantity.add_optional(self.quantity, other.quantity),
        )


@dataclass
class Block:
    type: str
    value: Union[str, Ingredient, Timer]

    @classmethod
    def new(cls):
        return Block(type="", value="")


@dataclass
class Step:
    blocks: list[Block]

    @classmethod
    def parse(cls, raw: str) -> "Step":
        # split steps into a stream of tokens broken up by delimiters
        blocks = []
        token_stream = re.split(r'(--|\[-|-\]|[@#}~])', raw)

        # verify terminating delimiter and return token or if no delimiter then return only first word
        def find_arbitrary_termination_token(current_token, next_token, termination_delimiter) -> tuple[str, list[str]]:
            return_tokens = []
            if next_token != termination_delimiter:
                sub_tokens = re.split(r'(?=[\W\s])([^-])', current_token)
                current_token = sub_tokens.pop(0)
                if next_token:
                    return_tokens.insert(0, next_token)
                return_tokens.insert(0, "".join(sub_tokens))
            else:
                current_token += termination_delimiter
            return current_token, return_tokens

        # ensure that the correct terminating delimiter is used
        def find_termination_token(current_token, next_token, termination_delimiter) -> str:
            if next_token != termination_delimiter:
                raise Exception(f"Cooklang:Recipe:parse Syntax Error: expected terminating delimiter {termination_delimiter}, recieved {next_token}")
            else:
                return current_token + termination_delimiter

        # asses tokens in order to identify and denote datatypes into blocks
        while token_stream:
            block = Block.new()
            token = token_stream.pop(0)
            stream_return = []
            match token:
                case "@":
                    block.type = "Ingredient"
                    next_token = token_stream.pop(0)
                    lookahead = None
                    if len(token_stream) > 0:
                        lookahead = token_stream.pop(0)
                    token, stream_return = find_arbitrary_termination_token(next_token, lookahead, '}')
                    block.value = Ingredient.parse(token)

                case "#":
                    block.type = "Cookware"
                    next_token = token_stream.pop(0)
                    lookahead = None
                    if len(token_stream) > 0:
                        lookahead = token_stream.pop(0)
                    token, stream_return = find_arbitrary_termination_token(next_token, lookahead, '}')
                    block.value = token.replace("{}", "")
                case "~":
                    block.type = "Timer"
                    next_token = token_stream.pop(0)
                    lookahead = None
                    if len(token_stream) > 0:
                        lookahead = token_stream.pop(0)
                    token, stream_return = find_arbitrary_termination_token(next_token, lookahead, '}')
                    block.value = Timer.parse(token)
                case "--":
                    block.type = "inline comment"
                    token = token_stream.pop(0)
                    if len(find_new_line := token.split("\n", 1)) == 2:
                        block.value = find_new_line[0]
                        stream_return = ["\n" + find_new_line[1]]
                    elif len(token_stream) == 0:
                        block.value = token
                    else:
                        raise Exception("Cooklang:Step:parse Syntax Error: inline comments must end with a new line")
                case "[-":
                    block.type = "block comment"
                    block.value = find_termination_token(token_stream.pop(0), token_stream.pop(0), '-]').replace("-]", "")
                case "}":
                    raise Exception("Cooklang:Step:parse Syntax Error: stray '}' found with no delimiting '@', '#' or '~'")
                case "-]":
                    raise Exception("Cooklang:Step:parse Syntax Error: stray '-]' found with no opening '[-'")
                case _:
                    block.type = "text"
                    block.value = token
            token_stream = stream_return + token_stream
            if block.value != '':
                blocks.append(block)

        return Step(blocks=blocks)


@dataclass
class Recipe:
    metadata: dict[str, str]
    ingredients: list[Ingredient]
    steps: list[Step]

    @classmethod
    def parse(cls, raw: str) -> "Recipe":
        # Remove white space at the end of the document
        raw = re.sub(r'\s+$', '', raw)

        # Separate the Metadata from the rest of the recipe, "--- metadata ---" format
        raw_metadata = ""
        raw_no_metadata = raw
        if len(raw_meta_split := re.split(r'---([\s\S]*?)---\n', raw)) > 1:
            raw_metadata = raw_meta_split[-2]
            raw_no_metadata = raw_meta_split[-1]

        # Separate the Metadata from the rest of the recipe, ">> metadata" format
        if not raw_metadata:
            for line in raw.lstrip().splitlines():
                if not bool(re.match(r'^>>', line)):
                    break
                raw_no_metadata = raw_no_metadata.replace(line, "")
                raw_metadata = raw_metadata + re.sub(r'^>>', "", line).lstrip() + "\n"
        raw_metadata.rstrip()

        # Parse the metadata
        metadata = {}
        if raw_metadata:
            current_key = None
            for line in raw_metadata.splitlines():
                if len(key_value_pair := re.split(":", line, maxsplit=1)) > 1:
                    current_key, value = key_value_pair
                    metadata[current_key] = value.lstrip()
                elif re.match(r'^\s*-\s', line) and current_key is not None:
                    metadata[current_key] = metadata[current_key] + f"{re.split(r'^\s*-\s', line)[-1]}, "

        # Parse the Steps recursively Step -> Ingredient -> Quantity
        raw_steps = re.split(r'\n\n', raw_no_metadata.lstrip())
        steps = [Step.parse(step.lstrip()) for step in raw_steps]
        for step in steps:
            if not step.blocks:
                steps.remove(step)

        # using the blocks in the steps, calculate global ingredients
        def add_ingredient_to_global(global_dict, ingredient_object) -> dict[str:Ingredient]:
            if ingredient_object.name in global_dict.keys():
                try:
                    global_dict[ingredient_object.name] += ingredient_object
                except ValueError:
                    new_ingredient_object = copy.deepcopy(ingredient_object)
                    new_ingredient_object.name = f"{ingredient_object.name}({ingredient_object.quantity.unit})"
                    global_dict = add_ingredient_to_global(global_dict, new_ingredient_object)

            else:
                global_dict[ingredient_object.name] = copy.deepcopy(ingredient_object)
            return global_dict

        ingredient_dict = {}
        ingredient_blocks = [item for sublist in [[block.value for block in step.blocks if block.type == "Ingredient"] for step in steps] for item in sublist]
        for ingredient in ingredient_blocks:
            ingredient_dict = add_ingredient_to_global(ingredient_dict, ingredient)

        return Recipe(
            metadata=metadata,
            ingredients=[ingredient_dict[key] for key in ingredient_dict.keys()],
            steps=steps,
        )
