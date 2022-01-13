If you like this application and want it to improve, feel free to contribute to its development.

!!! success "Contribution List"
    If you help bring this project forward you deserve to be credited for it.
    Feel free to add yourself to `CONTRIBUTERS.md` or message me to add you if you have contributed anything.

## Issues
The most basic but also very important way of contributing is reporting issues and commenting on ideas and feature requests
over on the [GitHub issues](https://github.com/vabene1111/recipes/issues).

Without Feedback improvement can't happen, so don't hesitate to say what you want to say.

## Contributing Code
Code contributions are always welcome. There is no special rules for what you need to do, 
just do your best and we will work together to get your idea and code merged into the project.

You may want to run "python manage.py collectstatic" and then "pytest" to make sure all unit tests are still working. 

!!! info
    The dev setup is a little messy as this application combines the best (at least in my opinion) of django and Vue.js.

### Django
This application is developed using the Django framework for Python. They have excellent 
[documentation](https://www.djangoproject.com/start/) on how to get started, so I will only give you the basics here.

1. Clone this repository wherever you like and install the Python language for your OS (at least version 3.8)
2. Open it in your favorite editor/IDE (e.g. PyCharm) or plain command prompt
    1. If you want, create a virtual environment for all your packages.
3. Install all required packages: `pip install -r requirements.txt`
    1. On Windows you may be asked you to install the [Buildtools für Visual Studio 2022](https://visualstudio.microsoft.com/de/downloads/) to build some of the requied modules. In "Visual Studio Installer" you have to select "Desktopdevelopment with C++" for this.
	2. If it complains about missing 'lber.h', you may want to replace "django-auth-ldap" and "python-ldap" in requirements.txt with "django-python3-ldap" instead of building the required OpenLDAP.
4. Run the migrations: `python manage.py migrate`
5. Start the development server: `python manage.py runserver`
6. Keep this console open and go on with the next chapter "Vue.js"

There is **no** need to set any environment variables. By default, a simple sqlite database is used and all settings are
populated from default values.

### Vue.js
Some of the more complex pages use [Vue.js](https://vuejs.org/) to enhance the frontend. 

In order to work on these pages you will have to install a Javascript package manager of your choice. The following examples use yarn. To [install yarn](https://classic.yarnpkg.com/lang/en/docs/install), you need [Node.js](https://nodejs.org/en/download/current/) first.

1. Open a shell in the "vue" subdirectory
2. Run `yarn install` to install the dependencies.
    1. if you get an error "ERR_OSSL_EVP_UNSUPPORTED", run "export NODE_OPTIONS=--openssl-legacy-provider"(Unix) or "set NODE_OPTIONS=--openssl-legacy-provider"(Windows)
3. After that you can use `yarn serve` to start the development server and go ahead and test your changes. 

Before committing please make sure to pack the source using `yarn build`.

#### API Client
The API Client is generated automatically from the openapi interface provided by the django rest framework.
For this [openapi-generator](https://github.com/OpenAPITools/openapi-generator) is used.

Install it using your desired setup method (for example using `npm install @openapitools/openapi-generator-cli -g`).

Navigate to `vue/src/utils/openapi`.

Generate the schema using `openapi-generator-cli generate -g typescript-axios -i http://127.0.0.1:8000/openapi/` (replace your dev server url if required)

## Contribute Documentation
The documentation is build from the markdown files in the [docs](https://github.com/vabene1111/recipes/tree/develop/docs)
folder of the GitHub repository. 

!!! warning "Deployment Branch"
    The documentation is currently build from the `develop` branch of the GitHub repository as it is evolving rapidly.
    This will likely change in the future to prevent issues with documentation being released before the features.

In order to contribute to the documentation you can fork the repository and edit the markdown files in the browser.

Now install mkdocs and dependencies: `pip install mkdocs-material mkdocs-include-markdown-plugin`.

If you want to test the documentation locally run `mkdocs serve` from the project root.

## Contribute Translations

If you know any foreign languages that is not yet translated feel free to contribute translations.

Translations are managed on [translate.tandoor.dev](https://translate.tandoor.dev/), a self hosted instance of [Weblate](https://weblate.org/de/).

!!! info "Weblate functionality"
    Translations have only recently been migrated to weblate so I do not 100% understand each feature.
    Please feel free to contact me if you need any help getting started.

You can simply register an account and then follow these steps to add translations:

1. After registering you are asked to select your languages. This is optional but allows weblate to only show you relevant translations
2. In the navigation click on `Projects` and then `Browse all projects`
3. Select Tandoor and on the top right hand corner select `Watch project Tandoor` (click on `Not watching`)
4. Go back to the dashboard. It now shows you the relevant translations for your languages. Click the pencil icon to get started.

!!!! info "Creating a new languagte"
    To create a new language you must first select Tandoor (the project) and then a component.
    Here you will have the option to add the language. Afterwards you can also simply add it to the other components as well.

There is also [a lot of documentation](https://docs.weblate.org/en/latest/user/translating.html) available from Weblate directly.

![2021-04-11_16-03](https://user-images.githubusercontent.com/6819595/114307359-926e0380-9adf-11eb-9a2b-febba56e4d8c.gif)

It is also possible to provide the translations directly by creating a new language 
using `manage.py makemessages -l <language_code> -i venv`. Once finished, simply open a PR with the changed files. 
