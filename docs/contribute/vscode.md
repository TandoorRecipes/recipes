Configurations for debugging django, volar, testing, linting and formatting are all include in the project files.

## Extensions

VSCode can be configured to format and lint on save instead of manually formatting files before submitting a pull request.
To enable auto-formatting and linting install the following extensions in VSCode:

Name: Flake8
Publisher: Microsoft
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=ms-python.flake8

Name: yapf
Publisher: EeyoreLee
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=eeyore.yapf

Name: isort
Publisher: Microsoft
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=ms-python.isort

Name: Vue - Official
Publisher: Vue
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=Vue.volar

Name: Prettier - Code formatter
Publisher: Prettier
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

<!-- prettier-ignore -->
!!! hint
     Adding a comma at the end of a list will trigger yapf to put each element of the list on a new line

## VSCode Tasks

<!-- prettier-ignore -->
!!! note
     In order to hot reload vue, the `yarn dev` server must be started before starting the django server.

There are a number of built in tasks that are available. Here are a few of the key ones:

- `Setup Dev Server` - Runs all the prerequisite steps so that the dev server can be run inside VSCode.
- `Setup Tests` - Runs all prerequisites so tests can be run inside VSCode.

Once these are run, there are 2 options.  If you want to run a vue3 server in a hot reload mode for quick development of the frontend, you should run a development vue server:

- `Yarn Dev` - Runs development Vue.js vite server not connected to VSCode. Useful if you want to make Vue changes and see them in realtime.

If not, you need to build and copy the frontend to the django server.  If you make changes to the frontend, you need to re-run this and restart the django server:

- `Collect Static Files` - Builds and collects the vue3 frontend so that it can be served via the django server.

Once either of those steps are done, you can start the django server:

- `Run Dev Server` - Runs a django development server not connected to VSCode.

There are also a few other tasks specified in case you have specific development needs:

- `Run all pytests` - Runs all the pytests outside of VSCode.
- `Serve Documentation` - Runs a documentation server. Useful if you want to see how changes to documentation show up.
