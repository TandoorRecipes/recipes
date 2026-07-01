<template>
    <div class="d-flex align-center px-4 py-1">
        <v-icon v-if="icon" :icon="icon" size="small" class="me-3 text-medium-emphasis" />
        <span class="text-body-2 flex-grow-1">{{ label }}</span>
        <v-btn-toggle
            :model-value="toggleValue"
            @update:model-value="onToggle"
            mandatory
            density="compact"
            class="ms-2"
        >
            <v-btn value="any" size="x-small">{{ $t('Any') }}</v-btn>
            <v-btn value="1" size="x-small">{{ $t('Yes') }}</v-btn>
            <v-btn value="0" size="x-small">{{ $t('No') }}</v-btn>
        </v-btn-toggle>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = withDefaults(defineProps<{
    icon?: string
    label: string
    modelValue?: string
}>(), {
    icon: undefined,
    modelValue: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [val: string | undefined] }>()

const toggleValue = computed(() => props.modelValue ?? 'any')

function onToggle(val: string) {
    emit('update:modelValue', val === 'any' ? undefined : val)
}
</script>
