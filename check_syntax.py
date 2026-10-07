import ast
import os

errors = []
for root, dirs, files in os.walk('cookbook'):
    # skip venv and hidden dirs
    dirs[:] = [d for d in dirs if d not in ('venv', '.git', '__pycache__', 'node_modules')]
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(root, f)
            try:
                with open(path, encoding='utf-8') as fh:
                    ast.parse(fh.read())
            except SyntaxError as e:
                errors.append((path, e.lineno, str(e)))

if errors:
    print(f"Found {len(errors)} syntax error(s):")
    for path, lineno, msg in errors:
        print(f"  {path}:{lineno} -> {msg}")
else:
    print("No syntax errors found!")
