<template>
    <div>
        <!-- Search input -->
        <v-text-field
            v-model="searchInput"
            :placeholder="$t('Search') + '...'"
            prepend-inner-icon="fa-solid fa-magnifying-glass"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="mb-2"
            @update:model-value="onSearchInput"
        />

        <!-- Search results -->
        <v-card v-if="tree.searchResults.value.length > 0" variant="outlined" class="mb-2">
            <v-list density="compact">
                <v-list-subheader>{{ tree.searchResults.value.length }} {{ $t('results') }}</v-list-subheader>
                <v-list-item
                    v-for="r in tree.searchResults.value"
                    :key="r.id"
                    :title="(r as any).name"
                    :subtitle="getParentName(r)"
                    density="compact"
                    @click="onSearchResultClick(r)"
                />
            </v-list>
        </v-card>

        <!-- Breadcrumbs (desktop only — mobile has its own in HierarchyDrillDown) -->
        <nav v-if="!mobile && tree.breadcrumbs.value.length > 1" class="hierarchy-breadcrumbs mb-2" :aria-label="$t('Hierarchy')">
            <template v-for="(crumb, i) in tree.breadcrumbs.value" :key="crumb.id ?? 'root'">
                <v-icon v-if="i > 0" size="x-small" class="breadcrumb-sep" icon="fa-solid fa-chevron-right" />
                <span
                    :class="['breadcrumb-item', { 'breadcrumb-item--current': i === tree.breadcrumbs.value.length - 1 }]"
                    :aria-current="i === tree.breadcrumbs.value.length - 1 ? 'location' : undefined"
                    :role="i < tree.breadcrumbs.value.length - 1 ? 'button' : undefined"
                    :tabindex="i < tree.breadcrumbs.value.length - 1 ? 0 : undefined"
                    @click="i < tree.breadcrumbs.value.length - 1 ? onBreadcrumbClick(crumb) : undefined"
                    @keydown.enter="i < tree.breadcrumbs.value.length - 1 ? onBreadcrumbClick(crumb) : undefined"
                    @keydown.space.prevent="i < tree.breadcrumbs.value.length - 1 ? onBreadcrumbClick(crumb) : undefined"
                >
                    {{ crumb.name }}
                </span>
            </template>
        </nav>

        <!-- Tree (desktop) or Drill-down (mobile) -->
        <v-card variant="outlined">
            <v-card-text class="pa-2" v-if="!mobile">
                <HierarchyTree
                    :flat-tree="tree.flatTree.value"
                    :selected-id="tree.selectedItem.value?.id ?? null"
                    :editing-id="editingObj.id!"
                    :expanded-ids="tree.expandedIds.value"
                    :loading-ids="tree.loadingIds.value"
                    @select="onTreeSelect"
                    @toggle-expand="tree.toggleExpand"
                    @load-more="tree.loadMoreChildren"
                />
            </v-card-text>
            <HierarchyDrillDown
                v-else
                :items="tree.drillItems.value"
                :parent="tree.drillParent.value"
                :breadcrumbs="tree.drillBreadcrumbs.value"
                :editing-id="editingObj.id!"
                :selected-id="tree.selectedItem.value?.id ?? null"
                :loading="tree.loadingIds.value.has(tree.drillParentId.value ?? 'root')"
                :has-more="tree.drillHasMore.value"
                @select="onDrillSelect"
                @select-parent="onDrillSelectParent"
                @drill-into="tree.drillInto"
                @drill-back="tree.drillBack"
                @drill-to="tree.drillTo"
                @load-more="tree.drillLoadMore"
            />
        </v-card>

        <!-- Desktop: Right navigation drawer -->
        <v-navigation-drawer
            v-if="!mobile"
            v-model="panelOpen"
            location="right"
            :width="380"
            temporary
            :scrim="true"
        >
            <v-toolbar density="compact" flat>
                <v-icon class="ml-3 mr-2" size="small" :icon="genericModel ? genericModel.model.icon : ''" />
                <v-toolbar-title>
                    {{ (tree.selectedItem.value as any)?.name }}
                </v-toolbar-title>
                <v-btn
                    icon="$help"
                    variant="text"
                    size="small"
                    density="comfortable"
                    :aria-label="$t('Help')"
                    @click="showHelpDialog = true"
                >
                    <v-icon size="20">$help</v-icon>
                    <v-tooltip activator="parent" location="bottom">{{ $t('Hierarchy') }} {{ $t('Help') }}</v-tooltip>
                </v-btn>
                <v-btn
                    icon="fa-solid fa-times"
                    variant="plain"
                    size="small"
                    aria-label="Close"
                    @click="panelOpen = false"
                />
            </v-toolbar>
            <v-divider />
            <HierarchyControls
                v-if="tree.selectedItem.value"
                :selected-item="tree.selectedItem.value"
                :editing-item="editingObj"
                :model="model"
                :operating="tree.operating.value"
                @add-child="onAddChild"
                @set-parent="onSetParent"
                @merge="onMerge"
                @remove-parent="onRemoveParent"
            />
        </v-navigation-drawer>

        <!-- Mobile: Bottom sheet -->
        <v-bottom-sheet
            v-if="mobile"
            v-model="panelOpen"
            scrollable
        >
            <v-card>
                <!-- Drag handle -->
                <div class="sheet-drag-handle">
                    <div class="sheet-handle-bar" />
                </div>
                <v-card-title class="d-flex align-center py-1">
                    <v-icon start size="small" :icon="genericModel ? genericModel.model.icon : ''" />
                    <span class="text-subtitle-1">{{ (tree.selectedItem.value as any)?.name }}</span>
                    <v-spacer />
                    <v-btn
                        icon="$help"
                        variant="text"
                        size="small"
                        density="comfortable"
                        :aria-label="$t('Help')"
                        @click="showHelpDialog = true"
                    >
                        <v-icon size="20">$help</v-icon>
                    </v-btn>
                    <v-btn
                        icon="fa-solid fa-times"
                        variant="plain"
                        size="small"
                        aria-label="Close"
                        @click="panelOpen = false"
                    />
                </v-card-title>
                <v-divider />
                <v-card-text style="max-height: 60vh; overflow-y: auto;" class="pa-0">
                    <HierarchyControls
                        v-if="tree.selectedItem.value"
                        :selected-item="tree.selectedItem.value"
                        :editing-item="editingObj"
                        :model="model"
                        :operating="tree.operating.value"
                        @add-child="onAddChild"
                        @set-parent="onSetParent"
                        @merge="onMerge"
                        @remove-parent="onRemoveParent"
                    />
                </v-card-text>
            </v-card>
        </v-bottom-sheet>

        <!-- Help dialog (overlay, doesn't navigate away) -->
        <v-dialog v-model="showHelpDialog" max-width="1200">
            <v-card>
                <v-card-title class="d-flex align-center">
                    <span>{{ $t('Help') }}: {{ $t('Hierarchy') }}</span>
                    <v-spacer />
                    <v-btn icon="fa-solid fa-times" variant="plain" size="small" @click="showHelpDialog = false" />
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-0">
                    <AsyncHelpView v-model="helpDrawer" default-section="hierarchy" />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent, onMounted, ref, watch} from "vue"
