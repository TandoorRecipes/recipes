<template>
    <v-row justify="space-between">
        <v-col>
            <h2>{{ title }}</h2>
        </v-col>
        <v-col>
            <v-btn density="default" variant="outlined" size="x-small" icon="fas fa-chevron-left" @click="scrollList('left', scroll_id)"></v-btn>
            <v-btn density="default" variant="outlined" size="x-small" icon="fas fa-chevron-right" @click="scrollList('right', scroll_id)"></v-btn>
        </v-col>
    </v-row>

    <v-row>
        <v-col>

            <v-infinite-scroll direction="horizontal" mode="manual" :id="scroll_id">

                <div v-for="r in recipes" class="mr-2">
                    <recipe-card :recipe="r" :show_description="false" :show_keywords="false" style="width: 45vw; height: 30vh"></recipe-card>
                </div>

                <template #load-more></template>

            </v-infinite-scroll>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Recipe, RecipeOverview} from "@/openapi";
import RecipeCard from "@/components/display/RecipeCard.vue";

export default defineComponent({
    name: "HorizontalRecipeScroller",
    components: {RecipeCard},
    props: {
        title: {type: String, required: true},
        recipes: {type: Array as PropType<Array<Recipe | RecipeOverview>>, required: true},
    },
    data() {
        return {
            scroll_id: Math.random(1000).toString()
        }
    },
    methods: {
        scrollList(direction: string, target: string) {
            const newRecipeScroll = document.getElementById(target)
            if (newRecipeScroll != null) {
                newRecipeScroll.scrollLeft = newRecipeScroll.scrollLeft + (200 * ((direction == 'left') ? -1 : 1))
            }
        }
    }
})
</script>


<style scoped>

</style>