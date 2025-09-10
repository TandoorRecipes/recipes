<template>


    <v-layout style="height: 70vh">

        <v-navigation-drawer style="height: calc(100% + 0px)" v-model="drawer">
            <v-list>

                <!--                <v-list-item>-->
                <!--                    <v-text-field density="compact" variant="outlined" class="pt-2 pb-2" :label="$t('Search')" hide-details clearable></v-text-field>-->
                <!--                </v-list-item>-->
                <!--                <v-divider></v-divider>-->
                <v-list-item link title="Start" @click="window = 'start'" prepend-icon="fa-solid fa-house"></v-list-item>
                <v-list-item link title="Space" @click="window = 'space'" prepend-icon="fa-solid fa-database"></v-list-item>
                <v-list-item link :title="$t('Recipes')" @click="window = 'recipes'" prepend-icon="$recipes"></v-list-item>
                <v-list-item link :title="$t('Import')" @click="window = 'import'" prepend-icon="$import"></v-list-item>
                <v-list-item link :title="$t('AI')" @click="window = 'ai'" prepend-icon="$ai"></v-list-item>
                <v-list-item link :title="$t('Unit')" @click="window = 'unit'" prepend-icon="fa-solid fa-scale-balanced"></v-list-item>
                <v-list-item link :title="$t('Food')" @click="window = 'food'" prepend-icon="fa-solid fa-carrot"></v-list-item>
                <v-list-item link :title="$t('Keyword')" @click="window = 'keyword'" prepend-icon="fa-solid fa-tags"></v-list-item>
                <v-list-item link title="Recipe Structure" @click="window = 'recipe_structure'" prepend-icon="fa-solid fa-diagram-project"></v-list-item>
                <v-list-item link :title="$t('Properties')" @click="window = 'properties'" prepend-icon="fa-solid fa-database"></v-list-item>
                <v-list-item link :title="$t('Search')" @click="window = 'recipe_search'" prepend-icon="$search"></v-list-item>
                <v-list-item link :title="$t('SavedSearch')" @click="window = 'search_filter'" prepend-icon="fa-solid fa-sd-card"></v-list-item>
                <v-list-item link :title="$t('Books')" @click="window = 'books'" prepend-icon="$books"></v-list-item>
                <v-list-item link :title="$t('Shopping')" @click="window = 'shopping'" prepend-icon="$shopping"></v-list-item>
                <v-list-item link :title="$t('Meal_Plan')" @click="window = 'meal_plan'" prepend-icon="$mealplan"></v-list-item>
            </v-list>

        </v-navigation-drawer>

        <v-main>
            <v-container>
                <v-window v-model="window">
                    <v-window-item value="start">
                        <h2>Welcome to Tandoor 2</h2>
                        <p class="mt-3">Tandoor is one of the most most powerful recipe management suits available. It has constantly been improved since its first
                            version in 2018.
                            This knowledgebase explains all important features and concepts. Explore it to find out how Tandoor can help you improve your daily cooking
                            routine or search
                            for specific features to help you understand them.</p>

                        <v-btn class="mt-2" color="primary" href="https://tandoor.dev" target="_blank" prepend-icon="fa-solid fa-globe">
                            Website
                        </v-btn>
                        <v-btn class="mt-2 ms-2" color="info" href="https://github.com/TandoorRecipes/recipes" target="_blank" prepend-icon="fa-solid fa-code-branch">GitHub
                        </v-btn>

                        <v-alert class="mt-3" border="start" variant="tonal" color="success" v-if="(!useUserPreferenceStore().serverSettings.hosted && !useUserPreferenceStore().activeSpace.demo)">
                            <v-alert-title>Did you know?</v-alert-title>
                            Tandoor is Open Source and available to anyone for free to host on their own server. Thousands of hours have been spend
                            making Tandoor what it is today. You can help make Tandoor even better by contributing or helping financing the effort.
                            <br/>
                            <v-btn class="mt-2" color="secondary" href="https://docs.tandoor.dev/contribute/contribute/" target="_blank" prepend-icon="fa-solid fa-code-branch">
                                Contribute
                            </v-btn>
                            <v-btn class="mt-2 ms-2" color="success" href="https://github.com/sponsors/vabene1111" target="_blank" prepend-icon="fa-solid fa-dollar-sign">Sponsor
                            </v-btn>
                        </v-alert>

                    </v-window-item>
                    <v-window-item value="space">
                        <p class="mt-3">All your data is stored in a Space where you can invite other people to collaborate on your recipe database. Typcially the members of a space
                            belong to one family/household/organization.</p>

                        <p class="mt-3">While everyone can access all recipes by default, Books, Shopping Lists and Mealplans are not shared by default. You can share them with other
                            members of your space
                            using the settings.
                        </p>
                        <p class="mt-3">You can create and be a member of multiple spaces. Switch between them freely using the navigation or space settings. Depending
                            on the permission configured by the space owner you might not have access to all features of a space.</p>
                        <p class="mt-3"></p>

                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-database" class="me-2" :to="{name: 'UserSpaceSettings'}">{{ $t('YourSpaces') }}</v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$settings" class="me-2" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-users" class="me-2" :to="{name: 'SpaceMemberSettings'}">{{ $t('Invites') }}</v-btn>

                    </v-window-item>
                    <v-window-item value="recipes">
                        <p class="mt-3">Recipes are the foundation of your Tandoor space. A Recipe has one or more steps that contain ingredients, instructions and other information.
                            Ingredients in turn consist of an amount, a unit and a food, allowing recipes to be scaled, nutrition's to be calculated and shopping to be organized.
                        </p>

                        <p class="mt-3">Besides manually creating them you can also import them from various different places.
                        </p>
                        <p class="mt-3">Recipes, by default, are visible to all members of your space. Setting them to private means only you can see it. After setting it to private you
                            can manually specify the people who should be able to view the recipe.
                            You can also create a share link for the recipe to share it with everyone that has access to the link.
                        </p>
                        <p class="mt-3"></p>

                        <v-btn color="primary" variant="tonal" prepend-icon="$create" class="me-2" :to="{name: 'ModelEditPage', params: {model: 'Recipe'}}">{{ $t('Create') }}</v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$search" class="me-2" :to="{name: 'SearchPage'}">{{ $t('Search') }}</v-btn>

                    </v-window-item>
                    <v-window-item value="import">
                        <p class="mt-3">The Recipe importer is one of the most powerful features of Tandoor and allows you to quickly add recipes in multiple different ways.
                        </p>

                        <p class="mt-3">The easiest is to import from a URL. If that is not enough you can also import from an Image or PDF file using AI.
                        </p>
                        <p class="mt-3">If you already have an existing Recipe database in another format there is also a good chance Tandoor will have an
                            importer for that program.
                        </p>
                        <p class="mt-3"></p>

                        <v-btn color="primary" variant="tonal" prepend-icon="$import" class="me-2" :to="{name: 'RecipeImportPage'}">{{ $t('Import') }}</v-btn>

                    </v-window-item>
                    <v-window-item value="ai">
                        <p class="mt-3">Tandoor has several functions that allow you to use AI to automatically perform certain tasks like importing recipes from a PDFs or images.
                        </p>

                        <p class="mt-3" v-if="useUserPreferenceStore().serverSettings.hosted">
                            To use AI you must first configure an AI Provider. This can also be done globally for all spaces by the person operating your Tandoor Server.
                        </p>
                        <p class="mt-3" v-if="!useUserPreferenceStore().serverSettings.hosted">
                            Some AI Providers are available globally for every space to use. You can also configure additional AI Providers for your space only.
                        </p>

                        <p class="mt-3" v-if="useUserPreferenceStore().serverSettings.hosted">
                            To prevent accidental AI cost you can review your AI usage using the AI Log. The Server Administrator can also set AI usage limits for your space (either monthly or using a balance).
                        </p>
                        <p class="mt-3" v-if="!useUserPreferenceStore().serverSettings.hosted">
                            Depending on your subscription you will have different AI Credits available for your space every month. Additionally you might have a Credit balance
                            that will be used once your monthly limit is reached.
                        </p>

                        <v-btn color="primary" variant="tonal" prepend-icon="$ai" class="me-2" :to="{name: 'ModelListPage', params: {model: 'AiProvider'}}">
                            {{ $t('AiProvider') }}
                        </v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$ai" class="me-2" :to="{name: 'ModelListPage', params: {model: 'AiLog'}}">
                            {{ $t('AiLog') }}
                        </v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$ai" class="me-2" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$import" class="me-2" :to="{name: 'RecipeImportPage'}">{{ $t('Import') }}</v-btn>

                    </v-window-item>
                    <v-window-item value="unit">
                        <p class="mt-3">Units allow you to measure how much of something you need in a recipe or on a shopping list.
                            They are also essential for the calculation of Properties.
                        </p>

                        <p class="mt-3">Setting a base unit allows you to name your Unit however you want (e.g. grams, g, G, gram) while allowing Tandoor
                            to automatically convert between the units in the same system (weight/volume, e.g. from g to kg or from cup to pint).
                        </p>
                        <p class="mt-3">Additionally you can use custom unit conversion to convert between volume and weight trough the specific density
                            of a food (e.g. 1 cup of flour = 120 g). These conversions are used to calculate the Properties for a Recipe
                            and might allow cosmetic display changes later.
                        </p>


                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-scale-balanced" class="me-2" :to="{name: 'ModelListPage', params: {model: 'Unit'}}">
                            {{ $t('Unit') }}
                        </v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-exchange-alt" class="me-2" :to="{name: 'ModelListPage', params: {model: 'UnitConversion'}}">
                            {{ $t('Conversion') }}
                        </v-btn>

                    </v-window-item>
                    <v-window-item value="food">
                        <p class="mt-3">Foods have multiple uses in Tandoor. Their most important task is to be part of recipe ingredients together with an amount and
                            a unit.
                        </p>

                        <p class="mt-3">Using the Food editor you can also add properties to a food or link the food to another recipe or external URL.
                        </p>
                        <p class="mt-3">Foods are also used or created when adding entries to the shopping list.
                        </p>


                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-carrot" class="me-2" :to="{name: 'ModelListPage', params: {model: 'Food'}}">
                            {{ $t('Food') }}
                        </v-btn>

                    </v-window-item>
                    <v-window-item value="keyword">
                        <p class="mt-3">Keywords are a very flexible Tool to help you organize your recipe collection.
                            Keywords can quickly be created when editing a Recipe by just typing into the Keywords field or they can
                            be created trough the Keyword Editor.
                        </p>

                        <p class="mt-3">Typical keywords include meal types (breakfast, lunch, dinner, ...), couise (american, italian, ...) or diet (vegan, vegetarian, ..).

                        </p>
                        <p class="mt-3">Tip: Using Emojis in Keywords makes them easy to recognize.
                        </p>


                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-tags" class="me-2" :to="{name: 'ModelListPage', params: {model: 'Keyword'}}">
                            {{ $t('Keyword') }}
                        </v-btn>

                    </v-window-item>
                    <v-window-item value="recipe_structure">
                        <p class="mt-3">A Recipe consists of multiple Steps.
                        </p>

                        <p class="mt-3">Each Step has Ingreditens (which are at least a Food but typically consist of amount,
                            Unit and Food). A Step can also contain instuctions, times, files or link to another Recipe.
                        </p>
                        <p class="mt-3">Additionally a Recipe can have Properties, Comments, Keywords and more.
                        </p>
                        <!-- TODO diagram -->

                    </v-window-item>
                    <v-window-item value="properties">
                        <p class="mt-3">The Properties system allows you to add additional data to your Foods and Recipes in the respective editors.
                            Most commonly you would use this to add nutrition facts but the system can also be used to track prices,
                            dietary points or any other kind of property.
                        </p>

                        <p class="mt-3">You first need to create the Property Types that you need (e.g. Carbohydrates, Sugar, Price, Points, ..).
                            Setting the FDC ID for a Property Type allows Tandoor to connect your custom Property Type to a property in the FDC database.
                            You can then go to a Food, set its FDC ID and Tandoor can automatically pull the properties you want from the FDC database.
                        </p>
                        <p class="mt-3">When adding a Property to the Recipe it will just be statically displayed in the Recipe view.
                            Adding properties to a Foods will allow Tandoor to calculate the properties for all the Ingredients in a Recipe based
                            on the Foods and their respective Units and Amounts.
                        </p>

                        <p class="mt-3">Food Properties are entered based on a certain amount of food (often 100 g). Unit Conversions allow Tandoor to
                            calculate the property amount if a Food is given in a different unit (e.g. 1kg or 1 cup).
                        </p>

                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-database" class="me-2 mt-2 mb-2" :to="{name: 'ModelListPage', params: {model: 'PropertyType'}}">
                            {{ $t('Property') }}
                        </v-btn>
                        <h3>Editor</h3>
                        <p class="mt-3">Adding Properties manually to every food can be cumbersome. To make it easier you can import the Community curated
                            Open Data Database. If that is not enough you can open the Property Editor trough the context menu on your recipe.
                        </p>

                        <p class="mt-3">Here you can view all Foods in a Recipe and their respective properties. You can also quickly assign FDC ID's to both
                            Foods and Property Types and import the data from the FDC Database.
                        </p>
                        <h3>View</h3>

                        <p class="mt-3">
                            Properties are shown below every recipe as soon as you setup your first Property Types.
                            A small warning triangle is shown if there are missing values for one of the Foods in the recipe.
                        </p>
                        <p class="mt-3">
                            Clicking on the warning triangle allows you to see the individual property amounts of each food and where Properties
                            or Unit Conversions are missing.
                        </p>
                    </v-window-item>
                    <v-window-item value="recipe_search">
                        <p class="mt-3">There are two ways to search for Recipes.
                        </p>

                        <p class="mt-3">The global quick search can be opened from any page in Tandoor by pressing the search icon in the top right corner.
                            Here you can quickly search trough your recipes and open them.
                        </p>
                        <p class="mt-3">
                            If you need a bit more fine tuning for your search you can open the advances search and search for all kinds of different things like keywords,
                            foods or ratings.
                        </p>


                        <v-btn color="primary" variant="tonal" prepend-icon="$search" class="me-2" :to="{name: 'SearchPage', }">
                            {{ $t('Search') }}
                        </v-btn>

                    </v-window-item>
                    <v-window-item value="search_filter">
                        <p class="mt-3">Once you have performed an advanced search you can save the search filter to easily retrieve it later.
                        </p>
                        <p class="mt-3">
                            This is done by hitting the save button in the advanced search form. To load a search filter you simply select it from the
                            selection box and hit the load button.
                        </p>
                        <p class="mt-3">
                            You can use saved search filters to automatically create recipe books.
                        </p>
                    </v-window-item>
                    <v-window-item value="books">
                        <p class="mt-3">Books are a a way to structure and explore your recipe collection. They are similar to keywords but show you a bit more details when
                            looking trough them.
                        </p>

                        <p class="mt-3">After creating a new Book on the books page you can either add recipes manually or you can add a Saved Search Filter to automatically
                            load recipes into your book based on pre defined search criteria.
                        </p>

                        <v-btn color="primary" variant="tonal" prepend-icon="$books" class="me-2" :to="{name: 'BooksPage', }">
                            {{ $t('Books') }}
                        </v-btn>
                    </v-window-item>
                    <v-window-item value="shopping">
                        <p class="mt-3">
                            You can add inidivitual Foods (including non Food items of course) or whole recipes to your shopping list.
                            By default only you can see the entries you make, by going to the settings you can share them with other users and they can share them with you.
                        </p>

                        <p class="mt-3">
                            You can assign Supermarket Categories to your Foods, either trough the Food Editor or directly by clicking on a Shopping List Entry, to automatically sort the list
                            according to the Category Order defined in the Supermarket.
                        </p>

                        <p class="mt-3">
                            Each line in the shopping list can contain multiple entries of the same Food.
                            By clicking on a line you can open a dialog that allows you to see the details and perform various actions.
                        </p>

                        <v-list>
                            <v-list-item>Postpone: Hide the entry from the shopping list for a certain time (specified in the settings)</v-list-item>
                            <v-list-item>Ignore: Check this Food of the list and do not add it again when adding a recipe to the shopping list</v-list-item>
                            <v-list-item>Edit: Open the Food's Editor</v-list-item>
                            <v-list-item>Delete all: Delete all entries associated with this line.</v-list-item>
                        </v-list>

                        <p class="mt-3">
                            The Shopping list automatically syncronizes when multiple people have it open so you can shop with multiple devices.
                        </p>
                        <p class="mt-3">
                            Trough the menu you can also configure which information you want to be displayed or how the list should be sorted.
                        </p>
                        <v-btn color="primary" variant="tonal" prepend-icon="$shopping" class="me-2" :to="{name: 'ShoppingListPage', }">
                            {{ $t('Shopping') }}
                        </v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="$settings" class="me-2" :to="{name: 'ShoppingSettings', }">
                            {{ $t('Settings') }}
                        </v-btn>
                    </v-window-item>

                    <v-window-item value="meal_plan">
                        <p class="mt-3">
                            To plan what you want to eat you can create a Meal Plan. Each Meal Plan consists of at least a title or a recipe, a date and a Meal Type.
                            Meal Plan entries a private by default and can either be shared individually or using a preset in the meal plan settings.

                        </p>

                        <p class="mt-3">
                            When selecting a Recipe in a Meal Plan you can automatically add its ingredients to the shopping list. You can also manually add more entries trough the
                            shopping tab in the Meal Plan editor. When deleting a Meal Plan all Shopping List Entries associated with that Meal Plan are deleted as well. When changing the
                            number of servings in a Meal Plan the Servings of the connected Recipe in the Shopping list are automatically changed as well.

                        </p>

                        <v-btn color="primary" variant="tonal" prepend-icon="$mealplan" class="me-2 mt-2" :to="{name: 'MealPlanPage', }">
                            {{ $t('Meal_Plan') }}
                        </v-btn>

                        <h3 class="mt-3">{{ $t('Meal_Type') }}</h3>

                        <p class="mt-3">
                            Meal Types allow you to categorize the different Meal Plan Entries.
                        </p>
                        <p class="mt-3">
                            You can also define a time that is used for sorting and calendar integration.
                        </p>

                        <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-utensils" class="me-2 mt-2" :to="{name: 'ModelListPage', params: {model: 'MealType'}}">
                            {{ $t('Meal_Type') }}
                        </v-btn>

                    </v-window-item>
                </v-window>
            </v-container>
        </v-main>
    </v-layout>


</template>

<script setup lang="ts">

import {ref} from "vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const drawer = defineModel()
const window = ref('start')

</script>


<style scoped>

</style>