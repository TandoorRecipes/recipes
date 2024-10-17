<template>
    <v-tabs v-model="currentTab" grow>
        <v-tab value="shopping"><i class="fas fa-shopping-cart fa-fw"></i> <span class="d-none d-md-block ms-1">{{ $t('Shopping_list') }}</span></v-tab>
        <v-tab value="recipes"><i class="fas fa-book fa-fw"></i> <span class="d-none d-md-block ms-1">{{ $t('Recipes') }}</span></v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
        <v-window-item value="shopping">
            <v-container>
                <v-row>
                    <v-col>
                        <v-text-field :label="$t('Shopping_input_placeholder')" @keyup.enter="addIngredient()" v-model="ingredientInput">
                            <template #append>
                                <v-btn
                                    @click="addIngredient()"
                                    :icon="ingredientInputIcon"
                                    color="create"
                                ></v-btn>
                            </template>
                        </v-text-field>

                        <v-list lines="two" density="compact">

                            <template v-for="category in useShoppingStore().getEntriesByGroup">
                                <v-list-subheader>{{ category.name }}</v-list-subheader>
                                <v-divider></v-divider>

                                <template v-for="[i, value] in category.foods" :key="i">
                                    <shopping-line-item :entries="Array.from(value.entries.values())"></shopping-line-item>
                                </template>
                            </template>
                        </v-list>
                    </v-col>
                </v-row>
            </v-container>
        </v-window-item>
        <v-window-item value="recipes">
            {{ $t('Recipes') }}
        </v-window-item>
    </v-window>

</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ApiApi, Food, IngredientString, ShoppingListEntry, Unit} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";

const currentTab = ref("shopping")

const ingredientInput = ref('')
const ingredientInputIcon = ref('fa-solid fa-plus')

onMounted(() => {
    useShoppingStore().refreshFromAPI()
})

function addIngredient() {
    const api = new ApiApi()

    api.apiIngredientFromStringCreate({ingredientString: {text: ingredientInput.value} as IngredientString}).then(r => {
        useShoppingStore().createObject({
            amount: r.amount,
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