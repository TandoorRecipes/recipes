!!! danger
    The version containing Templating is not yet released! This documentation is only to illustrate the pending changes
    facilitate the discussion.

With the Version `0.14.0` support for using a custom Jinja2 Template in recipe step instructions has been added.

This allows you to write ingredients with their corresponding amount directly inside the text while still profiting
from recipe scaling.

![2021-01-05_22-26](https://user-images.githubusercontent.com/6819595/103701386-3e1a2b80-4fa6-11eb-93d1-6257e65bb5b1.gif)

!!! info
    Templating is a very new feature and still WIP. Feel free to open an issue to provide feedback and ideas.
    Please also refer to [Issue #218](https://github.com/vabene1111/recipes/issues/218) where this feature has been discussed.

## Using Templating
Currently the only available variable in the Templating context is `ingredients`.

`ingredients` is an array that contains all ingredients of the current recipe step. You can access an ingredient by using
`{{ ingredients[<index in list>] }}` where the index refers to the position in the list of ingredients starting with zero.
You can also use the interaction menu of the ingredient to copy its reference.

!!! warning
    Please note that changing the order of the ingredients will break the reference (or at least make it useless).
    See the technical reasoning for more information on why it is this way.

![image](https://user-images.githubusercontent.com/6819595/103709654-5d6b8580-4fb3-11eb-9d04-36ab5a993f90.png)

You can also access only the amount, unit, note or food inside your instruction text using
```
{{ ingredients[0].amount }}
{{ ingredients[0].unit }}
{{ ingredients[0].food }}
{{ ingredients[0].note }}
```

## Technical Reasoning
There are several options how the ingredients in the list can be related to the Template Context in the Text.

The template could access them by ID, the food name or the position in the list. All options have their benefits and disadvantages.

1. **ID**: ugly to write and read when not rendered and also more complex from a technical standpoint
2. **Name**: very nice to read and easy but does not work when a food occurs twice in a step. Could have workaround but would then be inconsistent.
3. **Position**: easy to write and understand but breaks when ordering is changed and not really nice to read when instructions are not rendered.

I decided to go for the position based system. If you know of any better way feel free to open an issue or PR.
