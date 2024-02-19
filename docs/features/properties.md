!!! warning
Properties are currently in a beta stage. They work pretty stable but if I encounter any
issues while working on them, I might change how they work breaking existing properties.
I will try to avoid this and am pretty confident it won't happen.

`Foods` can have different `properties` associated with them. These `properties` can be defined by selecting the `Properties` option from the briefcase menu.
A new `property type` can then be added, by specifying a `name` and optionally a `unit`, `description`, `FDC ID`, `Open Data Slug` and `order` (This is a numeric value that is used to sort the `properties` on from small to large `order` values).

A logical example of a `property` is the energy in kcal. By editing the individual `foods`, the value of the `property` can be set.
The value is provided per `food amount`. E.g. the energy in kcal per 100g of the food item. 
By defining the energy `property` of the food items, the `property` can then also be calculated for a `recipe`. This is done by adding all values of the `property` taking the amount of food units into account.

## Costs calculation

Besides nutritional `properties`, cost can also be a `property` of a food item.
In this way, a cost estimate of a `recipe` can be calculated based on the ingredients required.