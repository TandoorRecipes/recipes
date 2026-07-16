"""AI ingredient-to-step sorting via a compact, identifier-based protocol.

The model returns decisions (ingredient→step assignments, steps to split) keyed by
request-local ids; Tandoor validates them against the original objects and applies them,
so the model never reproduces recipe data. Fabricated ids are fatal; an incomplete
assignment is recovered by re-prompting for the missing ingredients and finally by leaving
any still-unassigned ingredient in its original step. Splitting is a per-step-tolerant
enhancement. All functions take serializer-shaped recipe dicts and do no I/O.
"""

import json
import re
import secrets
import string

from django.utils.text import slugify

ASSIGNMENT_INSTRUCTION = (
    "You are given a recipe as JSON: recipe context, a list of ingredients (each with an id), "
    "and a list of steps (each with an id). Assign each ingredient to "
    "exactly one step: the first step where it is used, choosing the most plausible step from the "
    "recipe context when its use is implicit. Assign every ingredient using the supplied step and "
    "ingredient ids. "
    "Each step should describe a single stage of the cooking, and most recipes are already written "
    "this way. Only when a step is overlong and combines several distinct stages (for example "
    "preparation and then cooking) nominate it in should_split; otherwise leave should_split "
    "empty. Respond with only this JSON: "
    '{"assignments": [{"step": <step id>, "ingredients": [<ingredient id>, ...]}, ...], '
    '"should_split": [<step id>, ...]}. In "assignments" include only steps that have ingredients.'
)

REASSIGNMENT_INSTRUCTION = (
    "Some ingredients were not assigned to any step. For each of the missed ingredient ids listed "
    "below, assign it to the first of the recipe's steps where it is used. Do not include any "
    "other ingredients in your response. Respond with only this JSON: "
    '{"assignments": [{"step": <step id>, "ingredients": [<ingredient id>, ...]}, ...]}.'
)

SPLIT_INSTRUCTION = (
    "You are given steps whose instructions are split into lines, listed in order and each with an "
    "id, plus the ingredients assigned to each step. Divide each step into substeps, where a "
    "substep is a contiguous range of lines covering one stage of the work. "
    "Aim for as few substeps as possible: group related lines together, and start a new substep "
    "only where the work clearly moves to a different stage. "
    "Using the supplied line and ingredient ids, cover every line exactly once, keep the lines in "
    "their original order, and assign each ingredient to the first substep where it is used. "
    'Respond with only this JSON: {"splits": [{"start": <line id>, "stop": <line id>, '
    '"ingredients": [<ingredient id>, ...]}, ...]}.'
)

_SUFFIX_CHARS = 3  # random base36 tail per id; a tripwire against invented/mutated ids
_SUFFIX_ALPHABET = (
    string.digits + string.ascii_lowercase
)  # base36, lowercase (case-safe echo)
_SLUG_WORDS = 2  # readable slug keeps at most this many words of the food name
_SLUG_MAX_CHARS = 24  # backstop against a single pathologically long word
_SLUG_STOPWORDS = frozenset({"of", "and", "the", "with", "for", "in", "a", "an"})
_SENTENCE_RE = re.compile(r"[^.!?]+(?:[.!?]+|$)")


class AiSortError(Exception):
    """An AI sort response failed validation."""

    def __init__(self, check, detail=""):
        self.check = check
        self.detail = detail
        super().__init__(f"{check}: {detail}" if detail else check)


