#!/usr/bin/env python3
"""
Generate typed test factories from the OpenAPI schema.

Reads vue3/src/openapi/openapi.json (YAML format despite the name),
generates vue3/src/__tests__/factories.generated.ts with:
  - make*()         — happy path with sensible defaults for all fields
  - makeMinimal*()  — only required fields, optionals undefined
  - makeEdgeCase*() — nulls where nullable, empty arrays, 0 for numbers

Run after regenerating the OpenAPI client:
  conda run -n tandoor python generate_api_client.py
  python vue3/scripts/generate-test-factories.py

Or integrate into generate_api_client.py.
"""

import yaml
import sys
import os
from pathlib import Path
from collections import OrderedDict

SCHEMA_PATH = Path(__file__).parent.parent / "src" / "openapi" / "openapi.json"
OUTPUT_PATH = Path(__file__).parent.parent / "src" / "__tests__" / "factories.generated.ts"

# Models to skip (wrappers, not directly useful as test data)
SKIP_PREFIXES = ("Patched", "Paginated")
# Models used by the frontend (generate only these to keep output focused)
# Empty = generate all
ONLY_MODELS = set()


def load_schema():
    with open(SCHEMA_PATH) as f:
        return yaml.safe_load(f)


def resolve_ref(ref: str) -> str:
    """Extract model name from $ref like '#/components/schemas/Food'"""
    return ref.split("/")[-1]


def ts_type_for_prop(prop: dict, schemas: dict) -> str:
    """Return TypeScript type string for a property."""
    if "$ref" in prop:
        return resolve_ref(prop["$ref"])
    t = prop.get("type", "any")
    if t == "integer" or t == "number":
        return "number"
    if t == "string":
        return "string"
    if t == "boolean":
        return "boolean"
    if t == "array":
        items = prop.get("items", {})
        if "$ref" in items:
            return f"Array<{resolve_ref(items['$ref'])}>"
        return f"Array<{ts_type_for_prop(items, schemas)}>"
    if t == "object":
        return "Record<string, any>"
    return "any"


def default_value(name: str, prop: dict, schemas: dict, mode: str = "happy") -> str:
    """
    Generate a default value for a property.
    mode: 'happy' = sensible defaults, 'minimal' = bare minimum, 'edge' = boundary values
    """
    nullable = prop.get("nullable", False)
    is_readonly = prop.get("readOnly", False)

    if mode == "edge" and nullable:
        return "null"

    if "$ref" in prop:
        ref_name = resolve_ref(prop["$ref"])
        # Check if it's an enum
        ref_schema = schemas.get(ref_name, {})
        if "enum" in ref_schema:
            enum_values = ref_schema["enum"]
            if mode == "edge":
                return f"'{enum_values[-1]}' as any"
            return f"'{enum_values[0]}' as any"
        # It's a nested model
        if mode == "minimal":
            return f"undefined as any"
        if mode == "edge":
            return f"makeMinimal{ref_name}()"
        return f"make{ref_name}()"

    t = prop.get("type", "any")

    if t == "integer" or t == "number":
        if mode == "edge":
            return "0"
        if "id" in name.lower():
            return "1"
        if "count" in name.lower() or "num" in name.lower():
            return "0"
        if "amount" in name.lower():
            return "1"
        if "order" in name.lower():
            return "0"
        return "0"

    if t == "string":
        if mode == "edge":
            return "''"
        if "name" in name.lower():
            return f"'Test {name}'"
        if "date" in name.lower() or "created" in name.lower() or "updated" in name.lower():
            return None  # Will be handled as Date
        if "url" in name.lower() or "link" in name.lower():
            return "'https://example.com'"
        if "email" in name.lower():
            return "'test@example.com'"
        return "''"

    if t == "boolean":
        if mode == "edge":
            return "false"
        return "false"

    if t == "array":
        if mode == "edge" or mode == "minimal":
            return "[]"
        return "[]"

    if t == "object":
        return "{}"

    return "undefined as any"


def is_date_field(name: str, prop: dict) -> bool:
    """Check if a string field is actually a date/datetime."""
    fmt = prop.get("format", "")
    return fmt in ("date", "date-time") or "date" in name.lower() or name in (
        "created_at", "updated_at", "created", "updated", "expires"
    )


