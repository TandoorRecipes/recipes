<template>
    <div class="drill-down">
        <!-- Breadcrumbs -->
        <div v-if="breadcrumbs.length > 0" class="drill-breadcrumbs">
            <span
                class="drill-crumb drill-crumb--root"
                role="button"
                tabindex="0"
                @click="$emit('drillTo', null)"
                @keydown.enter="$emit('drillTo', null)"
            >
                {{ $t('All') }}
            </span>
            <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
                <v-icon size="x-small" class="drill-sep" icon="fa-solid fa-chevron-right" />
                <span
                    :class="['drill-crumb', { 'drill-crumb--current': i === breadcrumbs.length - 1 }]"
                    :role="i < breadcrumbs.length - 1 ? 'button' : undefined"
                    :tabindex="i < breadcrumbs.length - 1 ? 0 : undefined"
                    @click="i < breadcrumbs.length - 1 ? $emit('drillTo', crumb.id) : undefined"
                    @keydown.enter="i < breadcrumbs.length - 1 ? $emit('drillTo', crumb.id) : undefined"
                >
                    {{ crumb.name }}
                </span>
            </template>
        </div>

        <!-- Header -->
        <div class="drill-header">
            <v-btn
                v-if="parent"
                icon="fa-solid fa-arrow-left"
                variant="text"
                size="small"
                density="comfortable"
                :aria-label="$t('Back')"
                data-testid="drill-back-btn"
                @click="$emit('drillBack')"
            />
            <span
                v-if="parent"
                class="drill-title drill-title--tappable"
                role="button"
                tabindex="0"
                @click="$emit('selectParent', parent)"
                @keydown.enter="$emit('selectParent', parent)"
            >
                {{ (parent as any).name }}
            </span>
            <span v-else class="drill-title">
                {{ $t('All') }}
            </span>
        </div>

        <!-- Item list -->
        <Transition name="drill-left" mode="out-in">
            <div :key="parent?.id ?? 'root'" class="drill-list">
                <!-- Loading -->
                <div v-if="loading && items.length === 0" class="drill-loading">
                    <v-progress-circular indeterminate size="20" width="2" class="mr-2" />
                    {{ $t('Loading') }}...
                </div>

                <!-- Items -->
                <template v-else>
                    <div
                        v-for="item in items"
                        :key="item.id"
                        :class="['drill-item', {
                            'drill-item--editing': item.id === editingId,
                            'drill-item--selected': item.id === selectedId,
                        }]"
                        tabindex="0"
                        role="button"
                        @click="item.hasChildren ? $emit('drillInto', item.id) : $emit('select', item)"
                        @keydown.enter="item.hasChildren ? $emit('drillInto', item.id) : $emit('select', item)"
                    >
                        <span class="drill-item-name">{{ item.name }}</span>
                        <v-icon
                            v-if="item.id === editingId"
                            size="x-small"
                            color="primary"
                            class="mr-1"
                            icon="fa-solid fa-location-crosshairs"
                        />
                        <v-icon
                            v-if="item.hasChildren"
                            size="x-small"
                            class="drill-item-chevron"
                            icon="fa-solid fa-chevron-right"
                        />
                    </div>

                    <!-- Load more -->
                    <div
                        v-if="hasMore"
                        class="drill-load-more"
                        role="button"
                        tabindex="0"
                        @click="$emit('loadMore')"
                        @keydown.enter="$emit('loadMore')"
                    >
                        <v-icon size="x-small" class="mr-2" icon="fa-solid fa-angles-down" />
                        {{ $t('load_more') }}
                    </div>

                    <!-- Empty state -->
                    <div v-if="!loading && items.length === 0" class="drill-empty">
                        {{ $t('no_items') }}
                    </div>
                </template>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import type {FlatTreeNode, BreadcrumbItem} from "@/composables/hierarchy/types"
import type {EditorSupportedTypes} from "@/types/Models"

withDefaults(defineProps<{
    items: FlatTreeNode[]
    parent: EditorSupportedTypes | null
    breadcrumbs: BreadcrumbItem[]
    editingId: number
    selectedId: number | null
    loading: boolean
    hasMore: boolean
}>(), {
    selectedId: null,
    loading: false,
    hasMore: false,
})

defineEmits<{
    select: [item: FlatTreeNode]
    selectParent: [item: EditorSupportedTypes]
    drillInto: [nodeId: number]
    drillBack: []
    drillTo: [parentId: number | null]
    loadMore: []
}>()

</script>

<style scoped>
.drill-breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 12px;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.drill-crumb {
    cursor: pointer;
    color: rgb(var(--v-theme-primary));
    padding: 2px 4px;
    border-radius: 4px;
}

.drill-crumb:hover {
    background: rgba(var(--v-theme-primary), 0.08);
}

.drill-crumb--current {
    color: rgba(var(--v-theme-on-surface), 0.87);
    font-weight: 600;
    cursor: default;
}

.drill-crumb--current:hover {
    background: transparent;
}

.drill-crumb:focus-visible,
.drill-title--tappable:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
}

.drill-sep {
    color: rgba(var(--v-theme-on-surface), 0.3);
}

.drill-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    background: rgba(var(--v-theme-on-surface), 0.03);
}

.drill-title {
    font-size: 1rem;
    font-weight: 500;
    flex: 1;
}

.drill-title--tappable {
    cursor: pointer;
    color: rgb(var(--v-theme-primary));
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 3px;
}

.drill-title--tappable:hover {
    text-decoration-style: solid;
}

.drill-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    min-height: 48px;
    cursor: pointer;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
    transition: background 0.15s;
    gap: 8px;
}

.drill-item:hover {
    background: rgba(var(--v-theme-on-surface), 0.04);
}

.drill-item:active {
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.drill-item:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
}

.drill-item--editing {
    border-left: 3px solid rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.04);
}

.drill-item--selected {
    background: rgba(var(--v-theme-primary), 0.08);
}

.drill-item-name {
    flex: 1;
    font-size: 0.95rem;
}

.drill-item-chevron {
    color: rgba(var(--v-theme-on-surface), 0.4);
}

.drill-load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    min-height: 48px;
    cursor: pointer;
    color: rgb(var(--v-theme-primary));
    font-size: 0.85rem;
    font-weight: 500;
    transition: background 0.15s;
}

.drill-load-more:hover {
    background: rgba(var(--v-theme-primary), 0.08);
}

.drill-load-more:active {
    background: rgba(var(--v-theme-primary), 0.14);
}

.drill-loading,
.drill-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-style: italic;
    font-size: 0.875rem;
}

/* Slide animations */
.drill-left-enter-active,
.drill-left-leave-active,
.drill-right-enter-active,
.drill-right-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.drill-left-enter-from {
    transform: translateX(30%);
    opacity: 0;
}

.drill-left-leave-to {
    transform: translateX(-30%);
    opacity: 0;
}

.drill-right-enter-from {
    transform: translateX(-30%);
    opacity: 0;
}

.drill-right-leave-to {
    transform: translateX(30%);
    opacity: 0;
}
</style>
