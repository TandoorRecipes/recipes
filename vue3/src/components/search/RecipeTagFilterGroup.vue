<template>
    <v-card class="pa-2" style="overflow: visible">
        <div class="d-flex align-center" style="min-height: 32px">
            <v-badge :model-value="totalCount > 0" :content="totalCount" color="primary" inline>
                <span class="text-subtitle-2 flex-shrink-0">{{ label }}</span>
            </v-badge>
            <v-spacer />
            <template v-if="expandable">
                <v-btn v-if="!expanded" icon size="x-small" variant="text" @click="expanded = true">
                    <v-icon size="small">fa-solid fa-plus</v-icon>
                </v-btn>
                <v-btn v-else icon size="x-small" variant="text" @click="onCollapse">
                    <v-icon size="small">fa-solid fa-minus</v-icon>
                </v-btn>
            </template>
        </div>

        <!-- Row 1: With (toggleable any/all) -->
        <template v-if="compact">
            <div class="d-flex align-center ga-1 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('with') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row1Values" @update:model-value="v => onUpdate(row1Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle :model-value="includeMode" @update:model-value="toggleIncludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
            <div class="d-flex align-center ga-1 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('without') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row2Values" @update:model-value="v => onUpdate(row2Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle :model-value="excludeMode" @update:model-value="toggleExcludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
            <template v-if="expanded">
                <div class="d-flex align-center ga-1 mt-3">
                    <div class="floating-label-wrap flex-grow-1">
                        <span class="floating-label text-medium-emphasis">{{ $t('with') }}</span>
                        <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row3Values" @update:model-value="v => onUpdate(row3Key, v)"
                            :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                    </div>
                    <v-btn-toggle :model-value="row3ModeLabel" @update:model-value="toggleIncludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                        <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                        <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                    </v-btn-toggle>
                </div>
                <div class="d-flex align-center ga-1 mt-3">
                    <div class="floating-label-wrap flex-grow-1">
                        <span class="floating-label text-medium-emphasis">{{ $t('without') }}</span>
                        <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row4Values" @update:model-value="v => onUpdate(row4Key, v)"
                            :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                    </div>
                    <v-btn-toggle :model-value="row4ModeLabel" @update:model-value="toggleExcludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                        <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                        <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                    </v-btn-toggle>
                </div>
            </template>
        </template>

        <!-- Standard (wide) layout -->
        <template v-else>
            <div class="d-flex align-center ga-2 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('with') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row1Values" @update:model-value="v => onUpdate(row1Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle v-if="showToggles" :model-value="includeMode" @update:model-value="toggleIncludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
            <div class="d-flex align-center ga-2 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('without') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row2Values" @update:model-value="v => onUpdate(row2Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle v-if="showToggles" :model-value="excludeMode" @update:model-value="toggleExcludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
            <div v-if="expanded" class="d-flex align-center ga-2 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('with') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row3Values" @update:model-value="v => onUpdate(row3Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle v-if="showToggles" :model-value="row3ModeLabel" @update:model-value="toggleIncludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
            <div v-if="expanded" class="d-flex align-center ga-2 mt-3">
                <div class="floating-label-wrap flex-grow-1">
                    <span class="floating-label text-medium-emphasis">{{ $t('without') }}</span>
                    <ModelSelect :model="modelName" :placeholder="selectPlaceholder" :model-value="row4Values" @update:model-value="v => onUpdate(row4Key, v)"
                        :object="false" mode="tags" density="compact" :can-clear="true" :search-on-load="false" :append-to-body="true" :hide-details="true" />
                </div>
                <v-btn-toggle v-if="showToggles" :model-value="row4ModeLabel" @update:model-value="toggleExcludeMode" mandatory density="compact" class="flex-shrink-0" @click.stop>
                    <v-btn value="any" size="x-small">{{ $t('any') }}</v-btn>
                    <v-btn value="all" size="x-small">{{ $t('all') }}</v-btn>
                </v-btn-toggle>
            </div>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import type {EditorSupportedModels} from '@/types/Models'
import type {FilterValue} from '@/composables/modellist/types'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

const props = withDefaults(defineProps<{
    label: string
    modelName: EditorSupportedModels
    /** [includeAny, includeAll, excludeAny, excludeAll] */
    keys: [string, string, string, string]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
    /** Stacked layout for narrow containers (drawer) */
    compact?: boolean
    /** Show any/all toggles (false for simpler filters like books) */
    showToggles?: boolean
    /** Allow expanding to 4 rows (false hides + button) */
    expandable?: boolean
    /** Override the default model-name placeholder in the multiselect */
    selectPlaceholder?: string
}>(), {
    compact: false,
    showToggles: true,
    expandable: true,
    selectPlaceholder: undefined,
})

