<template>
    <v-card :to="`/recipe/${recipe.id}`">

        <v-img
            cover
            height="250"
            :src="recipe.image"
        ></v-img>

        <v-card-item>
            <v-card-title>{{ recipe.name }}</v-card-title>

            <v-card-subtitle>
                <KeywordsComponent :keywords="recipe.keywords"></KeywordsComponent>
            </v-card-subtitle>
        </v-card-item>

        <v-card-text>
            <v-row align="center" class="mx-0" v-if="recipe.rating">
                <v-rating
                    :model-value="recipe.rating"
                    color="amber"
                    density="compact"
                    half-increments
                    readonly
                    size="small"
                ></v-rating>

                <div class="text-grey ms-4">
                    {{ recipe.rating }}
                </div>
            </v-row>

            <div>{{ recipe.description }}</div>
        </v-card-text>

    </v-card>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import KeywordsComponent from "@/components/display/KeywordsComponent.vue";
import {Recipe} from "@/openapi";

export default defineComponent({
    name: "RecipeCardComponent",
    components: {KeywordsComponent},
    props: {
        recipe: {} as Recipe
    }
})
</script>

<style scoped>

</style>