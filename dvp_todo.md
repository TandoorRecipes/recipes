Meal planning was always extremely exhausting for my wife and me. So a while ago I built a workflow that automatically prepares a meal plan for my family (taking into account our schedules, supplies, freshness of ingredients etc.). I wrote about the first release here.

We have been testing this for almost 3 years now and I have to admit: It wasn't quite perfect for our family. Simply because our daily routines hardly stayed the same for more than a few months. In other words, the automation shouldn't dictate what we eat and when. It should be able to adapt to our everyday lives.

So I turned this whole thing into an app that can better handle sudden changes of schedules. Since it took only about 2 weeks to build this might inspire some of you (in case you’re interested in building a custom app your family):

The app allows us to search and filter recipes in all kinds of categories. These include main courses, snacks, pastries, salads, side dishes, desserts, drinks and components (like syrups, dressings, toppings etc.).

By default it displays only recipes for the current season and weather (to avoid heavy winter courses when it's hot outside or light summer dishes on cold days).

You can filter by flavor (sweet or savory), max preparation time, max number of ingredients to buy, number of servings and custom food groups (like meat, poultry, seafood, carbohydrates, cheese etc.).

All results are sorted in a way that the recipes with the shortest preparation time and the fewest ingredients to buy are at the top.

Apart from being able to edit recipes directly from the app, they can also be added to our meal plan and the ingredients can be put on our shopping list automatically (if required).

Of course you can also search for keywords. There are 2 modes for this:

if you know which ingredients you want to use up: display all recipes that contain all your terms
if you just want to know what you can do with the stuff at home (regardless of whether you can use it all in one dish or in multiple dishes): Display all recipes that contain at least one of the keywords
Since our recipes come from very different sources and countries (books, blogs, personal experience, etc.), the app is also able to find recipes with similar ingredients. For example, in my language there are 2 words for very similar vegetables: "Karotte" and "Möhre". So if I search for "Karotte", I will also get recipes with "Möhre".

And for the final touch, it is possible to choose between either ingredients for preparation or ingredients for grocery shopping, upload pictures and add tags (great for food pairings!).

For those interested in the technology behind all of this: I built everything with a tech stack that is free and mostly self-hosted.

The UI for searching and triggering the automations runs on a simple Apache webserver. I use PHP to generate the default set of filters (e.g. based on the weather forecast) every time the app is opened and jQuery for AJAX calls.

I built the search algorithm as well as the automations in n8n and made them available via webhooks.

The recipes are stored in a Postgres database. The front end for editing recipes or adding new ones is provided via Budibase.

Our meal plan and shopping lists are stored in Trello. However, they are populated and managed automatically via n8n.

The current status of the meal plan (including who is cooking what and when) is then displayed in Home Assistant.

https://www.reddit.com/r/selfhosted/comments/1kkbq9w/comment/mrvk1q6/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button


***

Meal planning was always extremely exhausting for my wife and me. So a while ago I built a workflow that automatically prepares a meal plan for my family (taking into account our schedules, supplies, freshness of ingredients etc.). I wrote about the first release here.

We have been testing this for almost 3 years now and I have to admit: It wasn't quite perfect for our family. Simply because our daily routines hardly stayed the same for more than a few months. In other words, the automation shouldn't dictate what we eat and when. It should be able to adapt to our everyday lives.

So I turned this whole thing into an app that can better handle sudden changes of schedules. Since it took only about 2 weeks to build this might inspire some of you (in case you’re interested in building a custom app your family):

The app allows us to search and filter recipes in all kinds of categories. These include main courses, snacks, pastries, salads, side dishes, desserts, drinks and components (like syrups, dressings, toppings etc.).

By default it displays only recipes for the current season and weather (to avoid heavy winter courses when it's hot outside or light summer dishes on cold days).

You can filter by flavor (sweet or savory), max preparation time, max number of ingredients to buy, number of servings and custom food groups (like meat, poultry, seafood, carbohydrates, cheese etc.).

All results are sorted in a way that the recipes with the shortest preparation time and the fewest ingredients to buy are at the top.

Apart from being able to edit recipes directly from the app, they can also be added to our meal plan and the ingredients can be put on our shopping list automatically (if required).

Of course you can also search for keywords. There are 2 modes for this:

if you know which ingredients you want to use up: display all recipes that contain all your terms
if you just want to know what you can do with the stuff at home (regardless of whether you can use it all in one dish or in multiple dishes): Display all recipes that contain at least one of the keywords
Since our recipes come from very different sources and countries (books, blogs, personal experience, etc.), the app is also able to find recipes with similar ingredients. For example, in my language there are 2 words for very similar vegetables: "Karotte" and "Möhre". So if I search for "Karotte", I will also get recipes with "Möhre".

And for the final touch, it is possible to choose between either ingredients for preparation or ingredients for grocery shopping, upload pictures and add tags (great for food pairings!).

For those interested in the technology behind all of this: I built everything with a tech stack that is free and mostly self-hosted.

The UI for searching and triggering the automations runs on a simple Apache webserver. I use PHP to generate the default set of filters (e.g. based on the weather forecast) every time the app is opened and jQuery for AJAX calls.

I built the search algorithm as well as the automations in n8n and made them available via webhooks.

The recipes are stored in a Postgres database. The front end for editing recipes or adding new ones is provided via Budibase.

Our meal plan and shopping lists are stored in Trello. However, they are populated and managed automatically via n8n.

The current status of the meal plan (including who is cooking what and when) is then displayed in Home Assistant.

https://www.reddit.com/r/selfhosted/comments/1kkbq9w/after_3_years_of_testing_i_turned_our_family_meal/

***

