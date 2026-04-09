<template>
    <v-card class="pa-2">
        <div class="d-flex align-center ga-1 mb-1">
            <v-badge :model-value="currentValue.length > 0" :content="currentValue.length" color="primary" inline>
                <span class="text-subtitle-2 flex-shrink-0">{{ label }}</span>
            </v-badge>
            <v-tabs
                v-model="activeKey"
                density="compact"
                grow
                color="primary"
                :hide-slider="false"
                class="flex-grow-1"
            >
                <v-tab v-for="tab in tabs" :key="tab.key" :value="tab.key">{{ tab.label }}</v-tab>
            </v-tabs>
        </div>
        <ModelSelect
            :model="modelName"
            :model-value="currentValue"
            @update:model-value="onUpdate"
            :object="false"
            mode="tags"
            density="compact"
            :can-clear="true"
            :search-on-load="true"
            :append-to-body="true"
            :hide-details="true"
        />
    </v-card>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {EditorSupportedModels} from '@/types/Models'
import type {FilterValue} from '@/composables/modellist/types'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

/**
 * Tabbed mode-switcher widget that exposes the four AND/OR/NOT variants of a
 * tag-select filter (keywords / foods / books) as a single logical filter
 * with a mode tab strip on top of one ModelSelect.
 *
 * Switching tabs MOVES any current value from the old variant key to the new
 * one — preserves user effort. Setting the underlying ModelSelect writes to
 * whichever key is currently active. The widget assumes only one variant is
 * "active" at a time; if a saved CustomFilter loads with multiple variants
 * populated, the widget surfaces whichever non-empty key comes first in `keys`,
 * and the others remain in URL state and render as separate filter chips.
 */
const props = defineProps<{
    label: string
    modelName: EditorSupportedModels
    /** The 4 backend variant keys, in tab order: [or, and, or_not, and_not]. */
    keys: [string, string, string, string]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
}>()

const {t} = useI18n()

const tabs = computed(() => [
    {key: props.keys[0], label: t('tag_filter_has_any')},
    {key: props.keys[1], label: t('tag_filter_has_all')},
    {key: props.keys[2], label: t('tag_filter_has_none')},
    {key: props.keys[3], label: t('tag_filter_missing_some')},
])

/** First variant key with a non-empty value, or the first key as the default. */
function firstNonEmpty(): string {
    for (const k of props.keys) {
        if (props.getFilter(k)) return k
    }
    return props.keys[0]
}

const activeKey = ref(firstNonEmpty())

// Re-sync the active tab when external state changes (e.g. CustomFilter load).
watch(
    () => props.keys.map(k => props.getFilter(k)),
    () => {
        const current = props.getFilter(activeKey.value)
        if (current === undefined || current === '') {
            const next = firstNonEmpty()
            if (next !== activeKey.value && props.getFilter(next)) {
                activeKey.value = next
            }
        }
    },
    {deep: true},
)

/** Parse the active key's stored `1|2|3` string to a number array for ModelSelect. */
const currentValue = computed<number[]>(() => {
    const raw = props.getFilter(activeKey.value)
    if (!raw) return []
    return raw.split('|').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
})

function onUpdate(value: unknown) {
    if (value == null) {
        props.clearFilter(activeKey.value)
        return
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            props.clearFilter(activeKey.value)
            return
        }
        const nums = value.map(v => Number(v)).filter(n => !isNaN(n))
        props.setFilter(activeKey.value, nums)
        return
    }
    const n = Number(value)
    if (!isNaN(n)) props.setFilter(activeKey.value, [n])
}

// When the user clicks a different tab, MOVE the existing value to the new key.
watch(activeKey, (next, prev) => {
    if (next === prev) return
    const oldVal = props.getFilter(prev)
    if (oldVal === undefined || oldVal === '') return
    const ids = oldVal.split('|').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
    if (ids.length === 0) return
    props.clearFilter(prev)
    props.setFilter(next, ids)
})
</script>