function parseIds(raw: string | undefined): number[] {
    if (!raw) return []
    return raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
}

// Mode refs — determine which key each primary row writes to
const includeMode = ref<'any' | 'all'>('any')
const excludeMode = ref<'any' | 'all'>('any')
const expanded = ref(false)

// Key mapping: row 1+3 use complementary keys, row 2+4 use complementary keys
const row1Key = computed(() => includeMode.value === 'any' ? props.keys[0] : props.keys[1])
const row3Key = computed(() => includeMode.value === 'any' ? props.keys[1] : props.keys[0])
const row2Key = computed(() => excludeMode.value === 'any' ? props.keys[2] : props.keys[3])
const row4Key = computed(() => excludeMode.value === 'any' ? props.keys[3] : props.keys[2])

// Values: read from parent state via getFilter
const row1Values = computed(() => parseIds(props.getFilter(row1Key.value)))
const row2Values = computed(() => parseIds(props.getFilter(row2Key.value)))
const row3Values = computed(() => parseIds(props.getFilter(row3Key.value)))
const row4Values = computed(() => parseIds(props.getFilter(row4Key.value)))

// Mode labels for expanded rows (opposite of primary)
const row3ModeLabel = computed(() => includeMode.value === 'any' ? 'all' : 'any')
const row4ModeLabel = computed(() => excludeMode.value === 'any' ? 'all' : 'any')

const totalCount = computed(() =>
    row1Values.value.length + row2Values.value.length +
    row3Values.value.length + row4Values.value.length
)

// Auto-correct mode and expansion from external state (saved search load).
// Reads raw keys directly (not row*Values which depend on mode) to detect
// which mode the external data implies.
watch(
    () => props.keys.map(k => parseIds(props.getFilter(k)).length > 0),
    ([hasK0, hasK1, hasK2, hasK3]) => {
        if (includeMode.value === 'any' && !hasK0 && hasK1) includeMode.value = 'all'
        else if (includeMode.value === 'all' && !hasK1 && hasK0) includeMode.value = 'any'
        if (excludeMode.value === 'any' && !hasK2 && hasK3) excludeMode.value = 'all'
        else if (excludeMode.value === 'all' && !hasK3 && hasK2) excludeMode.value = 'any'
        if (row3Values.value.length > 0 || row4Values.value.length > 0) expanded.value = true
    },
    {immediate: true},
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

// Toggle: swap data between both include keys so visual content stays stable
function toggleIncludeMode() {
    const key0Data = parseIds(props.getFilter(props.keys[0]))
    const key1Data = parseIds(props.getFilter(props.keys[1]))
    props.clearFilter(props.keys[0])
    props.clearFilter(props.keys[1])
    if (key1Data.length > 0) props.setFilter(props.keys[0], key1Data)
    if (key0Data.length > 0) props.setFilter(props.keys[1], key0Data)
    includeMode.value = includeMode.value === 'any' ? 'all' : 'any'
}

function toggleExcludeMode() {
    const key2Data = parseIds(props.getFilter(props.keys[2]))
    const key3Data = parseIds(props.getFilter(props.keys[3]))
    props.clearFilter(props.keys[2])
    props.clearFilter(props.keys[3])
    if (key3Data.length > 0) props.setFilter(props.keys[2], key3Data)
    if (key2Data.length > 0) props.setFilter(props.keys[3], key2Data)
    excludeMode.value = excludeMode.value === 'any' ? 'all' : 'any'
}

function onCollapse() {
    const row3HasData = row3Values.value.length > 0
    const row4HasData = row4Values.value.length > 0
    if (row3HasData || row4HasData) {
        const parts: string[] = []
        if (row3HasData) parts.push(`${row3ModeLabel.value}: ${row3Values.value.length} items`)
        if (row4HasData) parts.push(`${row4ModeLabel.value}: ${row4Values.value.length} items`)
        if (!window.confirm(`Collapsing will remove ${parts.join(' and ')}. Continue?`)) return
    }
    props.clearFilter(row3Key.value)
    props.clearFilter(row4Key.value)
    expanded.value = false
}
</script>

<style scoped>
.floating-label-wrap {
    position: relative;
}
.floating-label {
    position: absolute;
    top: -6px;
    left: 6px;
    font-size: 0.625rem;
    line-height: 1;
    padding: 0 2px;
    background: rgb(var(--v-theme-surface));
    z-index: 1;
    pointer-events: none;
}
</style>
