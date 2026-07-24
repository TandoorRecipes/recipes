<template>
    <v-card class="pa-2">
        <span class="text-subtitle-2">{{ $t(group) }}</span>
        <FilterField
            v-for="def in visibleDefs" :key="def.key"
            :def="def"
            :get-filter="getFilter"
            :set-filter="setFilter"
            :clear-filter="clearFilter"
            compact
        />
    </v-card>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {FilterDef, FilterValue} from '@/composables/modellist/types'
import FilterField from '@/components/filters/FilterField.vue'

const props = defineProps<{
    group: string
    defs: FilterDef[]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
}>()

const visibleDefs = computed(() => props.defs.filter(d => !d.hidden))
</script>
