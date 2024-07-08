!!! info
The dev setup is a little messy as this application combines the best (at least in my opinion) of both Django and Vue.js.

### Devcontainer Setup

There is a [devcontainer](https://containers.dev) set up to ease development. It is optimized for VSCode, but should be able to
be used by other editors as well. Once the container is running, you can do things like start a Django dev server, start a Vue.js
dev server, run python tests, etc. by either using the VSCode tasks below, or manually running commands described in the individual
technology sections below.

In VSCode, simply check out the git repository, and then via the command palette, choose `Dev Containers: Reopen in container`.

If you need to change python dependencies (requierments.txt) or OS packages, you will need to rebuild the container. If you are
changing OS package requirements, you will need to update both the main `Dockerfile` and the `.devcontainer/Dockerfile`.

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
