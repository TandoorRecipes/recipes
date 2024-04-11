If you want to contribute bug fixes or small tweaks then your pull requests are always welcome!

!!! danger "Discuss First!"
If you want to contribute larger features that introduce more complexity to the project please
make sure to **first submit a technical description** outlining what and how you want to do it.
This allows me and the community to give feedback and manage the complexity of the overall
application. If you don't do this please don't be mad if I reject your PR.

## License

Contributing to Tandoor requires signing a Contributor License Agreement. You can review the CLA [here](https://cla-assistant.io/TandoorRecipes/recipes).

## Linting & Formatting

Tandoor uses a number of libraries to maintain style and formatting consistency.
To contribute to the project you are required to use the following packages with the project defined configurations:

- flake8
- yapf
- isort
- prettier

!!! tip "Manual Formatting"
    It is possible to run formatting manually, but it is recommended to setup your IDE to format on save.
    ``` bash
    flake8 file.py --ignore=E501 | isort -q file.py | yapf -i file.py
    prettier --write file.vue
    ```

## Testing
Django uses pytest-django to implement a full suite of testing.  If you make any functional changes, please implment the appropriate
tests.

Tandoor is also actively soliciting contribors willing to setup vue3 testing.  If you have knowledge in this area it would be greatly appreciated.

## API Client

Tandoor uses [django-rest-framework](https://www.django-rest-framework.org/) for API implementation.  Making contributions that impact the API requires an understanding of
Viewsets and Serializers.  

Also double check that your changes are actively reflected in the schema so that client apis are generated accurately.

The API Client is generated automatically from the OpenAPI interface provided by the Django REST framework.
For this [openapi-generator](https://github.com/OpenAPITools/openapi-generator) is used.

Install it using your desired setup method. (For example, using `npm install @openapitools/openapi-generator-cli -g`.)

### Vue

Navigate to `vue/src/utils/openapi`.

Generate the schema using `openapi-generator-cli generate -g typescript-axios -i http://127.0.0.1:8000/openapi/`. (Replace your dev server url if required.)

### Vue3

Navigate to `vue3/src/openapi`.

Generate the schema using `openapi-generator-cli generate -g typescript-fetch -i http://127.0.0.1:8000/openapi/`. (Replace your dev server url if required.)

## Install and Configuration

Instructions for [VSCode](/contribute/vscode)
Instructions for [PyCharm](/contribute/pycharm)
