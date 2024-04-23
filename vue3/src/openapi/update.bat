openapi-generator-cli generate -g typescript-fetch -i http://127.0.0.1:8000/openapi/

cd ../../../vue/src/utils/openapi/
openapi-generator-cli generate -g typescript-axios -i http://127.0.0.1:8000/openapi/