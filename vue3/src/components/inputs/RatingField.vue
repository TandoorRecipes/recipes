<template>
    <v-input :hint="hint" persistent-hint>
        <template #prepend v-if="$slots.prepend">
            <slot name="prepend" />
        </template>

        <div class="d-flex flex-column w-100">
            <label v-if="label" class="v-label text-caption mb-1">{{ label }}</label>
            <v-rating v-model="model" :readonly="readonly"></v-rating>
        </div>

        <template #append v-if="$slots.append">
            <slot name="append" />
        </template>
    </v-input>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    label?: string
    hint?: string
    readonly?: boolean
}>(), {
    label: '',
    hint: '',
    readonly: false,
})

const model = defineModel<number | undefined>()
</script>
