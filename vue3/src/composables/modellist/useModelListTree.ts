/**
 * Composable for tree view in ModelListPage. Manages expand/collapse state,
 * lazy child loading with pagination, flat-list construction from hierarchical data,
 * and tree-aware cell rendering (indentation, chevrons, load-more sentinels).
 */
import {computed, h, shallowRef, shallowReactive, watch, type ComputedRef, type Ref, type VNode, type WritableComputedRef} from 'vue'
import {useMessageStore, ErrorMessageType} from '@/stores/MessageStore'
import type {Model} from '@/types/Models'
import type {ModelItem} from './types'

/** Page size for child fetches (independent of the table's page size) */
const CHILD_PAGE_SIZE = 100

export {CHILD_PAGE_SIZE}

interface ChildrenCacheEntry {
    items: ModelItem[]
    hasMore: boolean
    page: number
}

/**
 * Composable managing tree expand/collapse state for ModelListPage.
 *
 * Accepts a `treeEnabled` setting ref and a `fetchChildren` callback
 * to stay decoupled from device settings and GenericModel.
 */
export function useModelListTree(
    model: ComputedRef<Model | undefined>,
    fetchChildren: (parentId: number, page: number) => Promise<{results: ModelItem[], hasMore: boolean}>,
    treeEnabled: WritableComputedRef<boolean>,
) {
    /** Tree is active when user enabled it AND the model supports it */
    const treeActive = computed(() =>
        treeEnabled.value && !!model.value?.isTree && !!model.value?.listSettings?.treeEnabled
    )

    const expandedIds = shallowRef<Set<number>>(new Set())
    const loadingIds = shallowRef<Set<number>>(new Set())
    const childrenCache = shallowReactive(new Map<number, ChildrenCacheEntry>())

    /** Optional callback invoked when children are removed from view on collapse */
    let onCollapseCallback: ((removedIds: number[]) => void) | undefined

    function setOnCollapse(cb: (removedIds: number[]) => void) {
        onCollapseCallback = cb
    }

    /** Recursively collect all expanded descendant IDs */
    function collectExpandedDescendants(parentId: number): number[] {
        const cached = childrenCache.get(parentId)
        const children = cached?.items ?? []
        const removed: number[] = []
        for (const child of children) {
            removed.push(child.id)
            if (expandedIds.value.has(child.id)) {
                removed.push(...collectExpandedDescendants(child.id))
                expandedIds.value.delete(child.id)
            }
        }
        return removed
    }

    async function toggleExpand(id: number) {
        if (expandedIds.value.has(id)) {
            // Collapse: remove this node and all expanded descendants
            const removed = collectExpandedDescendants(id)
            expandedIds.value.delete(id)
            // Force reactivity
            expandedIds.value = new Set(expandedIds.value)
            if (onCollapseCallback && removed.length > 0) {
                onCollapseCallback(removed)
            }
            return
        }

        // Expand: fetch children if not cached
        if (!childrenCache.has(id)) {
            loadingIds.value.add(id)
            loadingIds.value = new Set(loadingIds.value)
            try {
                const result = await fetchChildren(id, 1)
                childrenCache.set(id, {items: result.results, hasMore: result.hasMore, page: 1})
            } catch (e) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, e)
                return
            } finally {
                loadingIds.value.delete(id)
                loadingIds.value = new Set(loadingIds.value)
            }
        }

        expandedIds.value.add(id)
        expandedIds.value = new Set(expandedIds.value)
    }

    async function loadMoreChildren(parentId: number) {
        const cached = childrenCache.get(parentId)
        if (!cached || !cached.hasMore) return

        loadingIds.value.add(parentId)
        loadingIds.value = new Set(loadingIds.value)
        try {
            const nextPage = cached.page + 1
            const result = await fetchChildren(parentId, nextPage)
            cached.items = [...cached.items, ...result.results]
            cached.hasMore = result.hasMore
            cached.page = nextPage
            // Trigger reactivity via expandedIds reassignment
            expandedIds.value = new Set(expandedIds.value)
        } catch (e) {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, e)
        } finally {
            loadingIds.value.delete(parentId)
            loadingIds.value = new Set(loadingIds.value)
        }
    }

    /**
     * Walks root items and inserts children of expanded nodes inline.
     * Adds `_depth` (0 = root) and `_isLoading` properties to each item.
     * If an expanded node has more pages, appends a sentinel `_isLoadMore` row.
     */
    function buildFlatList(rootItems: ModelItem[]): ModelItem[] {
        const result: ModelItem[] = []

        function walk(items: ModelItem[], depth: number) {
            for (const item of items) {
                result.push({
                    ...item,
                    _depth: depth,
                    _isLoading: loadingIds.value.has(item.id),
                })
                if (expandedIds.value.has(item.id)) {
                    const cached = childrenCache.get(item.id)
                    const children = cached?.items ?? []
                    walk(children, depth + 1)
                    if (cached?.hasMore) {
                        result.push({
                            _isLoadMore: true,
                            _parentId: item.id,
                            _depth: depth + 1,
                            id: -item.id,
                            name: '',
                        })
                    }
                }
            }
        }

        walk(rootItems, 0)
        return result
    }

    /** Returns `{root: 0}` when tree is active so the API returns only roots */
    function getTreeLoadParams(): Record<string, any> {
        return treeActive.value ? {root: 0} : {}
    }

    /** Update a single item inside the children cache (e.g. after a toggle action) */
    function updateCachedChild(itemId: number, field: string, value: unknown): boolean {
        for (const [parentId, entry] of childrenCache) {
            const idx = entry.items.findIndex(i => i.id === itemId)
            if (idx >= 0) {
                entry.items[idx] = {...entry.items[idx], [field]: value} as ModelItem
                // Trigger reactivity so buildFlatList re-spreads
                expandedIds.value = new Set(expandedIds.value)
                return true
            }
        }
        return false
    }

    function clearTreeState() {
        expandedIds.value = new Set()
        loadingIds.value = new Set()
        childrenCache.clear()
    }

    /**
     * Render a tree-aware name cell for the desktop DataTable.
     * Handles indentation, expand/collapse chevrons, load-more sentinels.
     * Call site provides the name content VNode and layout context.
     */
    function renderTreeCell(item: ModelItem, nameContent: VNode | string, mobile: Ref<boolean>, t: (key: string) => string): VNode {
        const step = mobile.value ? 20 : 28

        if (item._isLoadMore) {
            const depth = item._depth ?? 0
            const isLoading = loadingIds.value.has(item._parentId)
            return h('div', {class: 'd-flex align-center', style: {paddingLeft: `${depth * step}px`}}, [
                h('button', {
                    type: 'button',
                    class: 'text-primary text-caption font-weight-medium',
                    style: {cursor: 'pointer', appearance: 'none', border: 'none', background: 'none', padding: '4px 8px'},
                    disabled: isLoading,
                    'aria-label': t('Load_More'),
                    onClick: (e: Event) => { e.stopPropagation(); loadMoreChildren(item._parentId) },
                }, [
                    h('i', {class: isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-ellipsis', style: {fontSize: '12px', marginRight: '6px'}}),
                    t('Load_More'),
                ]),
            ])
        }

        const depth = item._depth ?? 0
        const hasChildren = (item.numchild ?? 0) > 0
        const isExpanded = expandedIds.value.has(item.id)
        const isLoading = item._isLoading

        const children: VNode[] = []

        if (hasChildren) {
            if (isLoading) {
                children.push(h('span', {class: 'tree-expand-btn', style: {width: '28px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', opacity: '0.4'}},
                    [h('i', {class: 'fa-solid fa-chevron-down', style: {fontSize: '12px'}})]
                ))
            } else {
                children.push(h('button', {
                    class: ['tree-expand-btn', isExpanded ? 'tree-chevron-expanded' : ''],
                    style: {cursor: 'pointer', width: '28px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', appearance: 'none', border: 'none', background: 'none', padding: 0},
                    'aria-expanded': isExpanded,
                    'aria-label': t('Toggle'),
                    onClick: (e: Event) => { e.stopPropagation(); toggleExpand(item.id) },
                    onKeydown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleExpand(item.id) } },
                }, [h('i', {class: 'fa-solid fa-chevron-right', style: {fontSize: '12px'}})]))
            }
        } else if (depth > 0) {
            children.push(h('span', {style: {width: '28px', display: 'inline-block'}}))
        }

        children.push(nameContent as VNode)

        return h('div', {class: 'd-flex align-center', style: {paddingLeft: `${depth * step}px`}}, children)
    }

    // Clear tree state when tree mode changes
    watch(treeActive, () => {
        clearTreeState()
    })

    return {
        treeActive,
        expandedIds,
        loadingIds,
        toggleExpand,
        loadMoreChildren,
        buildFlatList,
        updateCachedChild,
        getTreeLoadParams,
        clearTreeState,
        setOnCollapse,
        renderTreeCell,
    }
}