def build_assignment_request(recipe):
    """Build the Call-1 messages and a context of id→object maps.

    Context holds 'steps' (id→step, in recipe order), 'ingredients' (id→ingredient, headers
    excluded), and 'origin' (ingredient id→its original step id, for incomplete-response
    fallback).
    """
    used_ids = set()
    steps, step_map, ingredients, ingredient_map, origin = [], {}, [], {}, {}
    for position, step in enumerate(recipe.get("steps", []), start=1):
        step_id = _make_id(f"s{position}", used_ids)
        step_map[step_id] = step
        steps.append(
            {
                "id": step_id,
                "name": step.get("name", ""),
                "text": step.get("instruction", ""),
            }
        )
        for ingredient in step.get("ingredients", []):
            if ingredient.get("is_header"):
                continue
            ingredient_id = _make_id(_slug(ingredient), used_ids)
            ingredient_map[ingredient_id] = ingredient
            origin[ingredient_id] = step_id
            ingredients.append(
                {"id": ingredient_id, "text": _render_ingredient(ingredient)}
            )
    payload = {
        "recipe": _recipe_context(recipe),
        "ingredients": ingredients,
        "steps": steps,
    }
    context = {"steps": step_map, "ingredients": ingredient_map, "origin": origin}
    return build_messages(payload, ASSIGNMENT_INSTRUCTION), context


def build_messages(payload, instruction):
    """Build a single-user-message request body: the instruction plus the JSON payload."""
    return [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": instruction},
                {"type": "text", "text": json.dumps(payload, ensure_ascii=False)},
            ],
        }
    ]


def build_reassignment_messages(messages, prior_response, missing_ids):
    """Extend the original messages with the model's prior answer and a request for missing ids.

    Replaying the original prefix lets providers reuse a cached prompt; the appended turns ask
    only for the ingredients still unassigned.
    """
    return messages + [
        {
            "role": "assistant",
            "content": json.dumps(prior_response, ensure_ascii=False),
        },
        {
            "role": "user",
            "content": f"{REASSIGNMENT_INSTRUCTION}\n\nUnassigned ingredient ids: {', '.join(missing_ids)}",
        },
    ]


def check_assignment(response, context):
    """Return {step_id: [ingredient_id, ...]} with each ingredient assigned to one step.

    Fatal (raises AiSortError): unknown step or ingredient id, or malformed shape — the model
    inventing data. Tolerated: an ingredient listed under more than one step (kept in the first,
    since assignment is one-to-one), a step listed more than once (merged), and steps or
    ingredients omitted entirely (handled by the retry and fallback in apply_assignments). Also
    validates should_split ids as fatal.
    """
    step_ids, ingredient_ids = set(context["steps"]), set(context["ingredients"])
    by_step, seen = {}, set()
    for entry in _require_list(response, "assignments"):
        step_id = entry.get("step")
        if step_id not in step_ids:
            raise AiSortError("unknown step id", step_id)
        placed = by_step.setdefault(step_id, [])
        for ingredient_id in _require_list(entry, "ingredients"):
            if ingredient_id not in ingredient_ids:
                raise AiSortError("unknown ingredient id", ingredient_id)
            if ingredient_id not in seen:
                seen.add(ingredient_id)
                placed.append(ingredient_id)
    for step_id in _split_ids(response):
        if step_id not in step_ids:
            raise AiSortError("unknown step id in should_split", step_id)
    return by_step


def missing_ingredients(by_step, context):
    """Return ingredient ids that no step's assignment covers, in stable input order."""
    assigned = {i for ids in by_step.values() for i in ids}
    return [i for i in context["ingredients"] if i not in assigned]


def merge_assignments(base, extra):
    """Merge two {step_id: [ingredient_id]} maps; each ingredient stays in its first step."""
    merged = {step_id: list(ids) for step_id, ids in base.items()}
    seen = {i for ids in merged.values() for i in ids}
    for step_id, ids in extra.items():
        target = merged.setdefault(step_id, [])
        for ingredient_id in ids:
            if ingredient_id not in seen:
                seen.add(ingredient_id)
                target.append(ingredient_id)
    return merged


def apply_assignments(recipe, by_step, context):
    """Return (recipe copy, completed by_step) with each step's non-header ingredients set.

    Any ingredient absent from `by_step` is left in its original step, so an incomplete model
    response never loses ingredients; the returned map reflects this completion.
    """
    by_step = {step_id: list(ids) for step_id, ids in by_step.items()}
    for ingredient_id in missing_ingredients(by_step, context):
        by_step.setdefault(context["origin"][ingredient_id], []).append(ingredient_id)
    ingredient_map = context["ingredients"]
    recipe = dict(recipe)
    recipe["steps"] = [
        _reassign_step(step, by_step.get(step_id, []), ingredient_map)
        for step_id, step in zip(context["steps"], recipe.get("steps", []))
    ]
    return recipe, by_step


