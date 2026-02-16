<template>
    <div>
        <v-progress-linear v-if="loading && items.length > 0" indeterminate color="primary" />

        <template v-if="loading && items.length === 0">
            <v-skeleton-loader v-for="n in 4" :key="n" type="list-item" />
        </template>

        <v-list v-if="items.length > 0" lines="two" density="compact">
            <v-list-item
                v-for="item in items"
                :key="item.id"
            >
                <template #prepend>
                    <div class="d-flex align-center" :style="treeActive ? { paddingLeft: ((item._depth ?? 0) * 20) + 'px' } : undefined">
                        <v-checkbox-btn
                            v-if="selectMode"
                            :model-value="isSelected(item)"
                            density="compact"
                            class="mr-1"
                            @update:model-value="toggleSelection(item)"
                        />
                        <template v-if="treeActive">
                            <v-progress-circular
                                v-if="item._isLoading"
                                indeterminate
                                size="16"
                                width="2"
                                class="tree-chevron-spacer"
                            />
                            <v-btn
                                v-else-if="(item.numchild ?? 0) > 0"
                                icon
                                variant="plain"
                                size="x-small"
                                class="tree-chevron-spacer"
                                :aria-label="$t('Toggle')"
                                :aria-expanded="expandedIds.has(item.id)"
                                @click.stop="toggleExpand(item.id)"
                            >
                                <v-icon
                                    size="small"
                                    :icon="expandedIds.has(item.id) ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"
                                />
                            </v-btn>
                            <span v-else-if="(item._depth ?? 0) > 0" class="tree-chevron-spacer" />
                        </template>
                    </div>
                </template>

                <v-list-item-title>{{ item.name }}</v-list-item-title>

                <v-list-item-subtitle v-if="getSubtitle(item)">
                    {{ getSubtitle(item) }}
                </v-list-item-subtitle>

                <template #append>
                    <ModelListActionMenu
                        :item="item"
                        :action-defs="actionDefs"
                        :grouped-action-defs="groupedActionDefs"
                        :get-toggle-state="getToggleState"
                        :quick-action-keys="quickActionKeys"
                        @action="(key: string, actionItem: any) => $emit('action', key, actionItem)"
                    />
                </template>
            </v-list-item>
        </v-list>

        <v-card v-else-if="!loading" variant="flat" class="text-center pa-8 text-medium-emphasis">
            {{ $t('No_Results') }}
        </v-card>

        <div v-if="totalPages > 1" class="d-flex justify-center mt-2">
            <v-pagination
                :model-value="page"
                :length="totalPages"
                :total-visible="5"
                density="comfortable"
                @update:model-value="onPageChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ModelActionDef} from '@/composables/modellist/types'
import type {ModelTableHeaders} from '@/types/Models'
import {getNestedProperty} from '@/utils/utils'
import ModelListActionMenu from '@/components/model_list/ModelListActionMenu.vue'

const {t} = useI18n()

const props = defineProps<{
    items: any[],
    itemsLength: number,
    loading: boolean,
    page: number,
    itemsPerPage: number,
    selectMode: boolean,
    selectedItems: any[],
    enhancedColumns: ModelTableHeaders[],
    actionDefs: ModelActionDef[],
    groupedActionDefs: Map<string, ModelActionDef[]>,
    getToggleState: (action: ModelActionDef, item: any) => boolean,
    quickActionKeys: string[],
    treeActive: boolean,
    expandedIds: Set<number>,
    toggleExpand: (id: number) => void,
    mobileSubtitleKeys: string[],
}>()

const emit = defineEmits<{
    'update:selectedItems': [items: any[]],
    'update:options': [options: { page: number, itemsPerPage: number }],
    action: [key: string, item: any],
}>()

const totalPages = computed(() =>
    props.itemsPerPage > 0 ? Math.ceil(props.itemsLength / props.itemsPerPage) : 1
)

/** Columns selected for subtitle display */
const subtitleColumns = computed(() =>
    props.mobileSubtitleKeys
        .map(key => props.enhancedColumns.find(c => c.key === key))
        .filter((c): c is ModelTableHeaders => !!c)
)

function isSelected(item: any): boolean {
    return props.selectedItems.some((s: any) => s.id === item.id)
}

function toggleSelection(item: any) {
    const current = [...props.selectedItems]
    const idx = current.findIndex((s: any) => s.id === item.id)
    if (idx >= 0) {
        current.splice(idx, 1)
    } else {
        current.push(item)
    }
    emit('update:selectedItems', current)
}

/** Build subtitle from configured columns (cached per render cycle) */
const subtitleCache = new WeakMap<object, string>()
function getSubtitle(item: any): string {
    const cached = subtitleCache.get(item)
    if (cached !== undefined) return cached
    const parts: string[] = []
    for (const col of subtitleColumns.value) {
        const field = col.field ?? col.key
        const val = getNestedProperty(item, field)
        if (val == null || val === '' || val === false) continue
        if (typeof val === 'number' || typeof val === 'boolean') {
            parts.push(`${t(col.title)}: ${val}`)
        } else {
            parts.push(String(val))
        }
    }
    const result = parts.join(' · ')
    subtitleCache.set(item, result)
    return result
}

function onPageChange(newPage: number) {
    emit('update:options', {page: newPage, itemsPerPage: props.itemsPerPage})
}

onMounted(() => {
    emit('update:options', {page: props.page, itemsPerPage: props.itemsPerPage})
})
</script>

<style scoped>
.tree-chevron-spacer {
    width: 28px;
    min-width: 28px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>
