<template>
    <div class="d-flex align-center ga-2">
        <v-btn
            v-if="hasFilters"
            icon
            variant="text"
            size="small"
            @click="emit('open-filters')"
        >
            <v-badge
                :model-value="activeFilterCount > 0"
                :content="activeFilterCount"
                color="primary"
            >
                <v-icon>fa-solid fa-filter</v-icon>
            </v-badge>
        </v-btn>

        <v-btn
            v-if="hasMultiSelect"
            icon
            variant="text"
            size="small"
            :color="selectMode ? 'primary' : undefined"
            @click="emit('toggle-select')"
        >
            <v-icon>{{ selectMode ? 'fa-solid fa-square-check' : 'fa-regular fa-square-check' }}</v-icon>
        </v-btn>

        <v-text-field
            prepend-inner-icon="$search"
            :label="$t('Search')"
            :model-value="query"
            @update:model-value="emit('update:query', $event)"
            clearable
            hide-details
            density="compact"
            class="flex-grow-1"
        />

        <v-btn
            v-if="sortOptions.length > 0"
            variant="text"
            class="text-none flex-shrink-0"
            :append-icon="isDescending ? 'fa-solid fa-arrow-down-short-wide' : 'fa-solid fa-arrow-up-short-wide'"
        >
            {{ $t('sort_by') }} {{ currentLabel }}
            <v-menu activator="parent" close-on-content-click>
                <v-list density="compact">
                    <v-list-item
                        v-for="opt in sortOptions"
                        :key="opt.key"
                        :active="currentField === opt.key"
                        @click="onSortSelect(opt.key)"
                    >
                        {{ $t(opt.labelKey) }}
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-btn>

        <v-btn
            v-if="hasFilters"
            icon
            variant="text"
            size="small"
            @click="emit('open-settings')"
        >
            <v-icon>fa-solid fa-sliders</v-icon>
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ModelSortDef} from '@/composables/modellist/types'

const {t} = useI18n()

const props = defineProps({
    query: {type: String, default: ''},
    ordering: {type: String, default: ''},
    sortOptions: {type: Array as PropType<ModelSortDef[]>, default: () => []},
    hasFilters: {type: Boolean, default: false},
    activeFilterCount: {type: Number, default: 0},
    hasMultiSelect: {type: Boolean, default: false},
    selectMode: {type: Boolean, default: false},
})

const emit = defineEmits([
    'update:query',
    'update:ordering',
    'open-filters',
    'open-settings',
    'toggle-select',
])

const currentField = computed(() => {
    const ord = props.ordering || (props.sortOptions.length > 0 ? props.sortOptions[0].key : '')
    return ord.startsWith('-') ? ord.slice(1) : ord
})

const isDescending = computed(() => {
    const ord = props.ordering || (props.sortOptions.length > 0 ? props.sortOptions[0].key : '')
    return ord.startsWith('-')
})

const currentLabel = computed(() => {
    const opt = props.sortOptions.find(o => o.key === currentField.value)
    return opt ? t(opt.labelKey) : ''
})

function onSortSelect(key: string) {
    if (key === currentField.value) {
        // Same field: toggle direction
        emit('update:ordering', isDescending.value ? key : `-${key}`)
    } else {
        // New field: ascending
        emit('update:ordering', key)
    }
}
</script>
