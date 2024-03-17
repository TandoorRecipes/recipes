<template>
    <v-card :to="`/recipe/${recipe.id}`">

        <v-img v-if="recipe.image != null"
            cover
            height="50%"
            :src="recipe.image"
        ></v-img>
        <v-img v-else src="../../assets/recipe_no_image.svg" cover
            height="50%"></v-img>

        <v-card-item>
            <v-card-title>{{ recipe.name }}</v-card-title>

            <v-card-subtitle v-if="show_keywords">
                <KeywordsComponent :keywords="recipe.keywords"></KeywordsComponent>
            </v-card-subtitle>
        </v-card-item>

        <v-card-text v-if="show_description">
            <v-row align="center" class="mx-0" v-if="recipe.rating">
                <v-rating
                    :model-value="recipe.rating"
                    color="amber"
                    density="compact"
                    half-increments
                    readonly
                    size="small"
                ></v-rating>

                <div class="text-grey ">
                    {{ recipe.rating }}
                </div>
            </v-row>

            <div>{{ recipe.description }}</div>
        </v-card-text>

    </v-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import {Recipe, RecipeOverview} from "@/openapi";

export default defineComponent({
    name: "RecipeCard",
    components: {KeywordsComponent},
    props: {
        recipe: {type: {} as PropType<Recipe|RecipeOverview>, required: true,},
        show_keywords: {type: Boolean, required: false},
        show_description: {type: Boolean, required: false},
    }
})
</script>

<style scoped>

</style>