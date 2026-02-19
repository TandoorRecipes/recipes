<template>
    <div class="d-flex align-center px-4 py-1">
        <v-icon v-if="filterDef.icon" :icon="filterDef.icon" size="small" class="me-3 text-medium-emphasis" />
        <div v-if="filterDef.modelName" class="flex-grow-1">
            <model-select
                :model="filterDef.modelName"
                :model-value="modelValue ? Number(modelValue) : null"
                @update:model-value="onUpdate"
                :object="false"
                density="compact"
                mode="single"
                :can-clear="true"
                :search-on-load="true"
                :append-to-body="true"
                :hide-details="true"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type {ModelFilterDef} from '@/composables/modellist/types'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

withDefaults(defineProps<{
    filterDef: ModelFilterDef
    modelValue?: string
}>(), {
    modelValue: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [val: string | undefined] }>()

function onUpdate(val: number | null) {
    emit('update:modelValue', val != null ? String(val) : undefined)
}
</script>