import {useDisplay} from "vuetify"
import {useI18n} from "vue-i18n"
import type {EditorSupportedModels, EditorSupportedTypes} from "@/types/Models"
import {getGenericModelFromString} from "@/types/Models"
import {useHierarchyTree} from "@/composables/hierarchy/useHierarchyTree"
import type {FlatTreeNode} from "@/composables/hierarchy/types"
import HierarchyTree from "@/components/hierarchy/HierarchyTree.vue"
import HierarchyDrillDown from "@/components/hierarchy/HierarchyDrillDown.vue"
import HierarchyControls from "@/components/hierarchy/HierarchyControls.vue"
const AsyncHelpView = defineAsyncComponent(() => import("@/components/display/HelpView.vue"))

const props = defineProps<{
    model: EditorSupportedModels
}>()

const editingObj = defineModel<EditorSupportedTypes>({required: true})

const t = useI18n()
const {mobile} = useDisplay()

const genericModel = computed(() => getGenericModelFromString(props.model, t))

const tree = useHierarchyTree({
    model: genericModel,
    editingItem: computed(() => editingObj.value),
})

const panelOpen = ref(false)
const showHelpDialog = ref(false)
const helpDrawer = ref(!mobile.value)
const searchInput = ref('')

// Sync panel with selection
watch(() => tree.selectedItem.value, (val) => {
    if (val) {
        panelOpen.value = true
    }
})

