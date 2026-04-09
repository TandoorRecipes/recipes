import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

import { useModelListTree } from '@/composables/modellist/useModelListTree'

function makeItem(id: number, name: string, numchild = 0) {
    return { id, name, numchild } as any
}

describe('useModelListTree', () => {
    const mockFetch = vi.fn()
    const treeEnabled = ref(true)
    const model = computed(() => ({
        isTree: true,
        listSettings: { treeEnabled: true },
    }))

    beforeEach(() => {
        setActivePinia(createPinia())
        mockFetch.mockReset()
        treeEnabled.value = true
    })

    function createTree() {
        return useModelListTree(model as any, mockFetch, treeEnabled as any)
    }

    describe('buildFlatList', () => {
        it('root items have depth 0', () => {
            const tree = createTree()
            const flat = tree.buildFlatList([makeItem(1, 'A'), makeItem(2, 'B')])
            expect(flat).toHaveLength(2)
            expect(flat[0]._depth).toBe(0)
            expect(flat[1]._depth).toBe(0)
        })

        it('children of expanded nodes have depth 1', async () => {
            const children = [makeItem(10, 'A1'), makeItem(11, 'A2')]
            mockFetch.mockResolvedValueOnce({ results: children, hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)

            const flat = tree.buildFlatList([makeItem(1, 'A', 2)])
            expect(flat).toHaveLength(3)
            expect(flat[1]._depth).toBe(1)
            expect(flat[1].name).toBe('A1')
        })

        it('appends load-more sentinel when hasMore is true', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: true })

            const tree = createTree()
            await tree.toggleExpand(1)

            const flat = tree.buildFlatList([makeItem(1, 'A', 2)])
            const sentinel = flat.find((n: any) => n._isLoadMore)
            expect(sentinel).toBeTruthy()
            expect(sentinel!._parentId).toBe(1)
            expect(sentinel!.id).toBe(-1)
        })

        it('omits sentinel when hasMore is false', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)

            const flat = tree.buildFlatList([makeItem(1, 'A', 2)])
            expect(flat.every((n: any) => !n._isLoadMore)).toBe(true)
        })

        it('collapsed nodes children are excluded', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)
            await tree.toggleExpand(1) // collapse

            const flat = tree.buildFlatList([makeItem(1, 'A', 2)])
            expect(flat).toHaveLength(1)
        })
    })

    describe('toggleExpand', () => {
        it('expand calls fetchChildren and caches result', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(5)

            expect(mockFetch).toHaveBeenCalledWith(5, 1)
        })

        it('does not re-fetch on second expand after collapse', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(5)
            await tree.toggleExpand(5) // collapse
            await tree.toggleExpand(5) // re-expand — uses cache

            expect(mockFetch).toHaveBeenCalledTimes(1)
        })

        it('collapse fires onCollapseCallback with descendant IDs', async () => {
            const children = [makeItem(10, 'A1', 2), makeItem(11, 'A2')]
            mockFetch
                .mockResolvedValueOnce({ results: children, hasMore: false })
                .mockResolvedValueOnce({ results: [makeItem(20, 'A1a')], hasMore: false })

            const tree = createTree()
            const collapseCb = vi.fn()
            tree.setOnCollapse(collapseCb)

            await tree.toggleExpand(1)  // expand parent
            await tree.toggleExpand(10) // expand child
            await tree.toggleExpand(1)  // collapse parent — should report 10, 20, 11

            expect(collapseCb).toHaveBeenCalledWith(expect.arrayContaining([10, 11, 20]))
        })

        it('does not add to expandedIds on fetch error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('network'))

            const tree = createTree()
            await tree.toggleExpand(5)

            const flat = tree.buildFlatList([makeItem(5, 'Node', 2)])
            // Should have only the root, no children
            expect(flat).toHaveLength(1)
        })
    })

    describe('loadMoreChildren', () => {
        it('appends results and increments page', async () => {
            mockFetch
                .mockResolvedValueOnce({ results: [makeItem(10, 'P1')], hasMore: true })
                .mockResolvedValueOnce({ results: [makeItem(11, 'P2')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)
            await tree.loadMoreChildren(1)

            const flat = tree.buildFlatList([makeItem(1, 'A', 5)])
            const items = flat.filter((n: any) => !n._isLoadMore && n.id !== 1)
            expect(items).toHaveLength(2)
        })

        it('is noop when hasMore is false', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)
            await tree.loadMoreChildren(1)

            expect(mockFetch).toHaveBeenCalledTimes(1) // only the initial fetch
        })
    })

    describe('updateCachedChild', () => {
        it('updates field and returns true when found', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)

            const found = tree.updateCachedChild(10, 'shopping', true)
            expect(found).toBe(true)
        })

        it('returns false when item not in cache', () => {
            const tree = createTree()
            expect(tree.updateCachedChild(999, 'shopping', true)).toBe(false)
        })
    })

    describe('treeActive', () => {
        it('false when treeEnabled is false', () => {
            treeEnabled.value = false
            const tree = createTree()
            expect(tree.treeActive.value).toBe(false)
        })

        it('false when model lacks tree support', () => {
            const noTreeModel = computed(() => ({ isTree: false, listSettings: {} }))
            const tree = useModelListTree(noTreeModel as any, mockFetch, treeEnabled as any)
            expect(tree.treeActive.value).toBe(false)
        })

        it('true when both enabled and model supports it', () => {
            const tree = createTree()
            expect(tree.treeActive.value).toBe(true)
        })
    })

    describe('clearTreeState', () => {
        it('resets expandedIds and clears cache', async () => {
            mockFetch.mockResolvedValueOnce({ results: [makeItem(10, 'Child')], hasMore: false })

            const tree = createTree()
            await tree.toggleExpand(1)
            tree.clearTreeState()

            const flat = tree.buildFlatList([makeItem(1, 'A', 2)])
            expect(flat).toHaveLength(1) // no expanded children
        })
    })
})
