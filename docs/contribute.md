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

!!! info
    The dev setup is a little messy as this application combines the best (at least in my opinion) of django and Vue.js.

### Django
This application is developed using the Django framework for Python. They have excellent 
[documentation](https://www.djangoproject.com/start/) on how to get started, so I will only give you the basics here.

1. Clone this repository wherever you like and install the Python language for your OS (at least version 3.8)
2. Open it in your favorite editor/IDE (e.g. PyCharm)
    1. If you want, create a virutal environment for all your packages.
3. Install all required packages: `pip install -r requirements.txt`
4. Run the migrations: `python manage.py migrate`
5. Start the development server: `python manage.py runserver`

There is **no** need to set any environment variables. By default, a simple sqlite database is used and all settings are
populated from default values.

### Vue.js
Some of the more complex pages use [Vue.js](https://vuejs.org/) to enhance the frontend. 

In order to work on these pages you will have to install a Javascript package manager of your choice. The following examples use yarn.

Run `yarn install` to install the dependencies. After that you can use `yarn serve` to start the development server
and go ahead and test your changes. Before committing please make sure to pack the source using `yarn build`.

### Pre-Commit
Some checks and scripts can be automatically run using [pre-commit](https://pre-commit.com/).

The scripts are configured in the `pre-commit-config.yaml`. To setup the hooks on your development environment run 
`pre-commit install`.

To manually test all hooks (and ignore if files have changed) use `pre-commit run --all-files`


## Contribute Documentation
The documentation is build from the markdown files in the [docs](https://github.com/vabene1111/recipes/tree/develop/docs)
folder of the GitHub repository. 

!!! warning "Deployment Branch"
    The documentation is currently build from the `develop` branch of the GitHub repository as it is evolving rapidly.
    This will likely change in the future to prevent issues with documentation being released before the features.

In order to contribute to the documentation you can fork the repository and edit the markdown files in the browser.

If you want to test the documentation locally run `mkdocs serve` from the project root.

## Contribute Translations

If you know any foreign languages that is not yet translated feel free to contribute translations.

There is a [transifex project](https://www.transifex.com/django-recipes/django-cookbook/) project where you can get started. 
If you want to contribute a new language or help maintain an already existing one feel free to create a transifex 
account (using the link above) and request to join the project.

!!! warning "Transifex Requests"
    The Team management, language creation and communication on transifex is very difficult for some reason.
    Because of this please have some patience when approving your requests or adding you to a team takes a while.
    Please also not that if you request a language you are not automatically in its translation team and you will
    need to make **an additional request** after I have accepted the language.

It is also possible to provide the translations directly by creating a new language 
using `manage.py makemessages -l <language_code> -i venv`. Once finished, simply open a PR with the changed files. 
