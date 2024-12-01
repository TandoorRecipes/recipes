<template>
    <v-tabs v-model="currentTab">
        <v-tab value="shopping"><i class="fas fa-fw"
                                   :class="{'fa-circle-notch fa-spin':useShoppingStore().currentlyUpdating, 'fa-shopping-cart ': !useShoppingStore().currentlyUpdating}"></i> <span
            class="d-none d-md-block ms-1">{{ $t('Shopping_list') }} ({{ useShoppingStore().stats.countUnchecked }})</span></v-tab>
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
                <v-list-item @click="useShoppingStore().undoChange()" prepend-icon="fa-solid fa-arrow-rotate-left">{{ $t('Undo') }}</v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                    <v-select hide-details :items="groupingOptionsItems" v-model="useUserPreferenceStore().deviceSettings.shopping_selected_grouping" :label="$t('GroupBy')">
                    </v-select>
                </v-list-item>
                <v-list-item v-if="useUserPreferenceStore().deviceSettings.shopping_selected_grouping == ShoppingGroupingOptions.CATEGORY">
                    <v-switch color="primary" hide-details :label="$t('SupermarketCategoriesOnly')"
                              v-model="useUserPreferenceStore().deviceSettings.shopping_show_selected_supermarket_only"></v-switch>
                </v-list-item>
                <v-list-item>
                    <model-select model="Supermarket" v-model="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket"></model-select>
                </v-list-item>

                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('ShowDelayed')" v-model="useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries"></v-switch>
                </v-list-item>
                <v-list-item>
                    <v-switch color="primary" hide-details :label="$t('ShowRecentlyCompleted')"
                              v-model="useUserPreferenceStore().deviceSettings.shopping_show_checked_entries"></v-switch>
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
                <v-list-item v-if="useUserPreferenceStore().serverSettings.debug">
                    <v-switch color="primary" hide-details label="Show Debug Info" v-model="useUserPreferenceStore().deviceSettings.shopping_show_debug"></v-switch>
                </v-list-item>

            </v-list>
        </v-menu>
    </v-tabs>

    <v-window v-model="currentTab">
        <v-window-item value="shopping">
            <v-container>
                <v-row>
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

                        <v-text-field :label="$t('Shopping_input_placeholder')" density="compact" @keyup.enter="addIngredient()" v-model="ingredientInput" hide-details>
                            <template #append>
                                <v-btn
                                    density="comfortable"
                                    @click="addIngredient()"
                                    :icon="ingredientInputIcon"
                                    color="create"
                                ></v-btn>
                            </template>
                        </v-text-field>

                        <v-list class="mt-3" density="compact" v-if="!useShoppingStore().initialized">
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                            <v-skeleton-loader type="list-item"></v-skeleton-loader>
                        </v-list>
                        <v-list class="mt-3" density="compact" v-else>
                            <template v-for="category in useShoppingStore().getEntriesByGroup" :key="category.name">
                                <template v-if="isCategoryVisible(category)">

                                    <v-list-subheader v-if="category.name === useShoppingStore().UNDEFINED_CATEGORY"><i>{{ $t('NoCategory') }}</i></v-list-subheader>
                                    <v-list-subheader v-else>{{ category.name }}</v-list-subheader>
                                    <v-divider></v-divider>

                                    <template v-for="[i, value] in category.foods" :key="value.food.id">
                                        <shopping-line-item :shopping-list-food="value" :entries="Array.from(value.entries.values())"
                                                            @clicked="args => {shoppingLineItemDialog = true; shoppingLineItemDialogFood = value;}"></shopping-line-item>
                                    </template>

                                </template>
                            </template>
                        </v-list>

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
                                    <v-list-item v-for="i in useShoppingStore().undoStack" :key="i">{{ i.type }} {{ i.entries.flatMap(e => e.food.name) }}</v-list-item>
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
                            <v-card-title>{{ $t('Recipes') }}</v-card-title>
                            <v-card-text>

                                <v-label>{{ $t('Add_to_Shopping') }}</v-label>
                                <ModelSelect model="Recipe"></ModelSelect>

                                <v-label>{{ $t('Recipes') }}</v-label>
                                <v-list>
                                    <v-list-item v-for="r in useShoppingStore().getAssociatedRecipes()">
                                        {{ r.recipeName }}
                                        <template #append>
                                            <v-btn icon="$delete" color="delete"></v-btn>
                                            <number-scaler-dialog></number-scaler-dialog>
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
                        <SupermarketEditor :item="useUserPreferenceStore().deviceSettings.shopping_selected_supermarket"
                                           @save="(args: Supermarket) => (useUserPreferenceStore().deviceSettings.shopping_selected_supermarket = args)"></SupermarketEditor>
                    </v-col>
                </v-row>
            </v-container>

        </v-window-item>
    </v-window>

    <shopping-line-item-dialog v-model="shoppingLineItemDialog" v-model:shopping-list-food="shoppingLineItemDialogFood"></shopping-line-item-dialog>

</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ApiApi, Food, IngredientString, ShoppingListEntry, Supermarket, SupermarketCategory, Unit} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import ShoppingLineItemDialog from "@/components/dialogs/ShoppingLineItemDialog.vue";
import {IShoppingListCategory, IShoppingListFood, ShoppingGroupingOptions} from "@/types/Shopping";
import {useI18n} from "vue-i18n";
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue";
import SupermarketEditor from "@/components/model_editors/SupermarketEditor.vue";

const {t} = useI18n()

const currentTab = ref("shopping")

const ingredientInput = ref('')
const ingredientInputIcon = ref('fa-solid fa-plus')

const shoppingLineItemDialog = ref(false)
const shoppingLineItemDialogFood = ref({} as IShoppingListFood)

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
        })
    }
})

/**
 * add new ingredient from ingredient text input
 */
function addIngredient() {
    const api = new ApiApi()

    api.apiIngredientFromStringCreate({ingredientString: {text: ingredientInput.value} as IngredientString}).then(r => {
        useShoppingStore().createObject({
            amount: Math.max(r.amount, 1),
            unit: (r.unit != null) ? {name: r.unit} as Unit : null,
            food: {name: r.food} as Food,
        } as ShoppingListEntry, true)
        ingredientInput.value = ''

        ingredientInputIcon.value = 'fa-solid fa-check'
        setTimeout(() => {
            ingredientInputIcon.value = 'fa-solid fa-plus'
        }, 1000)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

/**
 * determines if a category as entries that should be visible
 * @param category
 */
function isCategoryVisible(category: IShoppingListCategory) {
    let entryCount = category.stats.countUnchecked

    if (useUserPreferenceStore().deviceSettings.shopping_show_checked_entries) {
        entryCount += category.stats.countChecked
    }
    if (useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries) {
        entryCount += category.stats.countUncheckedDelayed
    }
    return entryCount > 0
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

</script>

<style scoped>

</style>