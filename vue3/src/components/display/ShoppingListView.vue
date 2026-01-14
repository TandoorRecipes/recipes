<template>
    <v-tabs v-model="currentTab" v-if="!selectEnabled">
        <v-tab value="shopping"><i class="fas fa-fw"
                                   :class="{'fa-circle-notch fa-spin':useShoppingStore().currentlyUpdating, 'fa-shopping-cart ': !useShoppingStore().currentlyUpdating}"></i> <span
            class="d-none d-md-block ms-1">{{ $t('Shopping_list') }} ({{ useShoppingStore().totalFoods }})</span></v-tab>
        <v-tab value="recipes"><i class="fas fa-book fa-fw"></i> <span class="d-none d-md-block ms-1">{{
                $t('Recipes')
            }} ({{ useShoppingStore().getAssociatedRecipes().length }})</span></v-tab>
        <v-tab value="selected_supermarket" v-if="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket != null">
            <i class="fa-solid fa-store fa-fw"></i> <span class="d-none d-md-block ms-1">{{ useUserPreferenceStore().deviceSettings.shopping_selected_supermarket.name }}</span>
        </v-tab>

        <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ props }">
                <v-btn
                    class="me-4 float-right"
                    height="100%"
                    rounded="0"
                    variant="plain"
                    v-bind="props"
                >
                    <i class="fa-solid fa-sliders"></i>
                </v-btn>
            </template>

            <v-list density="compact">
                <v-list-item>
                    <v-select hide-details :items="groupingOptionsItems" v-model="useUserPreferenceStore().deviceSettings.shopping_selected_grouping"
                              :label="$t('GroupBy')">
                    </v-select>
                </v-list-item>
                <v-list-item v-if="useUserPreferenceStore().deviceSettings.shopping_selected_grouping == ShoppingGroupingOptions.CATEGORY">
                    <v-switch color="primary" hide-details :label="$t('SupermarketCategoriesOnly')"
                              v-model="useUserPreferenceStore().deviceSettings.shopping_show_selected_supermarket_only"></v-switch>
                </v-list-item>
                <v-list-item>
                    <model-select model="Supermarket" append-to-body v-model="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket"></model-select>
                </v-list-item>

                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('ShowDelayed')" v-model="useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries"></v-switch>
                </v-list-item>
                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('ShowRecentlyCompleted')"
                              v-model="useUserPreferenceStore().deviceSettings.shopping_show_checked_entries"></v-switch>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="exportDialog = true" link prepend-icon="fa-solid fa-download">
                    {{ $t('Export') }}
                </v-list-item>
                <v-list-subheader>{{ $t('Information') }}</v-list-subheader>
                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('Recipe')" v-model="useUserPreferenceStore().deviceSettings.shopping_item_info_recipe"></v-switch>
                </v-list-item>
                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('Meal_Plan')" v-model="useUserPreferenceStore().deviceSettings.shopping_item_info_mealplan"></v-switch>
                </v-list-item>
                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('CreatedBy')" v-model="useUserPreferenceStore().deviceSettings.shopping_item_info_created_by"></v-switch>
                </v-list-item>
                <v-list-item>
                    <v-switch color="primary" hide-details label="New Input" v-model="useUserPreferenceStore().deviceSettings.shopping_input_autocomplete"></v-switch>
                </v-list-item>
                <v-list-item v-if="useUserPreferenceStore().serverSettings.debug">
                    <v-switch color="primary" hide-details label="Show Debug Info" v-model="useUserPreferenceStore().deviceSettings.shopping_show_debug"></v-switch>
                </v-list-item>

            </v-list>
        </v-menu>

        <!--        <v-btn height="100%" rounded="0" variant="plain">-->
        <!--            <i class="fa-solid fa-download"></i>-->
        <!--            <shopping-export-dialog></shopping-export-dialog>-->
        <!--        </v-btn>-->

        <!--        <v-btn height="100%" rounded="0" variant="plain" @click="useShoppingStore().undoChange()">-->
        <!--            <i class="fa-solid fa-arrow-rotate-left"></i>-->
        <!--        </v-btn>-->

    </v-tabs>
    <v-banner class="pt-0 pb-0 bg-info" v-if="selectEnabled">
        <template #prepend>
            <v-btn icon="$close" variant="plain" @click="selectEnabled = false" lines="1"></v-btn>
        </template>

        <shopping-list-select-chip
            v-model="selectedShoppingLists"
            :shopping-lists="useShoppingStore().shoppingLists"
            show-update
            hide-edit
            hide-create
            @refresh="useShoppingStore().loadShoppingLists()"
            @update="batchUpdateShoppingLists"
        ></shopping-list-select-chip>

        <category-select-chip
            :categories="useShoppingStore().supermarketCategories"
            @update="batchUpdateCategories"
        ></category-select-chip>
    </v-banner>

    <shopping-export-dialog v-model="exportDialog" activator="model"></shopping-export-dialog>

    <v-window v-model="currentTab">
        <v-window-item value="shopping">
            <v-container>
                <!--                <v-row class="pa-0" dense>-->
                <!--                    <v-col class="pa-0">-->
                <!--                        <v-chip-group v-model="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket" v-if="supermarkets.length > 0">-->
                <!--                            <v-chip v-for="s in supermarkets" :value="s" :key="s.id" label density="compact" variant="outlined" color="primary">{{ s.name }}</v-chip>-->
                <!--                        </v-chip-group>-->
                <!--                    </v-col>-->
                <!--                </v-row>-->

                <v-row class="pa-0" dense>
                    <v-col class="pa-0">
                        <v-chip-group>
                            <v-btn label size="small" variant="outlined" @click="selectEnabled = !selectEnabled">
                                <v-icon icon="fa-solid fa-list-check"></v-icon>
                            </v-btn>

                            <v-btn label size="small" class="ms-1" variant="outlined" @click="useShoppingStore().undoChange()" :disabled="useShoppingStore().undoStack.length == 0">
                                <v-icon icon="fa-solid fa-rotate-left"></v-icon>
                            </v-btn>

                            <v-chip label size="small" variant="outlined" class="ms-1 me-0 mt-0 mb-0 h-100" style="max-width: 50%;" :prepend-icon="TSupermarket.icon"
                                    append-icon="fa-solid fa-caret-down">
                            <span v-if="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket != null">
                                {{ useUserPreferenceStore().deviceSettings.shopping_selected_supermarket.name }}
                            </span>
                                <span v-else>{{ $t('Supermarket') }}</span>

                                <v-menu activator="parent">
                                    <v-list density="compact">
                                        <v-list-item
                                            @click="useUserPreferenceStore().deviceSettings.shopping_selected_shopping_lists = []; useShoppingStore().updateEntriesStructure()">
                                            {{ $t('SelectNone') }}
                                        </v-list-item>
                                        <v-list-item v-for="s in supermarkets" :key="s.id" @click="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket = s">
                                            {{ s.name }}
                                        </v-list-item>
                                        <v-list-item prepend-icon="$create" :to="{name: 'ModelEditPage', params: {model: 'Supermarket'}}">
                                            {{ $t('Create') }}
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-chip>

                            <shopping-list-select-chip
                                class="ms-1 mt-0 mb-0 h-100"
                                v-model:ids="useUserPreferenceStore().deviceSettings.shopping_selected_shopping_lists"
                                :shopping-lists="useShoppingStore().shoppingLists"
                                @refresh="useShoppingStore().loadShoppingLists()"
                            ></shopping-list-select-chip>
                        </v-chip-group>

                    </v-col>
                </v-row>

                <v-row class="mt-0">
                    <v-col>
                        <v-alert v-if="useShoppingStore().hasFailedItems()" color="warning" class="mb-2">
                            <template #prepend>
                                <v-icon icon="fa-solid fa-link-slash"></v-icon>
                            </template>
                            {{ $t('ShoppingBackgroundSyncWarning') }}
                            <template #append>
                                {{ useShoppingStore().itemCheckSyncQueue.length }}
                            </template>
                        </v-alert>

                        <shopping-list-entry-input></shopping-list-entry-input>

                        <v-list class="mt-3" density="compact" v-if="!useShoppingStore().initialized">
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                        </v-list>
                        <v-list class="mt-3" density="compact" v-model:selected="selectedLines" select-strategy="leaf" v-else>
                            <template v-for="category in useShoppingStore().entriesByGroup" :key="category.name">


                                <v-list-subheader v-if="category.name === useShoppingStore().UNDEFINED_CATEGORY"><i>{{ $t('NoCategory') }}</i></v-list-subheader>
                                <v-list-subheader v-else>{{ category.name }}</v-list-subheader>
                                <v-divider></v-divider>

                                <template v-for="[i, value] in category.foods" :key="value.food.id">
                                    <shopping-line-item :shopping-list-food="value" :select-enabled="selectEnabled"></shopping-line-item>
                                </template>

                            </template>
                        </v-list>

                        <!-- TODO remove once append to body for model select is working properly -->
                        <v-spacer style="margin-top: 120px;"></v-spacer>
                    </v-col>
                </v-row>

                <v-row v-if="useUserPreferenceStore().deviceSettings.shopping_show_debug">
                    <v-col cols="12" md="4">
                        <v-card>
                            <v-card-title>Auto Sync Debug</v-card-title>
                            <v-btn @click="useShoppingStore().autoSync()">Run Sync</v-btn>
                            <v-card-text>
                                <v-list>
                                    <v-list-item>currentlyUpdating: {{ useShoppingStore().currentlyUpdating }}</v-list-item>
                                    <v-list-item>hasFocus: {{ useShoppingStore().autoSyncHasFocus }}</v-list-item>
                                    <v-list-item>autoSyncTimeoutId: {{ useShoppingStore().autoSyncTimeoutId }}</v-list-item>
                                    <v-list-item>autoSyncLastTimestamp: {{ useShoppingStore().autoSyncLastTimestamp }}</v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card>
                            <v-card-title>Sync Queue Debug</v-card-title>
                            <v-card-text>
                                Length: {{ useShoppingStore().itemCheckSyncQueue.length }} <br/>
                                Has Failed Items: {{ useShoppingStore().hasFailedItems() }}
                                <v-list>
                                    <v-list-item v-for="i in useShoppingStore().itemCheckSyncQueue" :key="i">{{ i }}</v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card>
                            <v-card-title>Undo Debug</v-card-title>
                            <v-card-text>
                                <v-list>
                                    <v-list-item v-for="i in useShoppingStore().undoStack" :key="i">{{ i.type }} {{
                                            i.entries.flatMap((e: ShoppingListEntry) => e.food.name)
                                        }}
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-window-item>
        <v-window-item value="recipes">
            <v-container>
                <v-row>
                    <v-col>
                        <v-card>
                            <v-card-title>{{ $t('Recipes') }} / {{ $t('Meal_Plan') }}</v-card-title>
                            <v-card-text>
                                <ModelSelect model="Recipe" v-model="manualAddRecipe" append-to-body>
                                    <template #append>
                                        <v-btn icon="$create" color="create" :disabled="manualAddRecipe == undefined">
                                            <v-icon icon="$create"></v-icon>
                                            <add-to-shopping-dialog :recipe="manualAddRecipe" v-if="manualAddRecipe != undefined"
                                                                    @created="useShoppingStore().refreshFromAPI(); manualAddRecipe = undefined"></add-to-shopping-dialog>
                                        </v-btn>
                                    </template>
                                </ModelSelect>

                                <v-list>
                                    <v-list-item v-for="r in useShoppingStore().getAssociatedRecipes()">
                                        <template #prepend>
                                            <v-btn color="edit" icon>
                                                {{ r.servings }}
                                                <number-scaler-dialog
                                                    v-if="r.mealplan == undefined"
                                                    :number="r.servings"
                                                    @confirm="(servings: number) => {updateRecipeServings(r, servings)}"
                                                ></number-scaler-dialog>
                                                <model-edit-dialog model="MealPlan" :item-id="r.mealplan" v-if="r.mealplan != undefined" activator="parent"></model-edit-dialog>
                                            </v-btn>

                                        </template>

                                        <div class="ms-2">
                                            <p v-if="r.recipe">{{ r.recipeData.name }}<br/></p>
                                            <p v-if="r.mealplan">
                                                {{ r.mealPlanData.mealType.name }} - {{ DateTime.fromJSDate(r.mealPlanData.fromDate).toLocaleString(DateTime.DATE_FULL) }}
                                                #{{ r.id }}
                                            </p>
                                        </div>

                                        <template #append>
                                            <v-btn icon color="delete">
                                                <v-icon icon="$delete"></v-icon>
                                                <delete-confirm-dialog :object-name="r.name" :model-name="$t('ShoppingListRecipe')"
                                                                       @delete="deleteListRecipe(r)"></delete-confirm-dialog>
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                                </v-list>


                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>

        </v-window-item>
        <v-window-item value="selected_supermarket">
            <v-container>
                <v-row>
                    <v-col>
                        <supermarket-editor :item="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket"
                                            @save="(args: Supermarket) => (useUserPreferenceStore().deviceSettings.shopping_selected_supermarket = args)"></supermarket-editor>
                    </v-col>
                </v-row>
            </v-container>

        </v-window-item>
    </v-window>

