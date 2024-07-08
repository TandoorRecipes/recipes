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
