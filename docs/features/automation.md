!!! warning
    Automations are currently in a beta stage. They work pretty stable but if I encounter any 
    issues while working on them, I might change how they work breaking existing automations.
    I will try to avoid this and am pretty confident it won't happen.


Automations allow Tandoor to automatically perform certain tasks, especially when importing recipes, that 
would otherwise have to be done manually. Currently, the following automations are supported.


## Unit, Food, Keyword Alias
asd

## Description Replace
This automation is a bit more complicated than the alis rules. 

It uses Regular Expressions (RegEx) to determine if a description should be altered, what exactly to remove
and what to replace it with. 

- **Parameter 1**: pattern of which sites to match (e.g. `.*.chefkoch.de.*`, `.*`)
- **Parameter 2**: pattern of what to replace (e.g. `.*`)
- **Parameter 3**: value to replace matched occurrence of parameter 2 with. Only one occurrence of the pattern is replaced.

To replace the description the python [re.sub](https://docs.python.org/2/library/re.html#re.sub) function is used
like this `re.sub(<parameter 2>, <parameter 2>, <descriotion>, count=1)`

To test out your patterns and learn about RegEx you can use [regexr.com](https://regexr.com/)

# Order
If the Automation type allows for more than one rule to be executed (for example description replace) 
the rules are processed in ascending order (ordered by the *order* property of the automation). 
The default order is always 1000 to make it easier to add automations before and after other automations. 

Example:
1. Rule ABC (order 1000) replaces `everything` with `abc`
2. Rule DEF (order 2000) replaces `everything` with `def`
3. Rule XYZ (order 500) replaces `everything` with `xyz`

After processing rules XYZ, then ABC and then DEF the description will have the value `def`