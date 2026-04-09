import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest'
import {computed, nextTick} from 'vue'
import {createPinia, setActivePinia} from 'pinia'

// Mock useI18n (required by MessageStore)
vi.mock('vue-i18n', async () => {
    const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
    return {
        ...actual,
        useI18n: () => ({t: (key: string) => key}),
    }
})

// Mock the OpenAPI layer
vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
    ResponseError: class extends Error {
        response: any
        constructor(r: any) { super(); this.response = r }
    },
}))

// Mock GenericModel
const mockList = vi.fn()
const mockMove = vi.fn()
const mockMerge = vi.fn()
const mockRetrieve = vi.fn()

const mockGenericModel = {
    model: {name: 'Food', isTree: true, isMerge: true, icon: 'fa-solid fa-carrot'},
    list: mockList,
    move: mockMove,
    merge: mockMerge,
    retrieve: mockRetrieve,
    api: {},
}

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => mockGenericModel,
    }
})

vi.mock('@vueuse/core', async () => {
    const {ref} = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({value: false}),
}))

import {useHierarchyTree} from '@/composables/hierarchy/useHierarchyTree'

function makeItem(id: number, name: string, parent: number | null, numchild = 0) {
    return {id, name, parent, numchild} as any
}

describe('useHierarchyTree', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockList.mockReset()
        mockMove.mockReset()
        mockMerge.mockReset()
        mockRetrieve.mockReset()
    })

    function createTree(editingItem = makeItem(10, 'Produce', null, 3)) {
        return useHierarchyTree({
            model: computed(() => mockGenericModel as any),
            editingItem: computed(() => editingItem),
        })
    }

    describe('loadChildren', () => {
        it('calls list with root param and caches result', async () => {
            const rootItems = [makeItem(1, 'A', null, 2), makeItem(2, 'B', null, 0)]
            mockList.mockResolvedValue({results: rootItems, next: null})

            const tree = createTree()
            await tree.loadChildren(null)

            expect(mockList).toHaveBeenCalledWith(expect.objectContaining({root: 0, page: 1, pageSize: 25}))
            expect(tree.flatTree.value).toHaveLength(2)
            expect(tree.flatTree.value[0].name).toBe('A')
        })

        it('uses root=parentId for non-root nodes', async () => {
            mockList.mockResolvedValue({results: [makeItem(10, 'Child', 5)], next: null})

            const tree = createTree()
            await tree.loadChildren(5)

            expect(mockList).toHaveBeenCalledWith(expect.objectContaining({root: 5}))
        })

        it('does not re-fetch if already cached', async () => {
            mockList.mockResolvedValue({results: [makeItem(1, 'A', null)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.loadChildren(null)

            expect(mockList).toHaveBeenCalledTimes(1)
        })
    })

    describe('toggleExpand', () => {
        it('expands a node and loads its children', async () => {
            const rootItems = [makeItem(1, 'A', null, 2)]
            const children = [makeItem(10, 'A1', 1), makeItem(11, 'A2', 1)]
            mockList
                .mockResolvedValueOnce({results: rootItems, next: null})
                .mockResolvedValueOnce({results: children, next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.toggleExpand(1)

            expect(tree.expandedIds.value.has(1)).toBe(true)
            expect(tree.flatTree.value).toHaveLength(3) // A, A1, A2
            expect(tree.flatTree.value[1].depth).toBe(1)
        })

        it('collapses an expanded node', async () => {
            const rootItems = [makeItem(1, 'A', null, 2)]
            const children = [makeItem(10, 'A1', 1)]
            mockList
                .mockResolvedValueOnce({results: rootItems, next: null})
                .mockResolvedValueOnce({results: children, next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.toggleExpand(1) // expand
            await tree.toggleExpand(1) // collapse

            expect(tree.expandedIds.value.has(1)).toBe(false)
            expect(tree.flatTree.value).toHaveLength(1) // just A
        })

        it('re-expand uses cache, no re-fetch', async () => {
            const rootItems = [makeItem(1, 'A', null, 2)]
            const children = [makeItem(10, 'A1', 1)]
            mockList
                .mockResolvedValueOnce({results: rootItems, next: null})
                .mockResolvedValueOnce({results: children, next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.toggleExpand(1)
            await tree.toggleExpand(1) // collapse
            await tree.toggleExpand(1) // re-expand

            expect(mockList).toHaveBeenCalledTimes(2) // root + first expand only
        })
    })

    describe('selectItem', () => {
        it('selects an item', () => {
            const tree = createTree()
            const item = makeItem(1, 'A', null)
            tree.selectItem(item)
            expect(tree.selectedItem.value?.id).toBe(1)
        })

        it('deselects when clicking the same item', () => {
            const tree = createTree()
            const item = makeItem(1, 'A', null)
            tree.selectItem(item)
            tree.selectItem(item)
            expect(tree.selectedItem.value).toBeNull()
        })
    })

    describe('flatTree', () => {
        it('produces correct depth for nested nodes', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Child', 1, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(100, 'GrandChild', 10)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.toggleExpand(1)
            await tree.toggleExpand(10)

            expect(tree.flatTree.value.map(n => ({name: n.name, depth: n.depth}))).toEqual([
                {name: 'Root', depth: 0},
                {name: 'Child', depth: 1},
                {name: 'GrandChild', depth: 2},
            ])
        })

        it('sets hasChildren from numchild', async () => {
            mockList.mockResolvedValue({results: [makeItem(1, 'A', null, 3), makeItem(2, 'B', null, 0)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)

            expect(tree.flatTree.value[0].hasChildren).toBe(true)
            expect(tree.flatTree.value[1].hasChildren).toBe(false)
        })
    })

    describe('moveItem', () => {
        it('calls model.move and invalidates caches', async () => {
            mockMove.mockResolvedValue({})
            mockList.mockResolvedValue({results: [], next: null})

            const tree = createTree()
            const item = makeItem(5, 'Garlic', 3)
            await tree.moveItem(item, 10)

            expect(mockMove).toHaveBeenCalledWith(item, 10)
        })

        it('sets operating=true during call, false after', async () => {
            let resolve: Function
            mockMove.mockReturnValue(new Promise(r => { resolve = r }))
            mockList.mockResolvedValue({results: [], next: null})

            const tree = createTree()
            const promise = tree.moveItem(makeItem(1, 'A', null), 5)
            expect(tree.operating.value).toBe(true)

            resolve!({})
            await promise
            expect(tree.operating.value).toBe(false)
        })
    })

    describe('removeParent', () => {
        it('calls move with parentId=0', async () => {
            mockMove.mockResolvedValue({})
            mockList.mockResolvedValue({results: [], next: null})

            const tree = createTree()
            const item = makeItem(5, 'Garlic', 3)
            await tree.removeParent(item)

            expect(mockMove).toHaveBeenCalledWith(item, 0)
        })
    })

    describe('mergeItem', () => {
        it('calls model.merge with source and target', async () => {
            mockMerge.mockResolvedValue({})
            mockList.mockResolvedValue({results: [], next: null})

            const tree = createTree()
            const source = makeItem(5, 'Garlic', 3)
            const target = makeItem(10, 'Garlic Powder', 3)
            await tree.mergeItem(source, target)

            expect(mockMerge).toHaveBeenCalledWith(source, target)
        })

        it('clears selection if merged item was selected', async () => {
            mockMerge.mockResolvedValue({})
            mockList.mockResolvedValue({results: [], next: null})

            const tree = createTree()
            const source = makeItem(5, 'Garlic', 3)
            tree.selectItem(source)
            expect(tree.selectedItem.value?.id).toBe(5)

            await tree.mergeItem(source, makeItem(10, 'Target', 3))
            expect(tree.selectedItem.value).toBeNull()
        })
    })

    describe('expandToItem', () => {
        it('expands ancestors and selects or skips based on selectAfter flag', async () => {
            const editingItem = makeItem(1, 'Root', null)
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 2)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Target', 1, 0), makeItem(11, 'Other', 1)], next: null})
                .mockResolvedValueOnce({results: [], next: null})
            mockRetrieve.mockResolvedValueOnce(makeItem(10, 'Target', 1))

            const tree = createTree(editingItem)
            await tree.expandToItem(10, true)
            expect(tree.expandedIds.value.has(1)).toBe(true)
            expect(tree.selectedItem.value?.id).toBe(10)

            // Without selection
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Child', 1)], next: null})
                .mockResolvedValueOnce({results: [], next: null})
            mockRetrieve.mockResolvedValueOnce(makeItem(10, 'Child', 1))

            const tree2 = createTree()
            await tree2.expandToItem(10, false)
            expect(tree2.expandedIds.value.has(1)).toBe(true)
            expect(tree2.selectedItem.value).toBeNull()
        })
    })

    describe('expandFocusPath', () => {
        it('expands ancestors to the editing item without selecting it', async () => {
            // Editing item: id=10, parent=1
            // Item 1 (root): parent=null
            const editingItem = makeItem(10, 'Produce', 1, 3)

            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 2)], next: null}) // root load
                .mockResolvedValueOnce({results: [makeItem(10, 'Produce', 1, 3), makeItem(11, 'Dairy', 1)], next: null}) // children of 1
                .mockResolvedValueOnce({results: [makeItem(100, 'Veggies', 10)], next: null}) // children of 10

            mockRetrieve.mockResolvedValueOnce(editingItem) // fetch editing item to get parent

            const tree = createTree(editingItem)
            await tree.expandFocusPath()

            expect(tree.expandedIds.value.has(1)).toBe(true)
            expect(tree.expandedIds.value.has(10)).toBe(true)
            // Should NOT select — selecting would open the panel
            expect(tree.selectedItem.value).toBeNull()
        })
    })

    describe('breadcrumbs', () => {
        it('returns path from root to selected item', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Child', 1)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.toggleExpand(1)

            tree.selectItem(makeItem(10, 'Child', 1))
            await nextTick()

            expect(tree.breadcrumbs.value).toEqual([
                {id: 1, name: 'Root'},
                {id: 10, name: 'Child'},
            ])
        })
    })

    describe('drill-down', () => {
        it('drillInto sets drillParentId and loads children', async () => {
            const children = [makeItem(10, 'Child', 5)]
            mockList
                .mockResolvedValueOnce({results: [makeItem(5, 'Parent', null, 1)], next: null})
                .mockResolvedValueOnce({results: children, next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.drillInto(5)

            expect(tree.drillParentId.value).toBe(5)
            expect(tree.drillItems.value).toHaveLength(1)
            expect(tree.drillItems.value[0].name).toBe('Child')
        })

        it('drillBack navigates to parent of current parent', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(5, 'Mid', 1, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Leaf', 5)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.drillInto(1)
            await tree.drillInto(5)
            expect(tree.drillParentId.value).toBe(5)

            await tree.drillBack()
            expect(tree.drillParentId.value).toBe(1)
        })

        it('drillBack from depth-1 and drillTo(null) both return to root', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null})
                .mockResolvedValueOnce({results: [makeItem(5, 'Child', 1)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.drillInto(1)
            expect(tree.drillParentId.value).toBe(1)

            await tree.drillBack()
            expect(tree.drillParentId.value).toBeNull()

            // drillTo(null) achieves the same result
            await tree.drillInto(1)
            await tree.drillTo(null)
            expect(tree.drillParentId.value).toBeNull()
        })

        it('drillItems returns FlatTreeNode[] with depth=0', async () => {
            mockList.mockResolvedValue({results: [makeItem(10, 'A', 5, 2), makeItem(11, 'B', 5)], next: null})

            const tree = createTree()
            await tree.drillInto(5)

            expect(tree.drillItems.value[0].depth).toBe(0)
            expect(tree.drillItems.value[0].hasChildren).toBe(true)
            expect(tree.drillItems.value[1].hasChildren).toBe(false)
        })

        it('drillBreadcrumbs returns path from root to drill parent', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 1)], next: null}) // root
                .mockResolvedValueOnce({results: [makeItem(5, 'Mid', 1, 1)], next: null}) // children of 1
                .mockResolvedValueOnce({results: [makeItem(10, 'Leaf', 5)], next: null}) // children of 5

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.drillInto(1)
            await tree.drillInto(5)

            // drillParentId is 5, breadcrumbs should show path to 5
            expect(tree.drillBreadcrumbs.value).toEqual([
                {id: 1, name: 'Root'},
                {id: 5, name: 'Mid'},
            ])
        })

        it('drillHasMore reflects cache hasMore flag', async () => {
            mockList.mockResolvedValue({results: [makeItem(1, 'A', null)], next: 'page2'})

            const tree = createTree()
            await tree.drillTo(null)

            expect(tree.drillHasMore.value).toBe(true)
        })

        it('drillLoadMore fetches next page', async () => {
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'A', null)], next: 'page2'})
                .mockResolvedValueOnce({results: [makeItem(2, 'B', null)], next: null})

            const tree = createTree()
            await tree.drillTo(null)
            expect(tree.drillItems.value).toHaveLength(1)

            await tree.drillLoadMore()
            expect(tree.drillItems.value).toHaveLength(2)
        })

        it('initDrill sets drillParentId to editing item parent', async () => {
            const editingItem = makeItem(10, 'Produce', 1, 3)
            mockList
                .mockResolvedValueOnce({results: [makeItem(1, 'Root', null, 2)], next: null})
                .mockResolvedValueOnce({results: [makeItem(10, 'Produce', 1, 3), makeItem(11, 'Other', 1)], next: null})

            mockRetrieve.mockResolvedValueOnce(editingItem)

            const tree = createTree(editingItem)
            await tree.initDrill()

            // Should be at the editing item's parent level
            expect(tree.drillParentId.value).toBe(1)
            expect(tree.drillItems.value.some(i => i.id === 10)).toBe(true)
        })
    })

    describe('loadMoreChildren', () => {
        it('appends to cached items and advances page', async () => {
            const page1 = [makeItem(1, 'A', null), makeItem(2, 'B', null)]
            const page2 = [makeItem(3, 'C', null), makeItem(4, 'D', null)]
            mockList
                .mockResolvedValueOnce({results: page1, next: 'page2'})
                .mockResolvedValueOnce({results: page2, next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            // 2 items + 1 load-more sentinel
            const realItems = tree.flatTree.value.filter((n: any) => !n.isLoadMore)
            expect(realItems).toHaveLength(2)

            await tree.loadMoreChildren(null)
            const afterLoad = tree.flatTree.value.filter((n: any) => !n.isLoadMore)
            expect(afterLoad).toHaveLength(4)
            expect(afterLoad[2].name).toBe('C')
        })

        it('is a noop when hasMore is false', async () => {
            mockList.mockResolvedValueOnce({results: [makeItem(1, 'A', null)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)
            await tree.loadMoreChildren(null)

            expect(mockList).toHaveBeenCalledTimes(1)
        })
    })

    describe('flatTree load-more sentinel', () => {
        it('appends sentinel when hasMore is true', async () => {
            mockList.mockResolvedValueOnce({results: [makeItem(1, 'A', null, 2)], next: 'page2'})

            const tree = createTree()
            await tree.loadChildren(null)

            const sentinel = tree.flatTree.value.find((n: any) => n.isLoadMore)
            expect(sentinel).toBeTruthy()
            expect(sentinel!.loadMoreParentId).toBeNull()
        })

        it('omits sentinel when hasMore is false', async () => {
            mockList.mockResolvedValueOnce({results: [makeItem(1, 'A', null)], next: null})

            const tree = createTree()
            await tree.loadChildren(null)

            expect(tree.flatTree.value.every((n: any) => !n.isLoadMore)).toBe(true)
        })
    })

    describe('doSearch', () => {
        it('clears results when query is under 2 chars', async () => {
            const tree = createTree()
            await tree.doSearch('a')
            expect(tree.searchResults.value).toEqual([])
            expect(mockList).not.toHaveBeenCalled()
        })

        it('triggers API search after debounce for query >= 2 chars', async () => {
            vi.useFakeTimers()
            const results = [makeItem(5, 'Apple', null)]
            mockList.mockResolvedValueOnce({results, next: null})

            const tree = createTree()
            tree.doSearch('app')
            vi.advanceTimersByTime(300)
            await vi.runAllTimersAsync()

            expect(mockList).toHaveBeenCalledWith(expect.objectContaining({query: 'app', page: 1, pageSize: 20}))
            expect(tree.searchResults.value).toHaveLength(1)
            vi.useRealTimers()
        })
    })

    describe('breadcrumbs', () => {
        it('falls back to editingItem when nothing selected', async () => {
            const editing = makeItem(10, 'Produce', 1, 3)
            editing.fullName = 'Root > Produce'
            mockList.mockResolvedValueOnce({results: [editing], next: null})

            const tree = createTree(editing)
            await tree.loadChildren(null)
            // Do not select anything — breadcrumbs should use editingItem
            expect(tree.breadcrumbs.value.length).toBeGreaterThanOrEqual(1)
        })
    })
})
