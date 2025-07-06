<template>
    <span class="step__scalable-num"
          :class="[props.factor===1 ? 'step__scalable-num_scaled_false' : (props.factor > 1 ? 'step__scalable-num_scaled_up':'step__scalable-num_scaled_down')]"
          v-html="calculateAmount(number)"></span>
</template>

<script lang="ts" setup>

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const props = defineProps({
    number: Number,
    factor: {
        type: Number,
        default: 4
    },
})

import {calculateFoodAmount} from "@/utils/number_utils.ts";

/**
 * call external calculateFoodAmount function
 * @param x
 * @return {number | string}
 */
function calculateAmount(x) {
    return calculateFoodAmount(x, props.factor, useUserPreferenceStore().userSettings.useFractions)
}
</script>
