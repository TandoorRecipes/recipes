If you like this application and want it to improve, feel free to contribute to its development.

!!! success "Contribution List"
    If you help bring this project forward you deserve to be credited for it.
    Feel free to add yourself to `CONTRIBUTERS.md` or message me to add you if you have contributed anything.

## Issues
The most basic but also very important way of contributing is reporting issues and commenting on ideas and feature requests
over at [GitHub issues](https://github.com/vabene1111/recipes/issues).

Without feedback improvement can't happen, so don't hesitate to say what you want to say.

## Contributing Code
If you want to contribute bug fixes or small tweaks then your pull requests are always welcome!

!!! danger "Discuss First!"
    If you want to contribute larger features that introduce more complexity to the project please
    make sure to **first submit a technical description** outlining what and how you want to do it. 
    This allows me and the community to give feedback and manage the complexity of the overall 
    application. If you don't do this please don't be mad if I reject your PR

!!! info
    The dev setup is a little messy as this application combines the best (at least in my opinion) of both Django and Vue.js.

### Devcontainer Setup
There is a [devcontainer](https://containers.dev) set up to ease development.  It is optimized for VSCode, but should be able to
be used by other editors as well.  Once the container is running, you can do things like start a Django dev server, start a Vue.js
dev server, run python tests, etc. by either using the VSCode tasks below, or manually running commands described in the individual
technology sections below.

### VSCode Tasks
If you use VSCode, there are a number of tasks that are available.  Here are a few of the key ones:

* `Setup Dev Server` - Runs all the prerequisite steps so that the dev server can be run inside VSCode.
* `Setup Tests` - Runs all prerequisites so tests can be run inside VSCode.

Once these are run, you should be able to run/debug a django server in VSCode as well as run/debug tests directly through VSCode.
There are also a few other tasks specified in case you have specific development needs:

* `Run Dev Server` - Runs a django development server not connected to VSCode.
* `Run all pytests` - Runs all the pytests outside of VSCode.
* `Yarn Serve` - Runs development Vue.js server not connected to VSCode.  Useful if you want to make Vue changes and see them in realtime.
* `Serve Documentation` - Runs a documentation server.  Useful if you want to see how changes to documentation show up.

### Django
This application is developed using the Django framework for Python. They have excellent 
[documentation](https://www.djangoproject.com/start/) on how to get started, so I will only give you the basics here.

1. Clone this repository wherever you like and install the Python language for your OS (I recommend using version 3.10 or above).
2. Open it in your favorite editor/IDE (e.g. PyCharm).
    a. If you want, create a virtual environment for all your packages.
3. Install all required packages: `pip install -r requirements.txt`.
4. Run the migrations: `python manage.py migrate`.
5. Start the development server: `python manage.py runserver`.

There is **no** need to set any environment variables. By default, a simple SQLite database is used and all settings are
populated from default values.

### Vue.js
Most new frontend pages are build using [Vue.js](https://vuejs.org/). 

In order to work on these pages, you will have to install a Javascript package manager of your choice. The following examples use yarn.

In the `vue` folder run `yarn install` to install the dependencies. After that you can use `yarn serve` to start the development server,
and proceed to test your changes. If you do not wish to work on those pages, but instead want the application to work properly during 
development, run `yarn build` to build the frontend pages once. 

#### API Client
The API Client is generated automatically from the OpenAPI interface provided by the Django REST framework.
For this [openapi-generator](https://github.com/OpenAPITools/openapi-generator) is used.

Install it using your desired setup method. (For example, using `npm install @openapitools/openapi-generator-cli -g`.)

Navigate to `vue/src/utils/openapi`.

Generate the schema using `openapi-generator-cli generate -g typescript-axios -i http://127.0.0.1:8000/openapi/`. (Replace your dev server url if required.)

## Contribute Documentation
The documentation is built from the markdown files in the [docs](https://github.com/vabene1111/recipes/tree/develop/docs)
folder of the GitHub repository.

In order to contribute to the documentation, you can fork the repository and edit the markdown files in the browser.

Now install mkdocs and dependencies: `pip install mkdocs-material mkdocs-include-markdown-plugin`.

If you want to test the documentation, locally run `mkdocs serve` from the project root.

## Contribute Translations

If you know any foreign languages that the project has not been completely translated to yet, feel free to contribute translations.

Translations are managed on [translate.tandoor.dev](https://translate.tandoor.dev/), a self hosted instance of [Weblate](https://weblate.org/de/).

You can simply register an account and then follow these steps to add translations:

1. After registering, you are asked to select your languages. This is optional but allows weblate to only show you relevant translations.
2. In the navigation click on `Projects` and then `Browse all projects`.
3. Select Tandoor and on the top-right hand corner, select `Watch project Tandoor` (click on `Not watching`).
4. Go back to the dashboard. It now shows you the relevant translations for your languages. Click on the pencil icon to get started.

!!! info "Creating a new language"
    To create a new language you must first select Tandoor (the project) and then a component.
    Here you will have the option to add the language. Afterwards you can also simply add it to the other components as well.
    Once a new language is (partially) finished let me know on GitHub so I can add it to the language-switcher in Tandoor itself. 

There is also [a lot of documentation](https://docs.weblate.org/en/latest/user/translating.html) available from Weblate directly.

![2021-04-11_16-03](https://user-images.githubusercontent.com/6819595/114307359-926e0380-9adf-11eb-9a2b-febba56e4d8c.gif)

It is also possible to provide the translations directly by creating a new language 
using `manage.py makemessages -l <language_code> -i venv`. Once finished, simply open a PR with the changed files. This sometimes causes issues merging 
with weblate, so I would prefer the use of weblate.
