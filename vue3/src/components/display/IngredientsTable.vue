<template>
    <!--    <v-table density="compact" v-if="ingredients.length > 0">-->

    <!--        <tbody>-->
    <!--        <ingredients-table-row v-for="(ing, i) in ingredients" v-model="ingredients[i]" :key="ing.id" :show-notes="props.showNotes"-->
    <!--                               :ingredient-factor="ingredientFactor"></ingredients-table-row>-->
    <!--        </tbody>-->

    <!--    </v-table>-->

    <!--    <v-data-table :items="ingredients" hide-default-footer hide-default-header :headers="tableHeaders" density="compact" v-if="ingredients.length > 0" @click:row="handleRowClick"-->
    <!--                  items-per-page="0">-->
    <!--        <template v-slot:item.checked="{ item }">-->
    <!--            <v-checkbox-btn v-model="item.checked" color="success" v-if="!item.isHeader"></v-checkbox-btn>-->
    <!--        </template>-->
    <!--        <template v-slot:item.amount="{ item }">-->
    <!--            <template v-if="item.isHeader"><p style="width: 100px"><b>{{ item.note }}</b></p></template>-->
    <!--            <template v-else>{{ item.amount * props.ingredientFactor }}</template>-->
    <!--        </template>-->

    <!--        <template v-slot:item.note="{ item }">-->
    <!--            <v-icon class="far fa-comment float-right" v-if="item.note != '' && item.note != undefined">-->
    <!--                <v-tooltip activator="parent" open-on-click location="start">{{ item.note }}</v-tooltip>-->
    <!--            </v-icon>-->
    <!--        </template>-->
    <!--    </v-data-table>-->

    <v-table density="compact">
        <tbody>
        <template v-for="i in ingredients" :key="i.id">
            <tr @click="i.checked = !i.checked">
                <template v-if="i.isHeader">
                    <td colspan="5" class="font-weight-bold">{{ i.note }}</td>
                </template>
                <template v-else>
                    <td style="width: 1%; text-wrap: nowrap" class="pa-0 d-print-none" v-if="showCheckbox">
                        <v-checkbox-btn v-model="i.checked" color="success" v-if="!i.isHeader"></v-checkbox-btn>
                    </td>
                    <!-- display calculated food amount or empty cell -->
                    <td style="width: 1%; text-wrap: nowrap"
                        class="pr-1"
                        v-html="calculateFoodAmount(i.amount, props.ingredientFactor, useUserPreferenceStore().userSettings.useFractions)"
                        v-if="!i.noAmount && i.amount != 0">
                    </td>
                    <td style="width: 1%; text-wrap: nowrap" class="pr-1" v-else></td>

                    <td style="width: 1%; text-wrap: nowrap" class="pr-1">
                        <template v-if="i.unit && !i.noAmount && i.amount != 0"> {{ ingredientToUnitString(i, ingredientFactor) }}</template>
                    </td>
                    <td>
                        <template v-if="i.food">
                            <router-link v-if="i.food.recipe" :to="{name: 'RecipeViewPage', params: {id: i.food.recipe.id}}">
                                {{ ingredientToFoodString(i, ingredientFactor) }}
                            </router-link>
                            <a v-else-if="i.food.url" :href="i.food.url" target="_blank">{{ ingredientToFoodString(i, ingredientFactor) }}</a>
                            <span v-else>{{ ingredientToFoodString(i, ingredientFactor) }}</span>

                        </template>
                    </td>
                    <td v-if="useUserPreferenceStore().isPrintMode">
                        <span class="text-disabled font-italic"> {{ i.note }}</span>
                    </td>
                    <td style="width: 1%; text-wrap: nowrap" v-if="!useUserPreferenceStore().isPrintMode">
                        <v-icon class="far fa-comment float-right" v-if="i.note != '' && i.note != undefined">
                            <v-tooltip activator="parent" open-on-click location="start">{{ i.note }}</v-tooltip>
                        </v-icon>
                    </td>
                    <td v-if="showActions">
                        <v-btn density="compact" variant="plain" @click.stop="" icon>
                            <v-icon icon="$menu"></v-icon>
                            <v-menu activator="parent">
                                <v-list>
                                    <v-list-item prepend-icon="fa-solid fa-sort-numeric-up">
                                        {{ $t('Scale') }}
                                        <number-scaler-dialog :number="i.amount * ingredientFactor"
                                                              @confirm="(target: number) => emit('scale', target/i.amount)"></number-scaler-dialog>
                                    </v-list-item>
                                    <v-list-item prepend-icon="$shopping" @click="addToShopping(i)">
                                        {{ $t('Shopping') }}
                                    </v-list-item>
                                    <v-list-item link v-if="i.food" :to="{name: 'ModelEditPage', params: { model:'Food', id: i.food.id}}" :prepend-icon="TFood.icon">
                                        {{ $t('Food') }}
                                    </v-list-item>
                                    <v-list-item link v-if="i.unit" :to="{name: 'ModelEditPage', params: { model:'Unit', id: i.unit.id}}" :prepend-icon="TUnit.icon">
                                        {{ $t('Unit') }}
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                    </td>
                </template>
            </tr>
        </template>
        </tbody>
    </v-table>

</template>

<script lang="ts" setup>
import {ApiApi, Ingredient, ShoppingListEntry} from "@/openapi";
import {computed} from "vue";
import {calculateFoodAmount} from "../../utils/number_utils";
import {useUserPreferenceStore} from "../../stores/UserPreferenceStore";
import {ingredientToFoodString, ingredientToUnitString} from "@/utils/model_utils.ts";
import {TFood, TUnit} from "@/types/Models.ts";
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";

const emit = defineEmits(['scale'])

const props = defineProps({
    showNotes: {
        type: Boolean,
        default: true
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
    showCheckbox: {
        type: Boolean,
        default: true
    },
    showActions: {
        type: Boolean,
        default: false
    },
})

const ingredients = defineModel<Ingredient[]>({required: true})

const tableHeaders = computed(() => {
    let headers = [
        {title: '', key: 'checked', align: 'start', width: '1%', noBreak: true, cellProps: {class: 'pa-0'}},
        {title: '', key: 'amount', align: 'start', width: '1%', noBreak: true, cellProps: {class: 'pr-1'}},
        {title: '', key: 'unit.name', align: 'start', width: '1%', noBreak: true, cellProps: {class: 'pr-1'}},
        {title: '', key: 'food.name'},
    ]
    if (props.showNotes) {
        headers.push(
            {title: '', key: 'note', align: 'end',}
        )
    }

    return headers
})

function handleRowClick(event: PointerEvent, data: any) {
    ingredients.value[data.index].checked = !ingredients.value[data.index].checked
}

function addToShopping(ingredient: Ingredient) {
    const api = new ApiApi()
    const sLE = {
        amount: ingredient.amount * props.ingredientFactor,
        unit: ingredient.unit,
        food: ingredient.food
    } as ShoppingListEntry
    api.apiShoppingListEntryCreate({shoppingListEntry: sLE}).then(r => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>


<style scoped>

</style>