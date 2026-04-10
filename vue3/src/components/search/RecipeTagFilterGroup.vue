<template>
    <v-card class="pa-2">
        <v-badge :model-value="totalCount > 0" :content="totalCount" color="primary" inline>
            <span class="text-subtitle-2 flex-shrink-0">{{ label }}</span>
        </v-badge>

        <!-- Include row -->
        <div class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 48px">{{ $t('With') }}</span>
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
            <v-btn-toggle
                v-model="includeMode"
                mandatory
                density="compact"
            >
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
            <v-btn
                v-if="!showExclude"
                icon
                size="x-small"
                variant="text"
                @click="showExclude = true"
            >
                <v-icon size="small">fa-solid fa-plus</v-icon>
            </v-btn>
        </div>

        <!-- Exclude row (expanded via +) -->
        <div v-if="showExclude" class="d-flex align-center ga-2 mt-1">
            <span class="text-body-2 text-medium-emphasis" style="min-width: 48px">{{ $t('Without') }}</span>
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
            <v-btn-toggle
                v-model="excludeMode"
                mandatory
                density="compact"
            >
                <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
            </v-btn-toggle>
            <v-btn
                icon
                size="x-small"
                variant="text"
                @click="collapseExclude"
            >
                <v-icon size="small">fa-solid fa-minus</v-icon>
            </v-btn>
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

const hasExcludeData = computed(() =>
    parseIds(props.getFilter(props.keys[2])).length > 0 ||
    parseIds(props.getFilter(props.keys[3])).length > 0
)
const showExclude = ref(hasExcludeData.value)

const totalCount = computed(() => includeValue.value.length + excludeValue.value.length)

function onUpdate(key: string, value: unknown) {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
        props.clearFilter(key)
        return
    }
    if (Array.isArray(value)) {
        props.setFilter(key, value.map(v => Number(v)).filter(n => !isNaN(n)))
    }
}

function collapseExclude() {
    props.clearFilter(props.keys[2])
    props.clearFilter(props.keys[3])
    showExclude.value = false
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
