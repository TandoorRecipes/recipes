<template>
    <v-text-field :label="$t('Shopping_input_placeholder')" density="compact" @keyup.enter="addIngredient()" v-model="ingredientInput" :loading="props.loading" hide-detail
                  v-if="!useUserPreferenceStore().deviceSettings.shopping_input_autocomplete" s>
        <template #append>
            <v-btn
                density="comfortable"
                @click="addIngredient()"
                :icon="ingredientInputIcon"
                color="create"
            ></v-btn>
        </template>
    </v-text-field>

    <Multiselect
        v-if="useUserPreferenceStore().deviceSettings.shopping_input_autocomplete"
        :placeholder="$t('Shopping_input_placeholder')"
        class="material-multiselect "
        v-model="ingredientModelInput"
        :options="search"
        :on-create="createObject"
        create-option
        @select="selectObject"
        valueProp="id"
        label="name"
        :delay="300"
        :searchable="true"
        :strict="false"
        :classes="{
                dropdown: 'multiselect-dropdown z-3000',
                containerActive: '',
            }"
    />
</template>

<script setup lang="ts">


import {PropType, ref} from "vue";
import {ApiApi, Food, IngredientString, MealPlan, ShoppingListEntry, ShoppingListRecipe, Unit} from "@/openapi";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import Multiselect from "@vueform/multiselect";
import {fa} from "vuetify/iconsets/fa";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const props = defineProps({
    shoppingListRecipe: {type: {} as PropType<ShoppingListRecipe>, required: false},
    mealPlan: {type: {} as PropType<MealPlan>, required: false},
    loading: {type: Boolean, required: false},
})

const ingredientInput = ref('')
const ingredientInputIcon = ref('fa-solid fa-plus')

const ingredientModelInput = ref({} as Food)
const searchQuery = ref('')

const loading = ref(false)

/**
 * add new ingredient from ingredient text input
 */
function addIngredient(amount: number, unit: Unit|null, food: Food|null) {
    let sle = {
        amount: Math.max(amount, 1),
        unit: unit,
        food: food,
    } as ShoppingListEntry

    if (props.mealPlan) {
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
}

function parseIngredient() {
    const api = new ApiApi()
    loading.value = true

    api.apiIngredientFromStringCreate({ingredientString: {text: ingredientInput.value} as IngredientString}).then(r => {
        addIngredient(r.amount, r.unit, r.food)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        loading.value = false
    })
}

// ----------- FUNCTIONS FOR TESTING MULTISELECT INPUT -------------

function createObject(object: any, select$: Multiselect) {
    ingredientInput.value = object['name']
    ingredientModelInput.value = {} as Food
    select$.close()
    select$.clearSearch()
    parseIngredient()
    return false
}

function selectObject(foodId: number, food: Food, select$: Multiselect) {
    //ingredientInput.value = food.name
    ingredientModelInput.value = {} as Food
    addIngredient(1, null, food)
    return false
}

/**
 * performs the API request to search for the selected input
 * @param query input to search for on the API
 */
function search(query: string) {
    loading.value = true
    let api = new ApiApi()

    return api.apiFoodList({query: query, page: 1, pageSize: 25}).then(r => {
        return r.results
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<!-- style can't be scoped (for whatever reason) -->
<style>
.material-multiselect {
    --ms-bg: rgba(210, 210, 210, 0.1);
    --ms-border-color: 0;
    --ms-border-color-active: 0;
    border-bottom: inset 1px rgba(50, 50, 50, 0.8);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.model-select--density-compact {
    --ms-line-height: 1.3;
}

.model-select--density-comfortable {
    --ms-line-height: 1.8;
}

.model-select--density-default {
    --ms-line-height: 2.3;
}


.multiselect-tag {
    background-color: #b98766 !important;
}

.z-3000 {
    z-index: 3000;
}
</style>
