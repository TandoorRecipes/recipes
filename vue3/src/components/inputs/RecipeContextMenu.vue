<template>

    <v-menu open-on-hover open-delay="0" :open-on-click="true">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="fas fa-ellipsis-v" variant="plain"></v-btn>
        </template>

        <v-list>
            <v-list-item>
                <v-list-item-title @click="openRecipe()"><i class="fas fa-edit fa-fw mr-2"></i> Edit</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Recipe, RecipeFlat, RecipeOverview} from "@/openapi";

export default defineComponent({
    name: "RecipeContextMenu",
    props: {
        recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true}
    },
    methods: {
        openRecipe: function () {
            this.$router.push({name: 'edit_recipe', params: {recipe_id: this.recipe.id}})
        }
    }
})
</script>


<style scoped>

</style>