!!! warning
Automations are currently in a beta stage. They work pretty stable but if I encounter any
issues while working on them, I might change how they work breaking existing automations.
I will try to avoid this and am pretty confident it won't happen.

Automations allow Tandoor to automatically perform certain tasks, especially when importing recipes, that
would otherwise have to be done manually. Currently, the following automations are supported.

## Unit, Food, Keyword Alias

Foods, Units and Keywords can have automations that automatically replace them with another object
to allow aliasing them.

This helps to add consistency to the naming of objects, for example to always use the singular form
for the main name if a plural form is configured.

These automations are best created by dragging and dropping Foods, Units or Keywords in their respective
views and creating the automation there.

You can also create them manually by setting the following

-   **Parameter 1**: name of food/unit/keyword to match
-   **Parameter 2**: name of food/unit/keyword to replace matched food with

These rules are processed whenever you are importing recipes from websites or other apps
and when using the simple ingredient input (shopping, recipe editor, ...).

## Description Replace

This automation is a bit more complicated than the alias rules. It is run when importing a recipe
from a website.

It uses Regular Expressions (RegEx) to determine if a description should be altered, what exactly to remove
and what to replace it with.  The search string ignores case, the replacement string respects case.

-   **Parameter 1**: pattern of which sites to match (e.g. `.*.chefkoch.de.*`, `.*`)
-   **Parameter 2**: pattern of what to replace (e.g. `.*`)
-   **Parameter 3**: value to replace matched occurrence of parameter 2 with. Only the first occurrence of the pattern is replaced.

To replace the description the python [re.sub](https://docs.python.org/2/library/re.html#re.sub) function is used
like this `re.sub(<parameter 2>, <parameter 3>, <description>, count=1)`

To test out your patterns and learn about RegEx you can use [regexr.com](https://regexr.com/)
ChatGPT and similiar LLMs are also useful for creating RegEx patterns:
`ChatGPT please create a Regex expression in the format of re.sub(<parameter 2>, <parameter 3>, <description>, count=1)
that will change the string <example string here> into the string <desired result here>`

!!! info
In order to prevent denial of service attacks on the RegEx engine the number of replace automations
and the length of the inputs that are processed are limited. Those limits should never be reached
during normal usage.

## Instruction Replace, Title Replace, Food Replace & Unit Replace

These work just like the Description Replace automation.
Instruction, Food and Unit Replace will run against every iteration of the object in a recipe during import.
- Instruction Replace will run for the instructions in every step.  It will also replace every occurrence, not just the first.
- Food & Unit Replace will run for every food and unit in every ingredient in every step.

Also instead of just replacing a single occurrence of the matched pattern it will replace all.

## Never Unit

Some ingredients have a pattern of AMOUNT and FOOD, if the food has multiple words (e.g. egg yolk) this can cause Tandoor
to detect the word "egg" as a unit. This automation will detect the word 'egg' as something that should never be considered
a unit.

You can also create them manually by setting the following

-   **Parameter 1**: string to detect
-   **Parameter 2**: Optional: unit to insert into ingredient (e.g. 1 whole 'egg yolk' instead of 1 <empty> 'egg yolk')

These rules are processed whenever you are importing recipes from websites or other apps
and when using the simple ingredient input (shopping, recipe editor, ...).

## Transpose Words

Some recipes list the food before the units for some foods (garlic cloves). This automation will transpose 2 words in an
ingredient so "garlic cloves" will automatically become "cloves garlic"

-   **Parameter 1**: first word to detect
-   **Parameter 2**: second word to detect

These rules are processed whenever you are importing recipes from websites or other apps
and when using the simple ingredient input (shopping, recipe editor, ...).

# Order

If the Automation type allows for more than one rule to be executed (for example description replace)
the rules are processed in ascending order (ordered by the _order_ property of the automation).
The default order is always 1000 to make it easier to add automations before and after other automations.

Example:

1. Rule ABC (order 1000) replaces `everything` with `abc`
2. Rule DEF (order 2000) replaces `everything` with `def`
3. Rule XYZ (order 500) replaces `everything` with `xyz`

After processing rules XYZ, then ABC and then DEF the description will have the value `def`