</template>

<script setup lang="ts">

import {computed, onMounted, ref, shallowRef, toRef, watch} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ApiApi, Recipe, ResponseError, ShoppingList, ShoppingListEntry, ShoppingListRecipe, Supermarket, SupermarketCategory} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {IShoppingListFood, ShoppingGroupingOptions} from "@/types/Shopping";
import {useI18n} from "vue-i18n";
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue";
import SupermarketEditor from "@/components/model_editors/SupermarketEditor.vue";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import ShoppingListEntryInput from "@/components/inputs/ShoppingListEntryInput.vue";
import {DateTime} from "luxon";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {onBeforeRouteLeave} from "vue-router";
import ShoppingExportDialog from "@/components/dialogs/ShoppingExportDialog.vue";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";
import {TSupermarket} from "@/types/Models.ts";
import ShoppingListSelectChip from "@/components/inputs/ShoppingListSelectChip.vue";
import CategorySelectChip from "@/components/inputs/CategorySelectChip.vue";

const {t} = useI18n()

const exportDialog = ref(false)
const currentTab = ref("shopping")
const supermarkets = ref([] as Supermarket[])
const manualAddRecipe = ref<undefined | Recipe>(undefined)

const selectEnabled = ref(false)
const selectedLines = shallowRef([] as IShoppingListFood[])
const selectedShoppingLists = ref([] as ShoppingList[])

