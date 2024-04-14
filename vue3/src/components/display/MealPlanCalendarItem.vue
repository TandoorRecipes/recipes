<template>
    <div class="card cv-item meal-plan-card p-0"
         :style="{'top': itemTop, 'height': itemHeight, 'border-color': mealPlan.mealType.color}"
         :key="value.id"
         :class="value.classes"
    >

        <div class="d-flex flex-row align-items-center">
            <div class="flex-column">
                <img class="" style="object-fit: cover" :style="{'height': itemHeight, 'width': itemHeight}" :src="mealPlan.recipe.image"
                     v-if="mealPlan.recipe != undefined && detailedItems"/>
                <img class="" style="object-fit: cover" :style="{'height': itemHeight, 'width': itemHeight}" src="../../assets/recipe_no_image.svg"
                     v-if="detailedItems && ((mealPlan.recipe == undefined && mealPlan.note === '') || (mealPlan.recipe != undefined && mealPlan.recipe.image === null))"/>
            </div>
            <div class="flex-column flex-grow-0 align-middle justify-content-center">
                <div class="card-body p-0 pl-1 align-middle">

                    <span class="font-light" :class="{'two-line-text': detailedItems,'one-line-text': !detailedItems,}">
                       <i class="fas fa-shopping-cart fa-xs float-left"  v-if="mealPlan.shopping"/>
                        {{ itemTitle }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">

import {computed, PropType} from "vue";
import {IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";


let props = defineProps({
    value: {type: {} as PropType<IMealPlanNormalizedCalendarItem>, required: true},
    itemHeight: {type: String, default: '2.6rem'},
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
.meal-plan-card {
    background-color: #fff;
}

@media (max-width: 767.9px) {
    .meal-plan-card {
        font-size: 13px;
    }
}

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
</style>