watch(panelOpen, (val) => {
    if (!val) {
        tree.clearSelection()
    }
})

// Init: expand focus path (desktop) or init drill (mobile)
onMounted(() => {
    if (mobile.value) {
        tree.initDrill()
    } else {
        tree.expandFocusPath()
    }
})

// Handle breakpoint transitions
watch(mobile, (isMobile) => {
    if (isMobile) {
        tree.initDrill()
    } else {
        tree.expandFocusPath()
    }
})

// --- Event Handlers ---

function onTreeSelect(node: FlatTreeNode) {
    tree.selectItem(node.data)
}

function onDrillSelect(node: FlatTreeNode) {
    tree.selectItem(node.data)
}

function onDrillSelectParent(item: EditorSupportedTypes) {
    tree.selectItem(item)
}

function onSearchInput(query: string | null) {
    tree.doSearch(query ?? '')
}

async function onSearchResultClick(item: EditorSupportedTypes) {
    searchInput.value = ''
    tree.doSearch('')

    if (mobile.value) {
        // On mobile: drill to the item's parent level, then select
        const parentId = (item as any).parent ?? null
        await tree.drillTo(parentId)
        tree.selectItem(item)
    } else {
        // On desktop: expand ancestor path to make item visible, then select
        await tree.expandToItem(item.id!, true)
    }
}

function onBreadcrumbClick(crumb: {id: number | null, name: string}) {
    if (crumb.id !== null) {
        const item = tree.findItemInCache(crumb.id)
        if (item) {
            tree.selectItem(item)
        }
    }
}

function getParentName(item: EditorSupportedTypes): string {
    const parentId = (item as any).parent
    if (parentId == null) return ''
    const parent = tree.findItemInCache(parentId)
    return parent ? (parent as any).name : ''
}

async function onAddChild(child: EditorSupportedTypes) {
    if (!tree.selectedItem.value) return
    await tree.moveItem(child, tree.selectedItem.value.id!)
}

async function onSetParent(parent: EditorSupportedTypes) {
    if (!tree.selectedItem.value) return
    await tree.moveItem(tree.selectedItem.value, parent.id!)
}

async function onMerge(target: EditorSupportedTypes) {
    if (!tree.selectedItem.value) return
    await tree.mergeItem(tree.selectedItem.value, target)
}

async function onRemoveParent() {
    if (!tree.selectedItem.value) return
    await tree.removeParent(tree.selectedItem.value)
}
</script>

<style scoped>
.sheet-drag-handle {
    display: flex;
    justify-content: center;
    padding: 12px 0 4px;
    cursor: grab;
    touch-action: none;
}

.sheet-handle-bar {
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: rgba(var(--v-theme-on-surface), 0.3);
}

.hierarchy-breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 0.8rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    padding: 4px 0;
}

.breadcrumb-sep {
    color: rgba(var(--v-theme-on-surface), 0.3);
}

.breadcrumb-item {
    cursor: pointer;
    color: rgb(var(--v-theme-primary));
    padding: 2px 6px;
    border-radius: 4px;
}

.breadcrumb-item:hover {
    background: rgba(var(--v-theme-primary), 0.08);
}

.breadcrumb-item:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
}

.breadcrumb-item--current {
    color: rgba(var(--v-theme-on-surface), 0.87);
    font-weight: 600;
    cursor: default;
}

.breadcrumb-item--current:hover {
    background: transparent;
}
</style>
