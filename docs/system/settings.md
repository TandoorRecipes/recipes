Following is a description of the different settings for a space

!!! WARNING WIP
    Some settings and especially this page is work in Progress and the settings may
    behave differently the described here.

## Use Plural form

Default Value: `off`

This setting enables tandoor to display a plural form of a food or unit, if the
plural version is entered for the food or unit. The plural version is displayed if the
amount needed for a recipe is greater than 1 and will be adjusted to the current amount.

In addition, this setting enables two new settings for an ingredient:

- Always show the plural version of the food: This will always display the plural version for
a food, even if the amount is below or equal to 1. Requirement for this setting to activate
is a plural version available in the database.
- Always show the plural version of the unit: This will always display the plural version for
a unit, even if the amount is below or equal to 1. Requirement for this setting to activate
is a plural version available in the database.

!!! WARNING Note
    This setting is only meant to be a very simple version to enable some kind of pluralization
    for food and units. This feature may not meet your needs, but pluralization is a difficult
    topic and was discussed [here](https://github.com/TandoorRecipes/recipes/pull/1860).
