# Cooklang parser forked from on https://github.com/luizribeiro/py-cooklang cooklang.py as of 11/18/25 - MIT License
# Modifications by doylelew

import itertools
import re
from dataclasses import dataclass
from fractions import Fraction
from typing import Mapping, Optional, Sequence, Tuple, Union


@dataclass
class Quantity:
    amount: Union[int, float, Fraction]
    unit: Optional[str] = None

    @classmethod
    def parse(cls, raw) -> "Quantity":
        amount = raw
        unit = ""
        if len(quantity_tokens := re.split(r'%', raw)) == 2:
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
        if type(self.amount) != type(other.amount):  # noqa: E721
            raise ValueError("Cannot add quantities with types " + f"{type(self.amount)} and {type(other.amount)}")
        # pyre-ignore[6]: pyre doesn't refine types on the comparison above
        new_amount = self.amount + other.amount
        if isinstance(new_amount, float):
            new_amount = round(new_amount, 1)
        return Quantity(
            amount=new_amount,
            unit=self.unit,
        )


@dataclass
class Ingredient:
    name: str
    quantity: Optional[Quantity] = None

    @classmethod
    def parse(cls, raw: str) -> "Ingredient":

        def _get_quantity(matches: Sequence[Sequence[str]], ) -> Optional[Quantity]:
            if not matches:
                return None

            match = matches[0]
            amount_as_str = match[0]
            if not amount_as_str:
                return None
            if "." in amount_as_str:
                amount = float(amount_as_str)
            elif "/" in amount_as_str:
                amount = Fraction(amount_as_str)
            else:
                amount = int(amount_as_str)
            unit = str(match[1]) if match[1] else None
            return Quantity(amount, unit)

        name, raw_amount = re.findall(r"^@([^{]+)(?:{([^}]*)})?", raw)[0]
        matches = re.findall(r"([^%}]+)%?([\w]+)?", raw_amount)
        return Ingredient(name, _get_quantity(matches))

    def __add__(self, other: "Ingredient") -> "Ingredient":
        if self.name != other.name:
            raise ValueError(f"Cannot add ingredient {self.name} with {other.name}", )
        return Ingredient(
            name=self.name,
            quantity=Quantity.add_optional(self.quantity, other.quantity),
        )


@dataclass
class Timer:
    ingredient: str
    quantity: int
    unit: str

    @classmethod
    def parse(cls, raw) -> "Timer":
        if len(timer_tokens := re.split(r'[{%]', raw)) < 3:
            raise Exception(f"Cooklang:Recipe:Timer Syntax Error: timers must be in {{num%unit}} format, received {raw}")
        ingredient = timer_tokens[0]
        quantity = timer_tokens[1]
        unit = timer_tokens[2]

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
        return Timer(ingredient=ingredient, quantity=quantity, unit=unit)


@dataclass
class StepIngredient:
    name: str
    quantity: Optional[Quantity] = None

    @classmethod
    def parse(cls, raw: str) -> "StepIngredient":
        ingredient = raw
        quantity = ""
        if len(ingredient_tokens := re.split(r'{', raw)) == 2:
            ingredient = ingredient_tokens[0]
            quantity = ingredient_tokens[1].replace('}', '')

        return StepIngredient(
            name=ingredient,
            quantity=Quantity.parse(quantity),
        )


@dataclass
class Block:
    type: str
    value: Union[str, Ingredient]

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
        def find_arbitrary_termination(current_token, next_token, termination_delimiter) -> tuple[str, list[str]]:
            return_tokens = []
            if next_token != termination_delimiter:
                sub_tokens = re.split(r'(?=[\W\s])([^-])', current_token)
                current_token = sub_tokens.pop(0)
                return_tokens = ["".join(sub_tokens), next_token] + return_tokens
            else:
                current_token += termination_delimiter
            return current_token, return_tokens

        # ensure that the correct terminating delimiter is used
        def find_termination(current_token, next_token, termination_delimiter) -> str:
            if next_token != termination_delimiter:
                raise Exception(f"Cooklang:Recipe:parse Syntax Error: expected terminating delimiter {termination_delimiter}, recieved {next_token}")
            else:
                return current_token

        # asses tokens in order to identify and denote datatypes into blocks
        while token_stream:
            block = Block.new()
            token = token_stream.pop(0)
            stream_return = []
            match token:
                case "@":
                    block.type = "Ingredient"
                    token, stream_return = find_arbitrary_termination(token_stream.pop(0), token_stream.pop(0), '}')
                    block.value = StepIngredient.parse(token)
                case "#":
                    block.type = "Cookware"
                    token, stream_return = find_arbitrary_termination(token_stream.pop(0), token_stream.pop(0), '}')
                    block.value = token
                case "~":
                    block.type = "Timer"
                    token, stream_return = find_arbitrary_termination(token_stream.pop(0), token_stream.pop(0), '}')
                    block.value = Timer.parse(token)
                case "--":
                    block.type = "inline comment"
                    block.value = token_stream.pop(0)
                case "[-":
                    block.type = "block comment"
                    block.value = find_termination(token_stream.pop(0), token_stream.pop(0), '-]')
                case "}":
                    raise Exception("Cooklang:Recipe:parse Syntax Error: stray '}' found with no delimiting '@', '#' or '~'")
                case "-]":
                    raise Exception("Cooklang:Recipe:parse Syntax Error: stray '-]' found with no opening '[-'")
                case _:
                    block.type = "text"
                    block.value = token
            token_stream = stream_return + token_stream
            if block.value != '':
                blocks.append(block)

        return Step(blocks=blocks)


@dataclass
class Recipe:
    metadata: Mapping[str, str]
    # ingredients: Sequence[Ingredient]
    steps: Sequence[Step]

    @classmethod
    def parse(cls, raw: str) -> "Recipe":
        # Remove white space at the end of the document
        raw = re.sub(r'\s+$', '', raw)

        # Separate the Metadata from the rest of the recipe
        raw_metadata = None
        raw_no_metadata = raw
        if len(raw_meta_split := re.split(r'---([\s\S]*?)---\n', raw)) > 1:
            raw_metadata = raw_meta_split[-2]
            raw_no_metadata = raw_meta_split[-1]

        # todo add other metadata syntax identifying method

        # Parse the metadata
        metadata = {}
        meta_lines = raw_metadata.split('\n')
        current_key = None
        for line in meta_lines:
            if len(key_value_pair := line.split(":")) == 2:
                current_key, value = key_value_pair
                metadata[current_key] = value
            elif re.match(r'^\s*-\s', line) and current_key is not None:
                metadata[current_key] = metadata[current_key] + f"{re.split(r'^\s*-\s', line)[-1]}, "

        # Parse the Steps recursively Step -> Ingredient -> Quantity
        raw_steps = re.split(r'\n\n', raw_no_metadata)
        steps = [Step.parse(step) for step in raw_steps]

        for step in steps:
            print(step)

        return Recipe(
            metadata=metadata,
            steps=steps,
        )
