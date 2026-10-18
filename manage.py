#!/usr/bin/env python
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

def load_environment_variables() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

if __name__ == '__main__':
    if not os.getenv('SECRET_KEY'):
        load_environment_variables()

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