/**
 * VSelect items for shopping list grouping options with localized names
 */
const groupingOptionsItems = computed(() => {
    let items: any[] = []
    Object.values(ShoppingGroupingOptions).forEach(x => {
        items.push({'title': t(x), 'value': x})
    })
    return items
})

watch(() => useUserPreferenceStore().deviceSettings, () => {
    useShoppingStore().updateEntriesStructure()
}, {deep: true})

watch(() => useShoppingStore().entriesByGroup, () => {
    selectedLines.value = []
})

onMounted(() => {
    addEventListener("visibilitychange", (event) => {
        useShoppingStore().autoSyncHasFocus = (document.visibilityState === 'visible')
    });

    useShoppingStore().refreshFromAPI()

    autoSyncLoop()

    // refresh selected supermarket since category ordering might have changed
    if (useUserPreferenceStore().deviceSettings.shopping_selected_supermarket != null) {
        new ApiApi().apiSupermarketRetrieve({id: useUserPreferenceStore().deviceSettings.shopping_selected_supermarket!.id!}).then(r => {
            useUserPreferenceStore().deviceSettings.shopping_selected_supermarket = r
        }).catch(err => {
            if (err instanceof ResponseError && err.response.status == 404) {
                useUserPreferenceStore().deviceSettings.shopping_selected_supermarket = null
            }
        })
    }

    loadSupermarkets()
    useShoppingStore().loadShoppingLists()
})

