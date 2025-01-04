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

        <tr v-for="i in ingredients" :key="i.id" @click="i.checked = !i.checked">
            <template v-if="i.isHeader">
                <td colspan="5" class="font-weight-bold">{{ i.note }}</td>
            </template>
            <template v-else>
                <td style="width: 1%; text-wrap: nowrap" class="pa-0">
                    <v-checkbox-btn v-model="i.checked" color="success" v-if="!i.isHeader"></v-checkbox-btn>
                </td>
                <td style="width: 1%; text-wrap: nowrap" class="pr-1">{{ i.amount * props.ingredientFactor }}</td>
                <td style="width: 1%; text-wrap: nowrap" class="pr-1">
                    <template v-if="i.unit"> {{ i.unit.name }}</template>
                </td>
                <td>
                    <template v-if="i.food"> {{ i.food.name }}</template>
                </td>

                <td style="width: 1%; text-wrap: nowrap">
                    <v-icon class="far fa-comment float-right" v-if="i.note != '' && i.note != undefined">
                        <v-tooltip activator="parent" open-on-click location="start">{{ i.note }}</v-tooltip>
                    </v-icon>
                </td>
            </template>
        </tr>
        </tbody>
    </v-table>

</template>

<script lang="ts" setup>
import {Ingredient} from "@/openapi";
import {computed} from "vue";

const ingredients = defineModel<Ingredient[]>({required: true})

const props = defineProps({
    showNotes: {
        type: Boolean,
        default: true
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
})

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

</script>


<style scoped>

</style>