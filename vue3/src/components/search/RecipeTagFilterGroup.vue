<template>
    <v-card class="pa-2">
        <v-badge :model-value="totalCount > 0" :content="totalCount" color="primary" inline>
            <span class="text-subtitle-2 flex-shrink-0">{{ label }}</span>
        </v-badge>

        <div class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('With') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="includeValue"
                @update:model-value="onIncludeUpdate"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="true"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
            <v-btn-toggle
                :model-value="includeMode"
                @update:model-value="onIncludeModeChange"
                mandatory
                density="compact"
            >
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
        </div>

        <div class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('Without') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="excludeValue"
                @update:model-value="onExcludeUpdate"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="false"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
            <v-btn-toggle
                :model-value="excludeMode"
                @update:model-value="onExcludeModeChange"
                mandatory
                density="compact"
            >
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import type {EditorSupportedModels} from '@/types/Models'
import type {FilterValue} from '@/composables/modellist/types'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

const props = defineProps<{
    label: string
    modelName: EditorSupportedModels
    /** [includeAny, includeAll, excludeAny, excludeAll] */
    keys: [string, string, string, string]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
}>()

function parseIds(raw: string | undefined): number[] {
    if (!raw) return []
    return raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
}

function activeIncludeKey(): string {
    return props.getFilter(props.keys[1]) ? props.keys[1] : props.keys[0]
}

function activeExcludeKey(): string {
    return props.getFilter(props.keys[3]) ? props.keys[3] : props.keys[2]
}

const includeMode = computed(() => props.getFilter(props.keys[1]) ? 'all' : 'any')
const excludeMode = computed(() => props.getFilter(props.keys[3]) ? 'all' : 'any')

const includeValue = computed(() => parseIds(props.getFilter(activeIncludeKey())))
const excludeValue = computed(() => parseIds(props.getFilter(activeExcludeKey())))

const totalCount = computed(() => includeValue.value.length + excludeValue.value.length)

function onIncludeUpdate(value: unknown) {
    const key = activeIncludeKey()
    if (value == null || (Array.isArray(value) && value.length === 0)) {
        props.clearFilter(key)
        return
    }
    if (Array.isArray(value)) {
        props.setFilter(key, value.map(v => Number(v)).filter(n => !isNaN(n)))
    }
}

function onExcludeUpdate(value: unknown) {
    const key = activeExcludeKey()
    if (value == null || (Array.isArray(value) && value.length === 0)) {
        props.clearFilter(key)
        return
    }
    if (Array.isArray(value)) {
        props.setFilter(key, value.map(v => Number(v)).filter(n => !isNaN(n)))
    }
}

function onIncludeModeChange(newMode: string) {
    const oldKey = activeIncludeKey()
    const newKey = newMode === 'all' ? props.keys[1] : props.keys[0]
    if (oldKey === newKey) return
    const ids = parseIds(props.getFilter(oldKey))
    props.clearFilter(oldKey)
    if (ids.length > 0) props.setFilter(newKey, ids)
}

function onExcludeModeChange(newMode: string) {
    const oldKey = activeExcludeKey()
    const newKey = newMode === 'all' ? props.keys[3] : props.keys[2]
    if (oldKey === newKey) return
    const ids = parseIds(props.getFilter(oldKey))
    props.clearFilter(oldKey)
    if (ids.length > 0) props.setFilter(newKey, ids)
}
</script>
