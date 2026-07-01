<template>
    <div class="hierarchy-tree">
        <!-- Hint at top when nothing selected -->
        <div v-if="flatTree.length > 0 && selectedId == null" class="tree-hint">
            <v-icon size="small" class="mr-1" icon="fa-solid fa-hand-point-down" />
            {{ $t('hierarchy_select_hint') }}
        </div>

        <!-- Loading state for initial load -->
        <div v-if="flatTree.length === 0 && hasLoading" class="text-center pa-4">
            <v-progress-circular indeterminate size="24" class="mr-2" />
            {{ $t('Loading') }}...
        </div>

        <!-- Tree rows -->
        <template v-for="node in flatTree" :key="node.isLoadMore ? `load-more-${node.loadMoreParentId}` : node.id">
            <!-- Load more sentinel -->
            <div
                v-if="node.isLoadMore"
                class="tree-load-more"
                :style="{ paddingLeft: (node.depth * 20 + 28) + 'px' }"
                role="button"
                tabindex="0"
                @click="$emit('loadMore', node.loadMoreParentId)"
                @keydown.enter="$emit('loadMore', node.loadMoreParentId)"
            >
                <v-icon size="x-small" class="mr-2" icon="fa-solid fa-angles-down" />
                {{ $t('load_more') }}
            </div>

            <!-- Normal tree row -->
            <div
                v-else
                :class="['tree-row', {
                    'tree-row--selected': selectedId === node.id,
                    'tree-row--editing': editingId === node.id,
                }]"
                tabindex="0"
                @click="$emit('select', node)"
                @keydown.enter="$emit('select', node)"
            >
                <!-- Indentation -->
                <span
                    v-for="i in node.depth"
                    :key="i"
                    class="tree-indent"
                />

                <!-- Expand chevron -->
                <span
                    v-if="node.hasChildren"
                    class="tree-chevron"
                    @click.stop="$emit('toggleExpand', node.id)"
                >
                    <v-progress-circular
                        v-if="loadingIds.has(node.id)"
                        indeterminate
                        size="14"
                        width="2"
                    />
                    <v-icon
                        v-else
                        size="x-small"
                        :icon="expandedIds.has(node.id) ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"
                        :class="{ 'tree-chevron--expanded': expandedIds.has(node.id) }"
                    />
                </span>
                <span v-else class="tree-chevron tree-chevron--leaf" />

                <!-- Name -->
                <span class="tree-name">{{ node.name }}</span>

                <!-- Editing indicator -->
                <v-icon
                    v-if="editingId === node.id"
                    size="x-small"
                    color="primary"
                    class="ml-1"
                    icon="fa-solid fa-location-crosshairs"
                />

                <!-- Tap affordance (hidden when selected — drawer is already open) -->
                <v-icon
                    v-if="selectedId !== node.id"
                    size="x-small"
                    class="tree-row-chevron"
                    icon="fa-solid fa-chevron-right"
                />
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import {computed} from "vue"
import type {FlatTreeNode} from "@/composables/hierarchy/types"

const props = withDefaults(defineProps<{
    flatTree: FlatTreeNode[]
    selectedId: number | null
    editingId: number
    expandedIds: Set<number>
    loadingIds: Set<number | string>
}>(), {
    selectedId: null,
})

defineEmits<{
    select: [item: FlatTreeNode]
    toggleExpand: [nodeId: number]
    loadMore: [parentId: number | null]
}>()

const hasLoading = computed(() => props.loadingIds.size > 0)
</script>

<style scoped>
.tree-row {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    min-height: 44px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.15s;
}

.tree-row:hover {
    background: rgba(var(--v-theme-on-surface), 0.04);
}

.tree-row:active {
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.tree-row--selected {
    background: rgba(var(--v-theme-primary), 0.08);
}

.tree-row--editing {
    border-left: 4px solid rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.04);
}

.tree-row--editing.tree-row--selected {
    background: rgba(var(--v-theme-primary), 0.12);
}

.tree-indent {
    display: inline-block;
    width: 20px;
    flex-shrink: 0;
}

.tree-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    cursor: pointer;
}

.tree-chevron--leaf {
    visibility: hidden;
}

.tree-name {
    flex: 1;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tree-load-more {
    display: flex;
    align-items: center;
    padding: 8px 8px;
    min-height: 44px;
    cursor: pointer;
    border-radius: 6px;
    color: rgb(var(--v-theme-primary));
    font-size: 0.85rem;
    font-weight: 500;
    transition: background 0.15s;
}

.tree-load-more:hover {
    background: rgba(var(--v-theme-primary), 0.08);
}

.tree-load-more:active {
    background: rgba(var(--v-theme-primary), 0.14);
}

.tree-load-more:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
}

.tree-row-chevron {
    flex-shrink: 0;
    opacity: 0.2;
    margin-left: 4px;
}

.tree-hint {
    text-align: center;
    font-style: italic;
    color: rgba(var(--v-theme-on-surface), 0.5);
    padding: 24px 16px;
    font-size: 0.875rem;
}
</style>
