<template>
    <!--    <v-row justify="space-between">-->
    <!--        <v-col>-->
    <!--            <h2><i class="fas fa-calendar-week fa-fw"></i> Meal Plans</h2>-->
    <!--        </v-col>-->
    <!--    </v-row>-->

    <v-row class="mt-0" v-if="mealPlanWindows.length > 0">
        <v-col>
            <v-window v-model="currentWindowIndex">
                <v-window-item v-for="(w, i) in mealPlanWindows" :value="i" class="pt-1 pb-1">
                    <v-row>
                        <v-col v-for="mealPlanGridItem in w">
                            <v-list density="compact" class="pt-0 pb-0">
                                <v-list-item class="text-center">
                                    <div class="d-flex ">
                                        <div class="flex-col align-self-start">
                                            <v-btn @click="currentWindowIndex--" v-if="currentWindowIndex != 0" icon="fa-solid fa-chevron-left" size="small"></v-btn>
                                        </div>
                                        <div class="flex-col flex-grow-1 mt-auto mb-auto">
                                            {{ mealPlanGridItem.date_label }}
                                        </div>
                                        <div class="flex-col align-self-end">
                                            <v-btn @click="currentWindowIndex++" v-if="currentWindowIndex + 1 < mealPlanWindows.length" icon="fa-solid fa-chevron-right"
                                                   size="small"></v-btn>
                                        </div>
                                    </div>
                                </v-list-item>
                                <v-divider v-if="mealPlanGridItem.plan_entries.length > 0"></v-divider>
                                <v-list-item v-for="p in mealPlanGridItem.plan_entries" :key="p.id" @click="clickMealPlan(p)" link>
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
                                    <model-edit-dialog model="MealPlan" :item="p" v-if="!p.recipe"></model-edit-dialog>
                                    <template #append>
                                        <v-btn icon variant="plain">
                                            <v-icon icon="$menu"></v-icon>
                                            <v-menu activator="parent">
                                                <v-list>
                                                    <v-list-item prepend-icon="$edit" link>
                                                        {{ $t('Edit') }}
                                                        <model-edit-dialog model="MealPlan" :item="p"></model-edit-dialog>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </v-btn>
                                    </template>
                                </v-list-item>
                                <v-list-item class="text-center cursor-pointer" variant="tonal">
                                    <model-edit-dialog model="MealPlan" :item-defaults="{fromDate: mealPlanGridItem.date.toJSDate()}" :close-after-create="false"
                                                       :close-after-save="false"></model-edit-dialog>
                                    <v-icon icon="$create" size="small"></v-icon>
                                </v-list-item>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-col>
    </v-row>

</template>


<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useDisplay} from "vuetify";
import {MealPlan} from "@/openapi";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {DateTime} from "luxon";
import {homePageCols} from "@/utils/breakpoint_utils";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const {name} = useDisplay()

const loading = ref(false)
const currentWindowIndex = ref(0)

let numberOfCols = computed(() => {
    return homePageCols(name.value)
})

type MealPlanGridItem = {
    date: DateTime,
    create_default_date: String,
    date_label: String,
    plan_entries: Array<MealPlan>,
}

const meal_plan_grid = computed(() => {
    let grid = [] as MealPlanGridItem[]

    for (const x of Array(4).keys()) {
        let grid_day_date = DateTime.now().plus({days: x})
        grid.push({
            date: grid_day_date,
            create_default_date: grid_day_date.toISODate(), // improve meal plan edit modal to do formatting itself and accept dates
            date_label: grid_day_date.toLocaleString({
                weekday: 'short',
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
            }),
            plan_entries: useMealPlanStore().planList.filter((m: MealPlan) => ((DateTime.fromJSDate(m.fromDate).startOf('day') <= grid_day_date.startOf('day')) && (DateTime.fromJSDate((m.toDate != undefined) ? m.toDate : m.fromDate).startOf('day') >= grid_day_date.startOf('day')))),
        } as MealPlanGridItem)
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

function clickMealPlan(plan: MealPlan) {
    if (plan.recipe) {
        router.push({name: 'RecipeViewPage', params: {id: plan.recipe.id}})
    }
}

</script>


<style scoped>

</style>