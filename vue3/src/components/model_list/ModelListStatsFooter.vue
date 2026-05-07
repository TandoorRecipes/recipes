<template>
    <v-card v-if="hasData || loading" variant="tonal" density="compact" class="rounded-t-0">
        <v-card-text class="d-flex flex-wrap align-center justify-center ga-2 py-2">
            <v-chip size="small" variant="text" :loading="loading">
                {{ $t('Showing') }} {{ pageCount }} / {{ totalCount }}
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
import {computed} from 'vue'
import type {StatDef} from '@/composables/modellist/types'

const props = withDefaults(defineProps<{
    pageCount: number
    itemCount: number
    stats: Record<string, number>
    statDefs: StatDef[]
    loading?: boolean
}>(), {
    loading: false,
})

const totalCount = computed(() => props.stats.total ?? props.itemCount)
const hasData = computed(() => props.pageCount > 0)

const statChips = computed(() =>
    props.statDefs.map(def => ({
        ...def,
        count: props.stats[def.key] ?? 0,
    }))
)
</script>
