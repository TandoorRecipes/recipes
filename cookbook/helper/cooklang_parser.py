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
    quantity: int
    unit: str

    @classmethod
    def parse(cls, raw):
        return Timer(quantity=1, unit="Minutes")


@dataclass
class StepIngredient:
    name: str
    quantity: Optional[Quantity] = None

    @classmethod
    def parse(cls, raw: str) -> "StepIngredient":
        return StepIngredient(
            name=raw,
            quantity=Quantity(amount=1, unit="None"),
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
        blocks = []
        token_stream = re.split(r'([@#\)}~])', raw)
        print(token_stream)

        def find_termination(current_token, next_token) -> tuple[str, list[str]]:
            return_tokens = []
            if next_token != '}':
                sub_tokens = re.split(r'\W\s', current_token)
                current_token = sub_tokens.pop(0)
                return_tokens = ["".join(sub_tokens), next_token] + return_tokens
            else:
                current_token += "}"
            return current_token, return_tokens

        while token_stream:
            block = Block.new()
            token = token_stream.pop(0)
            stream_return = []
            match token:
                case "@":
                    block.type = "Ingredient"
                    token, stream_return = find_termination(token_stream.pop(0), token_stream.pop(0))
                    block.value = StepIngredient.parse(token)
                case "#":
                    block.type = "Cookware"
                    token, stream_return = find_termination(token_stream.pop(0), token_stream.pop(0))
                    block.value = token
                case "~":
                    block.type = "Timer"
                    token, stream_return = find_termination(token_stream.pop(0), token_stream.pop(0))
                    block.value = Timer.parse(token)
                case "}":
                    raise Exception("Syntax Error: stray '}' found")
                case _:
                    block.type = "text"
                    block.value = token
            token_stream = stream_return + token_stream
            blocks.append(block)

        return Step(blocks=blocks)


@dataclass
class Recipe:
    metadata: Mapping[str, str]
    # ingredients: Sequence[Ingredient]
    steps: Sequence[Step]

    @classmethod
    def parse(cls, raw: str) -> "Recipe":

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
        print(steps)

        return Recipe(
            metadata=metadata,
            steps=steps,
        )
