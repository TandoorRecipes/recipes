<template>
    <template v-if="header.type === 'boolean-indicator'">
        <v-icon v-if="value && displayMode === 'icon'" :icon="header.trueIcon" size="small" />
        <span v-else-if="value && displayMode === 'text'">{{ t('Yes') }}</span>
    </template>
    <template v-else-if="header.type === 'status-chip'">
        <v-chip v-if="value" label>{{ value }}</v-chip>
    </template>
    <template v-else>
        {{ value }}
    </template>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ModelTableHeaders} from '@/types/Models'
import {getNestedProperty} from '@/utils/utils'

const {t} = useI18n()

const props = defineProps<{
    item: any
    header: ModelTableHeaders
    displayMode: 'icon' | 'text'
}>()

const value = computed(() => {
    const path = props.header.field ?? props.header.key
    return getNestedProperty(props.item, path)
})
</script>
