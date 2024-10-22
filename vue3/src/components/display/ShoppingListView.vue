<template>
    <v-tabs v-model="currentTab" >
        <v-tab value="shopping"><i class="fas fa-shopping-cart fa-fw"></i> <span class="d-none d-md-block ms-1">{{ $t('Shopping_list') }}</span></v-tab>
        <v-tab value="recipes"><i class="fas fa-book fa-fw"></i> <span class="d-none d-md-block ms-1">{{ $t('Recipes') }}</span></v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
        <v-window-item value="shopping">
            <v-container>
                <v-row>
                    <v-col>
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

                        <v-list class="mt-3" density="compact">
                            <template v-for="category in useShoppingStore().getEntriesByGroup" :key="category.name">
                                <template v-if="(category.stats.countUnchecked > 0 || useUserPreferenceStore().deviceSettings.shopping_show_checked_entries)
                                && (category.stats.countUnchecked + category.stats.countChecked) > 0
                                && (category.stats.countUncheckedDelayed < category.stats.countUnchecked || useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries)">

                                    <v-list-subheader v-if="category.name === useShoppingStore().UNDEFINED_CATEGORY"><i>{{ $t('NoCategory') }}</i></v-list-subheader>
                                    <v-list-subheader v-else>{{ category.name }}</v-list-subheader>
                                    <v-divider></v-divider>

                                    <template v-for="[i, value] in category.foods" :key="value.food.id">
                                        <shopping-line-item :entries="Array.from(value.entries.values())" @clicked="args => {shoppingLineItemDialog = true; shoppingLineItemDialogFood = value;}"></shopping-line-item>
                                    </template>

                                </template>
                            </template>
                        </v-list>
                    </v-col>
                </v-row>
            </v-container>
        </v-window-item>
        <v-window-item value="recipes">
            <v-card>
                <v-card-title>{{ $t('Recipes') }}</v-card-title>
                <v-card-text>

                    <v-label>{{ $t('Add_to_Shopping') }}</v-label>
                    <ModelSelect model="Recipe"></ModelSelect>

                    <v-label>{{ $t('Recipes') }}</v-label>
                    <v-list>
                        <v-list-item v-for="r in useShoppingStore().getAssociatedRecipes()">
                            {{r}}
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-window-item>
    </v-window>

    <shopping-line-item-dialog v-model="shoppingLineItemDialog" :shopping-list-food="shoppingLineItemDialogFood"></shopping-line-item-dialog>

</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ApiApi, Food, IngredientString, ShoppingListEntry, Unit} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import ShoppingLineItemDialog from "@/components/dialogs/ShoppingLineItemDialog.vue";
import {IShoppingListFood} from "@/types/Shopping";

const currentTab = ref("shopping")

const ingredientInput = ref('')
const ingredientInputIcon = ref('fa-solid fa-plus')

const shoppingLineItemDialog = ref(false)
const shoppingLineItemDialogFood = ref({} as IShoppingListFood)

onMounted(() => {
    useShoppingStore().refreshFromAPI()
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
        } as ShoppingListEntry)
        ingredientInput.value = ''

        ingredientInputIcon.value = 'fa-solid fa-check'
        setTimeout(() => {
            ingredientInputIcon.value = 'fa-solid fa-plus'
        }, 1000)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>