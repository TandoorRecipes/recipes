<template>
    <template v-if="header.type === 'boolean-indicator'">
        <v-icon v-if="value && displayMode === 'icon'" :icon="header.trueIcon" size="small" />
        <span v-else-if="value && displayMode === 'text'">{{ t('Yes') }}</span>
    </template>
    <template v-else-if="header.type === 'status-chip'">
        <v-chip v-if="value" label>{{ value }}</v-chip>
    </template>
    <template v-else-if="header.type === 'number'">
        <span v-if="value != null">
            <span v-if="!showHeaders" class="text-medium-emphasis">{{ t(header.title) }}: </span>{{ value }}
        </span>
    </template>
    <template v-else>
        {{ value }}
    </template>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ModelTableHeaders} from '@/types/Models'
import {getNestedProperty} from '@/utils/utils'

const {t} = useI18n()

const props = defineProps({
    item: {type: Object, required: true},
    header: {type: Object as PropType<ModelTableHeaders>, required: true},
    displayMode: {type: String as PropType<'icon' | 'text'>, required: true},
    showHeaders: {type: Boolean, default: true},
})

const value = computed(() => {
    const path = props.header.field ?? props.header.key
    return getNestedProperty(props.item, path)
})
</script>