def build_split_request(should_split, by_step, context):
    """Build the Call-2 payload and split_context {step_id: {'step', 'lines', 'ingredients'}}.

    `by_step` is the completed assignment from apply_assignments; `should_split` the step ids
    to split. `lines` is [(line_id, text), ...]; validate/apply recover a line's step via
    _line_to_step over this split_context.
    """
    used_ids = set(context["steps"]) | set(context["ingredients"])
    steps, split_context = [], {}
    for step_id in should_split:
        step = context["steps"][step_id]
        sentences = [
            s.strip()
            for s in _SENTENCE_RE.findall(step.get("instruction", ""))
            if s.strip()
        ]
        step_slug = step_id.rsplit("_", 1)[0]  # "s2" from "s2_ce41"
        lines = [
            (_make_id(f"{step_slug}.l{n}", used_ids), text)
            for n, text in enumerate(sentences, start=1)
        ]
        ingredient_ids = by_step.get(step_id, [])
        steps.append(
            {
                "id": step_id,
                "lines": [{"id": line_id, "text": text} for line_id, text in lines],
                "ingredients": [
                    {"id": i, "text": _render_ingredient(context["ingredients"][i])}
                    for i in ingredient_ids
                ],
            }
        )
        split_context[step_id] = {
            "step": step,
            "lines": lines,
            "ingredients": {i: context["ingredients"][i] for i in ingredient_ids},
        }
    return {"steps": steps}, split_context


def validate_splits(response, split_context):
    """Return the set of step ids whose substeps tile their lines and cover their ingredients exactly once."""
    line_to_step = _line_to_step(split_context)
    grouped = {}
    for substep in _require_list(response, "splits"):
        start, stop = substep.get("start"), substep.get("stop")
        step_id = line_to_step.get(start)
        if step_id is None or step_id != line_to_step.get(stop):
            continue
        grouped.setdefault(step_id, []).append(
            (start, stop, substep.get("ingredients", []))
        )
    return {
        step_id
        for step_id, substeps in grouped.items()
        if _splits_ok(substeps, split_context[step_id])
    }


def apply_splits(recipe, response, split_context, valid_step_ids, step_ids):
    """Return a recipe copy with valid split steps replaced by renumbered substeps.

    `step_ids` are the recipe-ordered step ids (context['steps'] keys), matched positionally.
    """
    line_to_step = _line_to_step(split_context)
    substeps_by_step = {}
    for substep in response["splits"]:
        step_id = line_to_step.get(substep["start"])
        if step_id in valid_step_ids:
            substeps_by_step.setdefault(step_id, []).append(substep)
    result = []
    for step_id, step in zip(step_ids, recipe.get("steps", [])):
        if step_id in substeps_by_step:
            result.extend(
                _materialise_substeps(
                    step, substeps_by_step[step_id], split_context[step_id]
                )
            )
        else:
            result.append(step)
    for order, step in enumerate(result):
        step["order"] = order
    recipe = dict(recipe)
    recipe["steps"] = result
    return recipe


def _recipe_context(recipe):
    return {
        "name": recipe.get("name", ""),
        "description": recipe.get("description", ""),
        "keywords": [k.get("name", "") for k in recipe.get("keywords", [])],
    }


def _render_ingredient(ingredient):
    """Plain-text render: original_text if present, else amount+unit+food, note."""
    if ingredient.get("original_text"):
        return ingredient["original_text"]
    parts = []
    if ingredient.get("amount") and not ingredient.get("no_amount"):
        parts.append(_format_amount(ingredient["amount"]))
    if ingredient.get("unit"):
        parts.append(ingredient["unit"].get("name", ""))
    if ingredient.get("food"):
        parts.append(ingredient["food"].get("name", ""))
    text = " ".join(p for p in parts if p)
    note = ingredient.get("note")
    return f"{text}, {note}" if note else text


