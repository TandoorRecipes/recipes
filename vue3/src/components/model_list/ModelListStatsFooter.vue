<template>
    <v-card v-if="hasData || loading" variant="tonal" density="compact" class="mt-2">
        <v-card-text class="d-flex flex-wrap align-center ga-2 py-2">
            <v-chip size="small" variant="text" :loading="loading">
                {{ $t('Showing') }} {{ pageCount }} / {{ itemCount }}
            </v-chip>

            <v-chip
                v-for="stat in statChips"
                :key="stat.key"
                :color="stat.color"
                :prepend-icon="stat.icon"
                size="small"
                variant="tonal"
                label
            >
                {{ $t(stat.labelKey) }}: {{ stat.count }}
            </v-chip>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import type {ModelStatDef} from '@/composables/modellist/types'

const props = defineProps({
    pageCount: {type: Number, required: true},
    itemCount: {type: Number, required: true},
    stats: {type: Object as PropType<Record<string, number>>, required: true},
    statDefs: {type: Array as PropType<ModelStatDef[]>, required: true},
    loading: {type: Boolean, default: false},
})

const hasData = computed(() => props.pageCount > 0)

const statChips = computed(() =>
    props.statDefs.map(def => ({
        ...def,
        count: props.stats[def.key] ?? 0,
    }))
)
</script>