def snake_to_camel(name: str) -> str:
    """Convert snake_case to camelCase."""
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def generate_factory(name: str, schema: dict, schemas: dict, mode: str) -> list[str]:
    """Generate a single factory function."""
    props = schema.get("properties", {})
    required = set(schema.get("required", []))

    if not props:
        return []

    prefix = {"happy": "make", "minimal": "makeMinimal", "edge": "makeEdgeCase"}[mode]
    ts_name = f"{prefix}{name}"
    lines = []

    lines.append(f"export function {ts_name}(overrides: Partial<{name}> = {{}}): {name}" + " {")
    lines.append("    return {")

    for prop_name, prop in props.items():
        camel = snake_to_camel(prop_name)
        nullable = prop.get("nullable", False)

        # In minimal mode, skip optional fields — but always include `id`
        # since it's present in every API response (only optional for create requests)
        if mode == "minimal" and prop_name not in required and prop_name != "id":
            continue

        # Generate value
        if is_date_field(prop_name, prop):
            if mode == "edge" and nullable:
                val = "null"
            elif mode == "edge":
                val = "new Date(0)"
            else:
                val = "new Date('2026-01-01T00:00:00Z')"
        elif nullable and mode == "edge":
            val = "null"
        else:
            val = default_value(prop_name, prop, schemas, mode)

        if val is None:
            val = "new Date('2026-01-01T00:00:00Z')"

        lines.append(f"        {camel}: {val},")

    lines.append("        ...overrides,")
    lines.append("    } as " + name)
    lines.append("}")
    lines.append("")

    return lines


def generate_all(schema_data: dict) -> str:
    schemas = schema_data["components"]["schemas"]

    # Separate enums from models
    enums = {k: v for k, v in schemas.items() if "enum" in v}
    models = OrderedDict()
    for k, v in sorted(schemas.items()):
        if k in enums:
            continue
        if any(k.startswith(p) for p in SKIP_PREFIXES):
            continue
        if ONLY_MODELS and k not in ONLY_MODELS:
            continue
        if not v.get("properties"):
            continue
        models[k] = v

    # Build import list
    model_names = list(models.keys())

    lines = []
    lines.append("/**")
    lines.append(" * AUTO-GENERATED test factories from OpenAPI schema.")
    lines.append(" * Do not edit manually — regenerate with:")
    lines.append(" *   python vue3/scripts/generate-test-factories.py")
    lines.append(" *")
    lines.append(" * Three variants per model:")
    lines.append(" *   make*()         — happy path defaults for all fields")
    lines.append(" *   makeMinimal*()  — only required fields")
    lines.append(" *   makeEdgeCase*() — nulls, empty arrays, zeros")
    lines.append(" */")
    lines.append("")
    lines.append("import type {")

    # Import all model types
    for i, name in enumerate(model_names):
        comma = "," if i < len(model_names) - 1 else ""
        lines.append(f"    {name}{comma}")

    lines.append("} from '@/openapi'")
    lines.append("")

    # Forward declarations for circular references
    lines.append("// Forward declarations to handle circular references")
    lines.append("// Each factory uses lazy calls to nested factories")
    lines.append("")

    # Generate factories
    for name, schema in models.items():
        for mode in ("happy", "minimal", "edge"):
            factory_lines = generate_factory(name, schema, schemas, mode)
            lines.extend(factory_lines)

    return "\n".join(lines) + "\n"


def main():
    if not SCHEMA_PATH.exists():
        print(f"Schema not found at {SCHEMA_PATH}", file=sys.stderr)
        sys.exit(1)

    schema_data = load_schema()
    output = generate_all(schema_data)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        f.write(output)

    # Count what was generated
    happy = output.count("export function make")
    minimal = output.count("export function makeMinimal")
    edge = output.count("export function makeEdgeCase")
    total = happy + minimal + edge
    models = happy - minimal  # happy includes makeMinimal prefix matches

    print(f"Generated {OUTPUT_PATH}")
    print(f"  {happy - minimal - edge} models × 3 variants = {total} factory functions")


if __name__ == "__main__":
    main()