def _format_amount(amount):
    """Format an amount without a trailing .0; pass non-numeric values through unchanged."""
    try:
        return f"{float(amount):g}"
    except (TypeError, ValueError):
        return str(amount)


def _slug(ingredient):
    """Short readable id stem: the first informative words of the food name, length-capped.

    Numbers, single characters, and common filler words are skipped so the stem carries the
    identifying part of the name (e.g. "cream of tartar" -> "cream-tartar").
    """
    food = ingredient.get("food") or {}
    words = [
        w
        for w in slugify(food.get("name", "")).split("-")
        if len(w) > 1 and not w.isdigit() and w not in _SLUG_STOPWORDS
    ]
    base = "-".join(words[:_SLUG_WORDS])[:_SLUG_MAX_CHARS].strip("-")
    return base or "ingredient"


def _make_id(readable, used_ids):
    """Return a unique `<readable>_<suffix>` id; the random suffix is a hallucination tripwire."""
    while True:
        suffix = "".join(secrets.choice(_SUFFIX_ALPHABET) for _ in range(_SUFFIX_CHARS))
        candidate = f"{readable}_{suffix}"
        if candidate not in used_ids:
            used_ids.add(candidate)
            return candidate


def _split_ids(response):
    ids = response.get("should_split", [])
    if not isinstance(ids, list):
        raise AiSortError("should_split not a list")
    if len(ids) != len(set(ids)):
        raise AiSortError("duplicate in should_split")
    return ids


def _require_list(container, key):
    value = container.get(key)
    if not isinstance(value, list):
        raise AiSortError(f"{key} missing or not a list")
    return value


def _reassign_step(step, assigned_ids, ingredient_map):
    headers = [ing for ing in step.get("ingredients", []) if ing.get("is_header")]
    step = dict(step)
    step["ingredients"] = headers + [ingredient_map[i] for i in assigned_ids]
    return step


def _line_to_step(split_context):
    """Map each line id to its parent step id, from the lines recorded in split_context."""
    return {
        line_id: step_id
        for step_id, ctx in split_context.items()
        for line_id, _ in ctx["lines"]
    }


def _splits_ok(substeps, ctx):
    if len(substeps) < 2:
        return False  # a single substep is a no-op, not a split
    line_ids = [line_id for line_id, _ in ctx["lines"]]
    order = {line_id: n for n, line_id in enumerate(line_ids)}
    covered_lines, covered_ings = [], []
    for start, stop, ingredient_ids in substeps:
        if start not in order or stop not in order or order[start] > order[stop]:
            return False
        covered_lines.extend(range(order[start], order[stop] + 1))
        covered_ings.extend(ingredient_ids)
    if sorted(covered_lines) != list(range(len(line_ids))):
        return False  # gap or overlap
    return sorted(covered_ings) == sorted(ctx["ingredients"])


def _materialise_substeps(step, substeps, ctx):
    text_of = dict(ctx["lines"])
    order = {line_id: n for n, (line_id, _) in enumerate(ctx["lines"])}
    ordered = sorted(substeps, key=lambda s: order[s["start"]])
    headers = [ing for ing in step.get("ingredients", []) if ing.get("is_header")]
    new_steps = []
    for index, substep in enumerate(ordered):
        span = [
            l
            for l in order
            if order[substep["start"]] <= order[l] <= order[substep["stop"]]
        ]
        instruction = " ".join(text_of[l] for l in sorted(span, key=lambda l: order[l]))
        new_step = dict(step)
        new_step["instruction"] = instruction
        new_step["ingredients"] = (headers if index == 0 else []) + [
            ctx["ingredients"][i] for i in substep["ingredients"]
        ]
        new_step.pop("id", None)  # materialised as new rows on save
        new_steps.append(new_step)
    return new_steps
