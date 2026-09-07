<template>
    <span class="step__plural-name"
          :class="{'step__plural-name--changed': scaledForm !== baseForm}">{{ scaledForm }}</span>
</template>

<script lang="ts" setup>
import {computed} from "vue"
import {isSingularAmount} from "@/utils/model_utils"

const props = withDefaults(defineProps<{
    singular: string
    plural?: string
    amount: number
    factor?: number
    noAmount?: boolean
}>(), {
    plural: '',
    factor: 1,
    noAmount: false,
})

function resolve(amount: number): string {
    if (props.noAmount || !props.plural) return props.singular
    if (isSingularAmount(amount)) return props.singular
    return props.plural
}

const baseForm = computed(() => resolve(props.amount))
const scaledForm = computed(() => resolve(props.amount * props.factor))
</script>

<style scoped>
.step__plural-name--changed {
    color: var(--v-theme-warning);
}
</style>
