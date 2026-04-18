import {computed, type ComputedRef, getCurrentScope, onScopeDispose, type Ref, ref, shallowReactive, shallowRef, watch} from "vue"
import type {EditorSupportedTypes, GenericModel} from "@/types/Models"
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore"
import type {FlatTreeNode, BreadcrumbItem, HierarchyCacheEntry} from "./types"

export interface UseHierarchyTreeOptions {
    model: ComputedRef<GenericModel | false>
    editingItem: ComputedRef<EditorSupportedTypes>
}

export function useHierarchyTree(options: UseHierarchyTreeOptions) {
    const {model, editingItem} = options
    const messageStore = useMessageStore()

    // --- State ---
    const childrenCache = shallowReactive(new Map<number | null, HierarchyCacheEntry>())
    const expandedIds = shallowRef<Set<number>>(new Set())
    const loadingIds = shallowRef<Set<number | string>>(new Set())
    const selectedItem = shallowRef<EditorSupportedTypes | null>(null)
    const searchQuery = ref('')
    const searchResults = shallowRef<EditorSupportedTypes[]>([])
    const searching = ref(false)
    const operating = ref(false)

    // --- Helpers ---

    function getModel(): GenericModel {
        const m = model.value
        if (!m) throw new Error('GenericModel not available')
        return m
    }

    function addToLoadingIds(key: number | string) {
        const next = new Set(loadingIds.value)
        next.add(key)
        loadingIds.value = next
    }

    function removeFromLoadingIds(key: number | string) {
        const next = new Set(loadingIds.value)
        next.delete(key)
        loadingIds.value = next
    }

    function addToExpandedIds(id: number) {
        const next = new Set(expandedIds.value)
        next.add(id)
        expandedIds.value = next
    }

    function removeFromExpandedIds(id: number) {
        const next = new Set(expandedIds.value)
        next.delete(id)
        expandedIds.value = next
    }

    // --- Data Loading ---

    const PAGE_SIZE = 25

    async function loadChildren(parentId: number | null): Promise<void> {
        if (childrenCache.has(parentId)) return

        const key = parentId ?? 'root'
        addToLoadingIds(key)

        try {
            const gm = getModel()
            const rootParam = parentId === null ? 0 : parentId
            const response = await gm.list({root: rootParam, page: 1, pageSize: PAGE_SIZE} as any)
            childrenCache.set(parentId, {
                items: response.results ?? [],
                hasMore: !!response.next,
                page: 1,
            })
        } finally {
            removeFromLoadingIds(key)
        }
    }

    async function loadMoreChildren(parentId: number | null): Promise<void> {
        const entry = childrenCache.get(parentId)
        if (!entry || !entry.hasMore) return

        const key = parentId ?? 'root'
        addToLoadingIds(key)

        try {
            const gm = getModel()
            const rootParam = parentId === null ? 0 : parentId
            const nextPage = entry.page + 1
            const response = await gm.list({root: rootParam, page: nextPage, pageSize: PAGE_SIZE} as any)
            childrenCache.set(parentId, {
                items: [...entry.items, ...(response.results ?? [])],
                hasMore: !!response.next,
                page: nextPage,
            })
        } finally {
            removeFromLoadingIds(key)
        }
    }

    async function toggleExpand(nodeId: number): Promise<void> {
        if (expandedIds.value.has(nodeId)) {
            removeFromExpandedIds(nodeId)
        } else {
            addToExpandedIds(nodeId)
            await loadChildren(nodeId)
        }
    }

    function isLoading(nodeId: number | null): boolean {
        return loadingIds.value.has(nodeId ?? 'root')
    }

    // --- Flat Tree ---

    const flatTree = computed<FlatTreeNode[]>(() => {
        const result: FlatTreeNode[] = []

        function walk(parentId: number | null, depth: number) {
            const entry = childrenCache.get(parentId)
            if (!entry) return
            for (const child of entry.items) {
                const id = child.id!
                const hasChildren = (child as any).numchild > 0
                result.push({
                    id,
                    name: (child as any).name ?? `#${id}`,
                    parent: (child as any).parent ?? null,
                    numchild: (child as any).numchild ?? 0,
                    depth,
                    hasChildren,
                    data: child,
                })
                if (expandedIds.value.has(id) && childrenCache.has(id)) {
                    walk(id, depth + 1)
                }
            }
            // Add "Load more" sentinel if there are more pages
            if (entry.hasMore) {
                result.push({
                    id: -(parentId ?? 0) - 99999, // unique negative id for sentinel
                    name: '',
                    parent: parentId,
                    numchild: 0,
                    depth,
                    hasChildren: false,
                    data: {} as any,
                    isLoadMore: true,
                    loadMoreParentId: parentId,
                })
            }
        }

        walk(null, 0)
        return result
    })

    // --- Breadcrumbs ---

    const breadcrumbs = computed<BreadcrumbItem[]>(() => {
        const targetId = selectedItem.value?.id ?? editingItem.value.id
        if (!targetId) return []
        return buildBreadcrumbPath(targetId)
    })

    function buildBreadcrumbPath(itemId: number): BreadcrumbItem[] {
        const path: BreadcrumbItem[] = []
        let currentId: number | null = itemId

        while (currentId !== null) {
            const item = findItemInCache(currentId)
            if (!item) break
            path.unshift({id: item.id!, name: (item as any).name ?? `#${item.id}`})
            currentId = (item as any).parent ?? null
        }

        return path
    }

    function findItemInCache(itemId: number): EditorSupportedTypes | null {
        for (const [, entry] of childrenCache) {
            const found = entry.items.find(i => i.id === itemId)
            if (found) return found
        }
        return null
    }

    // --- Focus Path ---

    async function expandToItem(targetId: number, selectAfter = false): Promise<void> {
        const gm = getModel()

        // Load root nodes first
        await loadChildren(null)

        // Walk up the ancestor chain by fetching each ancestor
        const ancestorIds: number[] = []
        let currentId: number | null = targetId

        while (currentId !== null) {
            const item = findItemInCache(currentId)
            if (item) {
                const parentId = (item as any).parent ?? null
                if (parentId !== null) {
                    ancestorIds.unshift(parentId)
                }
                currentId = parentId
            } else {
                try {
                    const fetched = await gm.retrieve(currentId)
                    const parentId = (fetched as any).parent ?? null
                    if (parentId !== null) {
                        ancestorIds.unshift(parentId)
                    }
                    currentId = parentId
                } catch {
                    break
                }
            }
        }

        // Expand each ancestor and load its children
        for (const id of ancestorIds) {
            addToExpandedIds(id)
            await loadChildren(id)
        }

        // Also expand the target to show its children
        addToExpandedIds(targetId)
        await loadChildren(targetId)

        // Optionally select the item (opens the panel)
        if (selectAfter) {
            const item = findItemInCache(targetId)
            if (item) {
                selectedItem.value = item
            }
        }
    }

    async function expandFocusPath(): Promise<void> {
        await expandToItem(editingItem.value.id!, false)
    }

    // --- Selection ---

    function selectItem(item: EditorSupportedTypes): void {
        if (selectedItem.value && selectedItem.value.id === item.id) {
            selectedItem.value = null
        } else {
            selectedItem.value = item
        }
    }

    function clearSelection(): void {
        selectedItem.value = null
    }

    // --- Search ---

    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    // Cancel any pending debounced search when the owning scope tears down
    // (e.g. the hierarchy editor dialog closes mid-debounce). Guarded with
    // getCurrentScope() so non-component callers don't error.
    if (getCurrentScope()) {
        onScopeDispose(() => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
                searchTimeout = null
            }
        })
    }

    async function doSearch(query: string): Promise<void> {
        searchQuery.value = query
        if (searchTimeout) clearTimeout(searchTimeout)

        if (!query || query.length < 2) {
            searchResults.value = []
            return
        }

        searching.value = true
        searchTimeout = setTimeout(async () => {
            try {
                const gm = getModel()
                const response = await gm.list({query, page: 1, pageSize: 20} as any)
                searchResults.value = response.results ?? []
            } finally {
                searching.value = false
            }
        }, 300)
    }

    // --- Hierarchy Operations ---

    async function moveItem(item: EditorSupportedTypes, parentId: number): Promise<void> {
        operating.value = true
        try {
            const gm = getModel()
            await gm.move(item, parentId)
            messageStore.addPreparedMessage(PreparedMessage.MOVE_SUCCESS)

            // Invalidate caches for source and destination parents
            const sourceParentId = (item as any).parent ?? null
            invalidateParent(sourceParentId)
            if (parentId === 0) {
                invalidateParent(null) // root
            } else {
                invalidateParent(parentId)
            }

            // Reload affected caches
            await loadChildren(sourceParentId)
            if (parentId === 0) {
                await loadChildren(null)
            } else {
                await loadChildren(parentId)
            }
        } catch (err: any) {
            messageStore.addError(ErrorMessageType.UPDATE_ERROR, err)
        } finally {
            operating.value = false
        }
    }

    async function removeParent(item: EditorSupportedTypes): Promise<void> {
        await moveItem(item, 0)
    }

    async function mergeItem(source: EditorSupportedTypes, target: EditorSupportedTypes): Promise<void> {
        operating.value = true
        try {
            const gm = getModel()
            await gm.merge(source, target)
            messageStore.addPreparedMessage(PreparedMessage.MERGE_SUCCESS)

            // Invalidate the source's parent cache since source is now deleted
            const sourceParentId = (source as any).parent ?? null
            invalidateParent(sourceParentId)
            await loadChildren(sourceParentId)

            // Clear selection since the source item no longer exists
            if (selectedItem.value?.id === source.id) {
                selectedItem.value = null
            }
        } catch (err: any) {
            messageStore.addError(ErrorMessageType.UPDATE_ERROR, err)
        } finally {
            operating.value = false
        }
    }

    // --- Mobile Drill-Down ---

    const drillParentId = shallowRef<number | null>(null)

    const drillItems = computed<FlatTreeNode[]>(() => {
        const entry = childrenCache.get(drillParentId.value)
        if (!entry) return []
        return entry.items.map(child => {
            const id = child.id!
            return {
                id,
                name: (child as any).name ?? `#${id}`,
                parent: (child as any).parent ?? null,
                numchild: (child as any).numchild ?? 0,
                depth: 0,
                hasChildren: (child as any).numchild > 0,
                data: child,
            }
        })
    })

    const drillParent = computed<EditorSupportedTypes | null>(() => {
        if (drillParentId.value === null) return null
        return findItemInCache(drillParentId.value)
    })

    const drillBreadcrumbs = computed<BreadcrumbItem[]>(() => {
        if (drillParentId.value === null) return []
        return buildBreadcrumbPath(drillParentId.value)
    })

    const drillHasMore = computed<boolean>(() => {
        const entry = childrenCache.get(drillParentId.value)
        return entry?.hasMore ?? false
    })

    async function drillInto(nodeId: number): Promise<void> {
        drillParentId.value = nodeId
        await loadChildren(nodeId)
    }

    async function drillBack(): Promise<void> {
        const parent = drillParent.value
        const grandparentId = parent ? ((parent as any).parent ?? null) : null
        drillParentId.value = grandparentId
        await loadChildren(grandparentId)
    }

    async function drillTo(parentId: number | null): Promise<void> {
        drillParentId.value = parentId
        await loadChildren(parentId)
    }

    async function drillLoadMore(): Promise<void> {
        await loadMoreChildren(drillParentId.value)
    }

    async function initDrill(): Promise<void> {
        const gm = getModel()
        const targetId = editingItem.value.id!

        // Load root nodes
        await loadChildren(null)

        // Walk ancestor chain to load all levels
        let currentId: number | null = targetId
        while (currentId !== null) {
            const item = findItemInCache(currentId)
            if (item) {
                currentId = (item as any).parent ?? null
            } else {
                try {
                    const fetched = await gm.retrieve(currentId)
                    currentId = (fetched as any).parent ?? null
                } catch {
                    break
                }
            }
            if (currentId !== null) {
                await loadChildren(currentId)
            }
        }

        // Set drill to the editing item's parent level so the item is visible
        const editItem = findItemInCache(targetId)
        drillParentId.value = editItem ? ((editItem as any).parent ?? null) : null
        await loadChildren(drillParentId.value)
    }

    // --- Cache Management ---

    function invalidateParent(parentId: number | null): void {
        childrenCache.delete(parentId)
    }

    return {
        // Tree state
        selectedItem: selectedItem as Readonly<typeof selectedItem>,
        expandedIds: expandedIds as Readonly<typeof expandedIds>,
        loadingIds: loadingIds as Readonly<typeof loadingIds>,
        flatTree,
        breadcrumbs,

        // Tree operations
        toggleExpand,
        selectItem,
        clearSelection,
        expandFocusPath,
        expandToItem,
        isLoading,
        loadChildren,
        loadMoreChildren,
        findItemInCache,

        // Search
        searchQuery,
        searchResults: searchResults as Readonly<typeof searchResults>,
        searching: searching as Readonly<Ref<boolean>>,
        doSearch,

        // Hierarchy operations
        moveItem,
        removeParent,
        mergeItem,
        operating: operating as Readonly<Ref<boolean>>,

        // Mobile drill-down
        drillParentId: drillParentId as Readonly<typeof drillParentId>,
        drillItems,
        drillParent,
        drillBreadcrumbs,
        drillHasMore,
        drillInto,
        drillBack,
        drillTo,
        drillLoadMore,
        initDrill,

        // Cache management
        invalidateParent,
    }
}
