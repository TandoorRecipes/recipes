import os
import shutil
import subprocess
import sys
from pathlib import Path

from recipes.settings import BASE_DIR

TANDOOR_CLIENT_API_PATH = os.path.join(BASE_DIR, "vue3/src/openapi")
ALLAUTH_CLIENT_API_PATH = os.path.join(BASE_DIR, "vue3/src/authapi")


def clean_old_file():
    DELETE_PATHS = ["apis", "models", "index.ts", ".openapi-generator"]
    for path in DELETE_PATHS:
        path = Path(path)
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()


os.chdir(TANDOOR_CLIENT_API_PATH)
clean_old_file()
# generate base API client for all models
subprocess.run('openapi-generator-cli generate -g typescript-fetch -i http://127.0.0.1:8000/openapi/ -t templates  --global-property apiDocs=false,modelDocs=false', shell=True,
               check=True)

# for allauth api
os.chdir(ALLAUTH_CLIENT_API_PATH)
clean_old_file()
# generate base API client for all models
subprocess.run(
    f'openapi-generator-cli generate -g typescript-fetch -i http://127.0.0.1:8000/_allauth/openapi.yaml -o {ALLAUTH_CLIENT_API_PATH}  --global-property apiDocs=false,modelDocs=false',
    shell=True, check=True)

sys.exit(0)