/**
 * update the number of servings for an embedded recipe and with it the ShoppingListEntry amounts
 * @param recipe ShoppingListRecipe to update
 * @param servings number of servings to set the recipe to
 */
function updateRecipeServings(recipe: ShoppingListRecipe, servings: number) {
    let api = new ApiApi()
    useShoppingStore().currentlyUpdating = true

    recipe.servings = servings
    api.apiShoppingListRecipeUpdate({id: recipe.id!, shoppingListRecipe: recipe}).then(r => {
        useShoppingStore().currentlyUpdating = false
        useShoppingStore().refreshFromAPI()
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        useShoppingStore().currentlyUpdating = false
    })
}

/**
 * run the autosync function in a loop
 */
function autoSyncLoop() {
    // this should not happen in production but sometimes in development with HMR
    clearTimeout(useShoppingStore().autoSyncTimeoutId)

    let timeout = Math.max(useUserPreferenceStore().userSettings.shoppingAutoSync!, 1) * 1000 // if disabled (shopping_auto_sync=0) check again after 1 second if enabled

    useShoppingStore().autoSyncTimeoutId = setTimeout(() => {
        if (useUserPreferenceStore().userSettings.shoppingAutoSync! > 0) {
            useShoppingStore().autoSync()
        }
        autoSyncLoop()
    }, timeout)
}

/**
 * cancel auto sync loop before leaving to another page
 */
onBeforeRouteLeave(() => {
    clearTimeout(useShoppingStore().autoSyncTimeoutId)
})

/**
 * delete shopping list recipe
 */
function deleteListRecipe(slr: ShoppingListRecipe) {
    let api = new ApiApi()

    api.apiShoppingListRecipeDestroy({id: slr.id!}).then(r => {
        useShoppingStore().refreshFromAPI()
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

/**
 * load a list of supermarkets
 */
function loadSupermarkets() {
    let api = new ApiApi()

    api.apiSupermarketList().then(r => {
        supermarkets.value = r.results
        // TODO either recursive or add a "favorite" attribute to supermarkets for them to display at all
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}


function batchUpdateShoppingLists() {
    const selectedEntries = selectedLines.value.flatMap(slf => Array.from(slf.entries.values()))
    useShoppingStore().updateEntryShoppingLists(selectedEntries, selectedShoppingLists.value)
    selectedLines.value = []
}

function batchUpdateCategories(category: SupermarketCategory) {
    useShoppingStore().updateCategories(selectedLines.value, category)
    selectedLines.value = []
}

</script>

<style scoped>

</style>