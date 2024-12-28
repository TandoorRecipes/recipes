<template>
    <v-text-field :label="$t('Shopping_input_placeholder')" density="compact" @keyup.enter="addIngredient()" v-model="ingredientInput" :loading="props.loading" hide-details>
        <template #append>
            <v-btn
                density="comfortable"
                @click="addIngredient()"
                :icon="ingredientInputIcon"
                color="create"
            ></v-btn>
        </template>
    </v-text-field>
</template>

<script setup lang="ts">


import {PropType, ref} from "vue";
import {ApiApi, IngredientString, MealPlan, ShoppingListEntry, ShoppingListRecipe} from "@/openapi";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    shoppingListRecipe: {type: {} as PropType<ShoppingListRecipe>, required: false},
    mealPlan: {type: {} as PropType<MealPlan>, required: false},
    loading: {type: Boolean, required: false},
})

const ingredientInput = ref('')
const ingredientInputIcon = ref('fa-solid fa-plus')

const loading = ref(false)

/**
 * add new ingredient from ingredient text input
 */
function addIngredient() {
    const api = new ApiApi()
    loading.value = true

    api.apiIngredientFromStringCreate({ingredientString: {text: ingredientInput.value} as IngredientString}).then(r => {
        let sle = {
            amount: Math.max(r.amount, 1),
            unit: r.unit,
            food: r.food,
        } as ShoppingListEntry

        console.log('adding SLR ? ', props.mealPlan)
        if (props.mealPlan) {
            console.log('yes')
            sle.mealplanId = props.mealPlan.id
        }

        useShoppingStore().createObject(sle, true).finally(() => {
            loading.value = false
        })
        ingredientInput.value = ''

        ingredientInputIcon.value = 'fa-solid fa-check'
        setTimeout(() => {
            ingredientInputIcon.value = 'fa-solid fa-plus'
        }, 1000)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        loading.value = false
    })
}

</script>


<style scoped>

</style>