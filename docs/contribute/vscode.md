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

There are a number of built in tasks that are available. Here are a few of the key ones:

-   `Setup Dev Server` - Runs all the prerequisite steps so that the dev server can be run inside VSCode.
-   `Setup Tests` - Runs all prerequisites so tests can be run inside VSCode.

Once these are run, you should be able to run/debug a django server in VSCode as well as run/debug tests directly through VSCode.
There are also a few other tasks specified in case you have specific development needs:

-   `Run Dev Server` - Runs a django development server not connected to VSCode.
-   `Run all pytests` - Runs all the pytests outside of VSCode.
-   `Yarn Serve` - Runs development Vue.js server not connected to VSCode. Useful if you want to make Vue changes and see them in realtime.
-   `Serve Documentation` - Runs a documentation server. Useful if you want to see how changes to documentation show up.
