<template>
    <v-row justify="space-between">
        <v-col>
            <h2><i class="fas fa-calendar-week fa-fw"></i> Meal Plans</h2>
        </v-col>
    </v-row>

    <v-row class="mt-0" v-if="mealPlanWindows.length > 0">
        <v-col>
            <v-window show-arrows>
                <v-window-item v-for="w in mealPlanWindows" class="pt-1 pb-1">
                    <v-row>
                        <v-col v-for="mealPlanGridItem in w">
                            <v-list density="compact" class="pt-0 pb-0">
                                <v-list-item>

                                    <div class="d-flex justify-space-between">
                                        <div class="align-self-center">
                                            {{ mealPlanGridItem.date_label }}
                                        </div>
                                        <div class="align-self-center">
                                            <v-btn variant="flat" icon="fas fa-plus" size="small"></v-btn>
                                        </div>
                                    </div>

                                </v-list-item>
                                <v-divider v-if="mealPlanGridItem.plan_entries.length > 0"></v-divider>
                                <v-list-item v-for="p in mealPlanGridItem.plan_entries">
                                    <template #prepend>
                                        <v-avatar :image="p.recipe.image" v-if="p.recipe?.image"></v-avatar>
                                        <v-avatar image="../../assets/recipe_no_image.svg" v-else></v-avatar>
                                    </template>
                                    <v-list-item-title>
                                        <span v-if="p.recipe">{{ p.recipe.name }}</span>
                                        <span v-else>{{ p.title }}</span>
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ p.mealType.name }}
                                    </v-list-item-subtitle>
                                </v-list-item>

                            </v-list>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-col>
    </v-row>
    <v-row v-if="mealPlanWindows.length == 0 && skeletons > 0">
        <v-col>
            <v-window>
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
import {computed, onMounted, PropType, ref, toRefs} from 'vue'
import RecipeCard from "@/components/display/RecipeCard.vue";
import {useDisplay} from "vuetify";
import {MealPlan, Recipe, RecipeOverview} from "@/openapi";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {DateTime} from "luxon";

const {mdAndUp} = useDisplay()
const loading = ref(false)

let numberOfCols = computed(() => {
    return mdAndUp.value ? 5 : 2
})

type MealPlanGridItem = {
    date: DateTime,
    create_default_date: String,
    date_label: String,
    plan_entries: Array<MealPlan>,
}

const meal_plan_grid = computed(() => {
    let grid = [] as MealPlanGridItem[]

    if (useMealPlanStore().plan_list.length > 0) {
        console.log('found plans')
        for (const x of Array(4).keys()) {
            let grid_day_date = DateTime.now().plus({days: x})
            console.log('going trough days ', x, grid_day_date)
            grid.push({
                date: grid_day_date,
                create_default_date: grid_day_date.toISODate(), // improve meal plan edit modal to do formatting itself and accept dates
                date_label: grid_day_date.toLocaleString(DateTime.DATE_MED),
                plan_entries: useMealPlanStore().plan_list.filter(m => (DateTime.fromJSDate(m.fromDate) <= grid_day_date && DateTime.fromJSDate((m.toDate != undefined) ? m.toDate : m.fromDate) >= grid_day_date)),
            } as MealPlanGridItem)
        }
    }
    return grid
})

let mealPlanWindows = computed(() => {
    let windows = [] as Array<Array<MealPlanGridItem>>
    let current_window = [] as Array<MealPlanGridItem>
    for (const [i, mealPlanGridItem] of meal_plan_grid.value.entries()) {
        current_window.push(mealPlanGridItem)

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

onMounted(() => {
    loading.value = true
    useMealPlanStore().refreshFromAPI(DateTime.now().toJSDate(), DateTime.now().plus({days: 7}).toJSDate()).finally(() => {
        loading.value = false
    })
})

</script>


<style scoped>

</style>