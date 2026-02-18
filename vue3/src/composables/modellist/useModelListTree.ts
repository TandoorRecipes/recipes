import {computed, ref, watch, type ComputedRef, type WritableComputedRef} from 'vue'
import {useMessageStore, ErrorMessageType} from '@/stores/MessageStore'
import type {Model} from '@/types/Models'

/** Page size for child fetches (independent of the table's page size) */
const CHILD_PAGE_SIZE = 100

export {CHILD_PAGE_SIZE}

interface ChildrenCacheEntry {
    items: any[]
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
    fetchChildren: (parentId: number, page: number) => Promise<{results: any[], hasMore: boolean}>,
    treeEnabled: WritableComputedRef<boolean>,
) {
    /** Tree is active when user enabled it AND the model supports it */
    const treeActive = computed(() =>
        treeEnabled.value && !!model.value?.isTree && !!model.value?.listSettings?.treeEnabled
    )

    const expandedIds = ref<Set<number>>(new Set())
    const loadingIds = ref<Set<number>>(new Set())
    const childrenCache = new Map<number, ChildrenCacheEntry>()

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
    function buildFlatList(rootItems: any[]): any[] {
        const result: any[] = []

        function walk(items: any[], depth: number) {
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
                            id: `load-more-${item.id}`,
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

    function clearTreeState() {
        expandedIds.value = new Set()
        loadingIds.value = new Set()
        childrenCache.clear()
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
        getTreeLoadParams,
        clearTreeState,
        setOnCollapse,
    }
}
