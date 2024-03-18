<template>
    <v-row justify="space-between">
        <v-col>
            <h2><i v-if="icon != 'undefined'" :class="icon + ' fa-fw'"></i>  {{ title }}</h2>
        </v-col>
    </v-row>

    <v-row class="mt-0" v-if="recipeWindows.length > 0">
        <v-col>
            <v-window show-arrows>
                <v-window-item v-for="w in recipeWindows" class="pt-1 pb-1">
                    <v-row>
                        <v-col v-for="r in w" :key="r.id">
                            <recipe-card :recipe="r" :show_description="true" :show_keywords="true" style="height: 25vh"></recipe-card>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-col>
    </v-row>
    <v-row v-if="recipeWindows.length == 0 && skeletons > 0">
        <v-col>
            <v-window >
                <v-window-item>
                    <v-row>
                        <v-col v-for="n in skeletons">
                            <v-skeleton-loader :elevation="3" type="card"></v-skeleton-loader>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-col>
    </v-row>

</template>


<script lang="ts" setup>
import {computed, PropType, toRefs} from 'vue'
import RecipeCard from "@/components/display/RecipeCard.vue";
import {useDisplay} from "vuetify";
import {Recipe, RecipeOverview} from "@/openapi";

const {mdAndUp} = useDisplay()

const props = defineProps(
    {
        title: {type: String as PropType<undefined|String>, required: true},
        icon: {type: String, required: false},
        skeletons: {type: Number, default: 0},
        recipes: {
            type: Array as PropType<Recipe[] | RecipeOverview[]>,
            required: true
        },
    }
)
const {title, recipes} = toRefs(props)

let numberOfCols = computed(() => {
    return mdAndUp.value ? 5 : 2
})

type CustomWindow = {
    id: number,
    recipes: Array<Recipe | RecipeOverview>
}

let recipeWindows = computed(() => {
    let windows = []
    let current_window = []
    for (const [i, r] of recipes?.value.entries()) {
        current_window.push(r)

        if (i % numberOfCols.value == numberOfCols.value - 1) {
            if (current_window.length > 0) {
                windows.push(current_window)
            }
            current_window = []
        }
    }
    if (current_window.length > 0) {
        windows.push(current_window)
    }
    return windows
})

</script>


<style scoped>

</style>