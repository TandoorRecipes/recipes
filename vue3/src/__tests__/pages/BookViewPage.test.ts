import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeRecipeBook, makeRecipeBookEntry, makeRecipeOverview } from '@/__tests__/factories'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import BookViewPage from '@/pages/BookViewPage.vue'

describe('BookViewPage', () => {
    beforeEach(() => {
        resetApiMock()
    })

    function mountBookPage(bookId = '1') {
        return mountPage(BookViewPage, {
            props: { bookId },
        })
    }

    it('mounts without error', async () => {
        apiMock.apiRecipeBookRetrieve.mockResolvedValue(makeRecipeBook({ id: 1, name: 'Favorites' }))
        apiMock.apiRecipeBookEntryList.mockResolvedValue({ results: [], count: 0, next: null })

        const wrapper = mountBookPage()
        await flushPromises()

        expect(wrapper.exists()).toBe(true)
    })

    it('displays book name', async () => {
        apiMock.apiRecipeBookRetrieve.mockResolvedValue(makeRecipeBook({ name: 'Holiday Recipes' }))
        apiMock.apiRecipeBookEntryList.mockResolvedValue({ results: [], count: 0, next: null })

        const wrapper = mountBookPage()
        await flushPromises()

        expect(wrapper.text()).toContain('Holiday Recipes')
    })

    it('calls apiRecipeBookRetrieve with bookId prop', async () => {
        apiMock.apiRecipeBookRetrieve.mockResolvedValue(makeRecipeBook())
        apiMock.apiRecipeBookEntryList.mockResolvedValue({ results: [], count: 0, next: null })

        mountBookPage('42')
        await flushPromises()

        expect(apiMock.apiRecipeBookRetrieve).toHaveBeenCalledWith({ id: '42' })
    })

    it('loads book entries after book loads', async () => {
        apiMock.apiRecipeBookRetrieve.mockResolvedValue(makeRecipeBook({ id: 1 }))
        apiMock.apiRecipeBookEntryList.mockResolvedValue({
            results: [
                makeRecipeBookEntry({ recipeContent: makeRecipeOverview({ name: 'Cookies' }) }),
                makeRecipeBookEntry({ recipeContent: makeRecipeOverview({ name: 'Cake' }) }),
            ],
            count: 2,
            next: null,
        })

        const wrapper = mountBookPage()
        await flushPromises()

        expect(apiMock.apiRecipeBookEntryList).toHaveBeenCalled()
    })

    it('displays shared users when present', async () => {
        const book = makeRecipeBook({
            shared: [{ id: 2, username: 'chef', displayName: 'Chef Bob' } as any],
        })
        apiMock.apiRecipeBookRetrieve.mockResolvedValue(book)
        apiMock.apiRecipeBookEntryList.mockResolvedValue({ results: [], count: 0, next: null })

        const wrapper = mountBookPage()
        await flushPromises()

        expect(wrapper.text()).toContain('Chef Bob')
    })
})
