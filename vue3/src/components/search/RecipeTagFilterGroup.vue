<template>
    <v-card class="pa-2">
        <div class="d-flex align-center">
            <v-badge :model-value="totalCount > 0" :content="totalCount" color="primary" inline>
                <span class="text-subtitle-2 flex-shrink-0">{{ label }}</span>
            </v-badge>
            <v-spacer />
            <v-btn v-if="!showAllRows" icon size="x-small" variant="text" @click="showAllRows = true">
                <v-icon size="small">fa-solid fa-plus</v-icon>
            </v-btn>
            <v-btn v-else icon size="x-small" variant="text" @click="collapseAllRows">
                <v-icon size="small">fa-solid fa-minus</v-icon>
            </v-btn>
        </div>

        <!-- With -->
        <div class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('with') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="includeValue"
                @update:model-value="v => onUpdate(includeKey, v)"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="true"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
            <v-btn-toggle v-model="includeMode" mandatory density="compact">
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
        </div>

        <!-- Without -->
        <div class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('without') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="excludeValue"
                @update:model-value="v => onUpdate(excludeKey, v)"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="false"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
            <v-btn-toggle v-model="excludeMode" mandatory density="compact">
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
        </div>

        <!-- With all (expanded) -->
        <div v-if="showAllRows" class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('with') }} {{ $t('all') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="includeAllValue"
                @update:model-value="v => onUpdate(keys[1], v)"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="false"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
        </div>

        <!-- Without all (expanded) -->
        <div v-if="showAllRows" class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 56px">{{ $t('without') }} {{ $t('all') }}</span>
            <ModelSelect
                :model="modelName"
                :model-value="excludeAllValue"
                @update:model-value="v => onUpdate(keys[3], v)"
                :object="false"
                mode="tags"
                density="compact"
                :can-clear="true"
                :search-on-load="false"
                :append-to-body="true"
                :hide-details="true"
                class="flex-grow-1"
            />
        </div>
    </v-card>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
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

const includeMode = ref<string>(props.getFilter(props.keys[1]) ? 'all' : 'any')
const excludeMode = ref<string>(props.getFilter(props.keys[3]) ? 'all' : 'any')

watch(() => props.getFilter(props.keys[1]), (v) => { includeMode.value = v ? 'all' : 'any' })
watch(() => props.getFilter(props.keys[3]), (v) => { excludeMode.value = v ? 'all' : 'any' })

const includeKey = computed(() => includeMode.value === 'all' ? props.keys[1] : props.keys[0])
const excludeKey = computed(() => excludeMode.value === 'all' ? props.keys[3] : props.keys[2])

const includeValue = computed(() => parseIds(props.getFilter(includeKey.value)))
const excludeValue = computed(() => parseIds(props.getFilter(excludeKey.value)))
const includeAllValue = computed(() => parseIds(props.getFilter(props.keys[1])))
const excludeAllValue = computed(() => parseIds(props.getFilter(props.keys[3])))

const hasAllData = computed(() =>
    includeAllValue.value.length > 0 || excludeAllValue.value.length > 0
)
const showAllRows = ref(hasAllData.value)

const totalCount = computed(() =>
    includeValue.value.length + excludeValue.value.length +
    (showAllRows.value ? includeAllValue.value.length + excludeAllValue.value.length : 0)
)

function onUpdate(key: string, value: unknown) {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
        props.clearFilter(key)
        return
    }
    if (Array.isArray(value)) {
        props.setFilter(key, value.map(v => Number(v)).filter(n => !isNaN(n)))
    }
}

function collapseAllRows() {
    props.clearFilter(props.keys[1])
    props.clearFilter(props.keys[3])
    showAllRows.value = false
}

watch(includeMode, (newMode, oldMode) => {
    if (newMode === oldMode) return
    const oldKey = oldMode === 'all' ? props.keys[1] : props.keys[0]
    const newKey = newMode === 'all' ? props.keys[1] : props.keys[0]
    const ids = parseIds(props.getFilter(oldKey))
    props.clearFilter(oldKey)
    if (ids.length > 0) props.setFilter(newKey, ids)
})

watch(excludeMode, (newMode, oldMode) => {
    if (newMode === oldMode) return
    const oldKey = oldMode === 'all' ? props.keys[3] : props.keys[2]
    const newKey = newMode === 'all' ? props.keys[3] : props.keys[2]
    const ids = parseIds(props.getFilter(oldKey))
    props.clearFilter(oldKey)
    if (ids.length > 0) props.setFilter(newKey, ids)
})
</script>
