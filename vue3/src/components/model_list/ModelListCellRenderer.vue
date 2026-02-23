<template>
    <template v-if="header.type === 'boolean-indicator'">
        <v-icon v-if="value && displayMode === 'icon'" :icon="header.trueIcon" size="small" />
        <span v-else-if="value && displayMode === 'text'">{{ t('Yes') }}</span>
    </template>
    <template v-else-if="header.type === 'status-chip'">
        <v-chip v-if="value" label>{{ value }}</v-chip>
    </template>
    <template v-else-if="header.type === 'color-chip'">
        <v-chip v-if="value" label :color="value">{{ value }}</v-chip>
    </template>
    <template v-else-if="header.type === 'label-chip'">
        <v-chip v-if="chipDisplay" label :color="chipDisplay.color" :style="header.chipClickHandler ? 'cursor: pointer' : ''" @click="header.chipClickHandler?.(item)">{{ t(chipDisplay.label) }}</v-chip>
    </template>
    <template v-else-if="header.type === 'number'">
        <span v-if="value != null" :class="{'text-disabled': value === 0, 'font-weight-medium': value > 0 && header.emphasizeNonZero}">
            <span v-if="!showHeaders" class="text-medium-emphasis">{{ t(header.title) }}: </span>{{ value }}
        </span>
    </template>
    <template v-else>
        {{ displayValue }}
    </template>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ModelTableHeaders} from '@/types/Models'
import {getNestedProperty} from '@/utils/utils'

const {t} = useI18n()

const props = withDefaults(defineProps<{
    item: Record<string, any>
    header: ModelTableHeaders
    displayMode: 'icon' | 'text'
    showHeaders?: boolean
}>(), {
    showHeaders: true,
})

const value = computed(() => {
    const path = props.header.field ?? props.header.key
    return getNestedProperty(props.item, path)
})

const chipDisplay = computed(() => {
    if (props.header.type !== 'label-chip' || !props.header.chipMap) return null
    const key = props.header.chipValueResolver
        ? props.header.chipValueResolver(props.item)
        : String(value.value ?? '')
    return props.header.chipMap[key] ?? props.header.chipMap['_default'] ?? null
})

const displayValue = computed(() => {
    if (props.header.joinField && Array.isArray(value.value)) {
        return value.value.map((x: any) => x[props.header.joinField!]).join(', ')
    }
    return value.value
})
</script>
