import json
import os
import sys
from urllib.request import urlretrieve


os.chdir('vue3/src/openapi')

# generate base API client for all models
os.system('openapi-generator-cli generate -g typescript-fetch -t templates -i http://127.0.0.1:8000/openapi/')

sys.exit(0)

# TODO this code was written as a test and commited for archiving
# TODO it is currently not used because the generator creates interfaces not classes, thus cannot be annotated by functions

# get the latest template from openapi generator and tell it to include the custom model functions
with open('openapitools.json','r') as f:
    openapi_tools_config = json.loads(f.read())

TEMPLATE_URL = f'https://raw.githubusercontent.com/OpenAPITools/openapi-generator/refs/tags/v{openapi_tools_config['generator-cli']['version']}/modules/openapi-generator/src/main/resources/typescript-fetch/modelGeneric.mustache'
TEMPLATE_FILE_NAME = 'templates/modelGeneric.mustache'
OVERRIDE_FILE_NAME = 'templates/customModelFunctions.mustache'

urlretrieve(TEMPLATE_URL, TEMPLATE_FILE_NAME)

with open(TEMPLATE_FILE_NAME, 'a') as template_file, open(OVERRIDE_FILE_NAME, 'r') as override_file:
    template_file.write(override_file.read())

# generate API client with custom template for specified models
MODELS = ['Keyword', 'Food']

os.system(f'openapi-generator-cli generate -g typescript-fetch -t templates -i http://127.0.0.1:8000/openapi/ --global-property models={':'.join(MODELS)}')