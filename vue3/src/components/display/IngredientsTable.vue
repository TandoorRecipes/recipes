<template>
    <v-table density="compact" v-if="ingredients.length > 0">

        <template v-if="draggable">
            <draggable tag="tbody" v-model="mutable_ingredients" handle=".drag-handle" item-key="id">
                <template #item="{element}">
                    <IngredientsTableRow :ingredient="element" :key="element.id" :show-notes="showNotes" :draggable="draggable"></IngredientsTableRow>
                </template>
            </draggable>
        </template>
        <template v-else>
            <tbody>
            <!-- TODO make into one condition so there is no duplicate code possibly by disabling dragging when not enabled?! -->
            <IngredientsTableRow v-for="i in ingredients" :ingredient="i" :key="i.id" :show-notes="showNotes" :draggable="draggable"></IngredientsTableRow>
            </tbody>
        </template>


    </v-table>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Ingredient, Step} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import draggable from 'vuedraggable'

export default defineComponent({
    name: "IngredientsTable",
    components: {IngredientsTableRow, draggable},
    props: {
        ingredients: {
            type: Array as PropType<Array<Ingredient>>,
            default: [],
        },
        showNotes: {
            type: Boolean,
            default: true
        },
        draggable: {
            type: Boolean,
        },
    },
    data() {
        return {
            mutable_ingredients: [] as Ingredient[]
        }
    },
    mounted() {
        this.mutable_ingredients = this.ingredients
    }
})
</script>


<style scoped>

</style>