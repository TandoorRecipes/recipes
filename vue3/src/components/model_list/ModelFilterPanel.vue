<template>
    <div v-if="groupedFilterDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of groupedFilterDefs" :key="group">
            <component :is="group ? CollapsibleSection : 'div'" v-bind="group ? {label: $t(group)} : {}">
                <template v-for="def in defs" :key="def.key">
                    <TriStateToggle
                        v-if="def.type === 'tristate'"
                        :icon="def.icon"
                        :label="$t(def.labelKey)"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                    <div v-else-if="def.type === 'model-select'" class="d-flex align-center px-4 py-1">
                        <v-icon v-if="def.icon" :icon="def.icon" size="small" class="me-3 text-medium-emphasis" />
                        <div v-if="def.modelName" class="flex-grow-1">
                            <ModelSelect
                                :model="def.modelName"
                                :model-value="getFilter(def.key) ? Number(getFilter(def.key)) : null"
                                @update:model-value="setFilter(def.key, $event != null ? String($event) : undefined)"
                                :object="false"
                                density="compact"
                                mode="single"
                                :can-clear="true"
                                :search-on-load="true"
                                :append-to-body="true"
                                :hide-details="true"
                            />
                        </div>
                    </div>
                    <div v-else-if="def.type === 'number'" class="d-flex align-center px-4 py-1">
                        <v-icon v-if="def.icon" :icon="def.icon" size="small" class="me-3 text-medium-emphasis" />
                        <v-text-field
                            type="number"
                            :label="$t(def.labelKey)"
                            :model-value="getFilter(def.key) ?? ''"
                            @update:model-value="setFilter(def.key, $event != null && $event !== '' ? String($event) : undefined)"
                            :placeholder="def.defaultValue"
                            :suffix="def.suffixKey ? $t(def.suffixKey) : undefined"
                            density="compact"
                            hide-details
                            clearable
                            class="flex-grow-1"
                        />
                    </div>
                </template>
            </component>
        </template>
    </div>
</template>

<script setup lang="ts">
import type {FilterDef} from '@/composables/modellist/types'
import TriStateToggle from '@/components/common/TriStateToggle.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

defineProps<{
    groupedFilterDefs: Map<string, FilterDef[]>
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: string | undefined) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()
</script>
