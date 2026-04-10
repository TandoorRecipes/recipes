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

        <FilterRow :label="$t('with') + ' ' + $t('any')" :model-name="modelName"
            :value="values[0]" @update="v => onUpdate(keys[0], v)" :search-on-load="true" />
        <FilterRow :label="$t('without') + ' ' + $t('any')" :model-name="modelName"
            :value="values[2]" @update="v => onUpdate(keys[2], v)" />
        <FilterRow v-if="showAllRows" :label="$t('with') + ' ' + $t('all')" :model-name="modelName"
            :value="values[1]" @update="v => onUpdate(keys[1], v)" />
        <FilterRow v-if="showAllRows" :label="$t('without') + ' ' + $t('all')" :model-name="modelName"
            :value="values[3]" @update="v => onUpdate(keys[3], v)" />
    </v-card>
</template>

<script setup lang="ts">
import {computed, ref, defineComponent, h} from 'vue'
import type {EditorSupportedModels} from '@/types/Models'
import type {FilterValue} from '@/composables/modellist/types'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

const FilterRow = defineComponent({
    props: {
        label: {type: String, required: true},
        modelName: {type: String, required: true},
        value: {type: Array, default: () => []},
        searchOnLoad: {type: Boolean, default: false},
    },
    emits: ['update'],
    setup(props, {emit}) {
        return () => h('div', {class: 'd-flex align-center ga-2 mt-1'}, [
            h('span', {class: 'text-body-2 text-medium-emphasis', style: 'min-width: 80px'}, props.label),
            h(ModelSelect, {
                model: props.modelName,
                modelValue: props.value,
                'onUpdate:modelValue': (v: any) => emit('update', v),
                object: false,
                mode: 'tags',
                density: 'compact',
                canClear: true,
                searchOnLoad: props.searchOnLoad,
                appendToBody: true,
                hideDetails: true,
                class: 'flex-grow-1',
            }),
        ])
    },
})

const props = defineProps<{
    label: string
    modelName: EditorSupportedModels
    keys: [string, string, string, string]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
}>()

function parseIds(raw: string | undefined): number[] {
    if (!raw) return []
    return raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
}

const values = computed(() => props.keys.map(k => parseIds(props.getFilter(k))))

const hasAllData = computed(() => values.value[1].length > 0 || values.value[3].length > 0)
const showAllRows = ref(hasAllData.value)

const totalCount = computed(() => values.value.reduce((sum, arr) => sum + arr.length, 0))

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
</script>
