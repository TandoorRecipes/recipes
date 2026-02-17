import {computed, ref, watch, type ComputedRef, type WritableComputedRef} from 'vue'
import {useMessageStore, ErrorMessageType} from '@/stores/MessageStore'
import type {Model} from '@/types/Models'

/** Practical ceiling for child fetch — food hierarchies rarely exceed this */
const MAX_CHILDREN = 500

export {MAX_CHILDREN}

/**
 * Composable managing tree expand/collapse state for ModelListPage.
 *
 * Accepts a `treeEnabled` setting ref and a `fetchChildren` callback
 * to stay decoupled from device settings and GenericModel.
 */
export function useModelListTree(
    model: ComputedRef<Model | undefined>,
    fetchChildren: (parentId: number) => Promise<any[]>,
    treeEnabled: WritableComputedRef<boolean>,
) {
    /** Tree is active when user enabled it AND the model supports it */
    const treeActive = computed(() =>
        treeEnabled.value && !!model.value?.isTree && !!model.value?.listSettings?.treeEnabled
    )

    const expandedIds = ref<Set<number>>(new Set())
    const loadingIds = ref<Set<number>>(new Set())
    const childrenCache = new Map<number, any[]>()

    /** Optional callback invoked when children are removed from view on collapse */
    let onCollapseCallback: ((removedIds: number[]) => void) | undefined

    function setOnCollapse(cb: (removedIds: number[]) => void) {
        onCollapseCallback = cb
    }

    /** Recursively collect all expanded descendant IDs */
    function collectExpandedDescendants(parentId: number): number[] {
        const children = childrenCache.get(parentId) ?? []
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
                const children = await fetchChildren(id)
                childrenCache.set(id, children)
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

    /**
     * Walks root items and inserts children of expanded nodes inline.
     * Adds `_depth` (0 = root) and `_isLoading` properties to each item.
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
                    const children = childrenCache.get(item.id) ?? []
                    walk(children, depth + 1)
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
        buildFlatList,
        getTreeLoadParams,
        clearTreeState,
        setOnCollapse,
    }
}
