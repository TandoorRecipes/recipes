<template>
    <!-- Daily nutrition summary card -->
    <v-card v-if="mealPlan.id === -999" class="card cv-item pa-0"
            :style="{'top': itemTop, 'height': 'auto', 'background-color': '#f5f5f5', 'border-color': '#ccc'}"
            :key="value.id"
            :class="value.classes"
            flat>
        <v-card-text class="pa-1" style="font-size: 0.7rem; line-height: 1.3">
            <div><strong style="color: #e65100">{{ Math.round(mealPlan.nutrition?.calories ?? 0) }} kcal</strong></div>
            <div style="color: #c62828">Protein: {{ Math.round(mealPlan.nutrition?.proteins ?? 0) }}g</div>
            <div style="color: #1565c0">Carbs: {{ Math.round(mealPlan.nutrition?.carbohydrates ?? 0) }}g</div>
            <div style="color: #2e7d32">Fat: {{ Math.round(mealPlan.nutrition?.fats ?? 0) }}g</div>
            <div style="color: #6a1b9a">Sat. fat: {{ Math.round(mealPlan.nutrition?.saturatedFats ?? 0) }}g</div>
            <div style="color: #00838f">Sugar: {{ Math.round(mealPlan.nutrition?.sugars ?? 0) }}g</div>
        </v-card-text>
    </v-card>
    <!-- Regular meal plan card -->
    <v-card v-else class="card cv-item pa-0" hover
            :style="{'top': itemTop, 'height': itemHeight, 'border-color': mealPlan.mealType.color}"
            :draggable="true"
            :key="value.id"
            @dragstart="emit('onDragStart', value, $event)"
            :class="value.classes">
        <v-card-text class="pa-0">
            <div class="d-flex flex-row align-items-center">
                <div class="flex-column" v-if="detailedItems">
                    <recipe-image :height="itemHeight" :width="itemHeight" :recipe="mealPlan.recipe"></recipe-image>
                </div>
                <div class="flex-column flex-grow-0 pa-1">
                    <span class="font-light" :class="{'three-line-text': detailedItems,'one-line-text': !detailedItems,}">
                       <i class="fas fa-shopping-cart fa-xs float-left" v-if="mealPlan.shopping"/>
                        {{ itemTitle }}
                    </span>
                </div>
            </div>
            <model-edit-dialog model="MealPlan" :item="mealPlan" @delete="(args: MealPlan) => emit('delete', args)"></model-edit-dialog>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">

import {computed, PropType} from "vue";
import {IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";
import RecipeImage from "@/components/display/RecipeImage.vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {MealPlan} from "@/openapi";

const emit = defineEmits({
    onDragStart: (value: IMealPlanNormalizedCalendarItem, event: DragEvent) => {
        return true
    },
    delete: (value: MealPlan) => {
        return true
    }
})

let props = defineProps({
    value: {type: {} as PropType<IMealPlanNormalizedCalendarItem>, required: true},
    itemHeight: {type: String,},
    itemTop: {type: String,},
    detailedItems: {type: Boolean, default: true}
})

const mealPlan = computed(() => {
    return props.value.originalItem.mealPlan
})

const itemTitle = computed(() => {
    if (mealPlan.value.recipe != undefined) {
        return mealPlan.value.recipe.name
    } else if (mealPlan.value.title != null && mealPlan.value.title !== "") {
        return mealPlan.value.title
    } else {
        return 'ERROR'
    }
})


</script>

<style scoped>

.two-line-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.one-line-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.three-line-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
