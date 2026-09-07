import os
import shutil
import subprocess
import sys
from pathlib import Path

from recipes.settings import BASE_DIR

os.chdir(os.path.join(BASE_DIR, "vue3/src/openapi"))

DELETE_PATHS = ["apis", "models", "index.ts", ".openapi-generator"]
for path in DELETE_PATHS:
    path=Path(path)
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()

# generate base API client for all models
subprocess.run('openapi-generator-cli generate -g typescript-fetch -i http://127.0.0.1:8000/openapi/ -t templates  --global-property apiDocs=false,modelDocs=false',  shell=True, check=True)

sys.exit(0)