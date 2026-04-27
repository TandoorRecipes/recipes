import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeRecipeBook, makeUser } from '@/__tests__/factories'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
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

import BooksPage from '@/pages/BooksPage.vue'

describe('BooksPage', () => {
    beforeEach(() => {
        resetApiMock()
    })

    it('mounts without error', async () => {
        apiMock.apiRecipeBookList.mockResolvedValue({ results: [], count: 0 })
        const wrapper = mountPage(BooksPage)
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('calls apiRecipeBookList on mount', async () => {
        apiMock.apiRecipeBookList.mockResolvedValue({ results: [], count: 0 })
        mountPage(BooksPage)
        await flushPromises()
        expect(apiMock.apiRecipeBookList).toHaveBeenCalled()
    })

    it('renders book cards from API response', async () => {
        const books = [
            makeRecipeBook({ id: 1, name: 'Favorites' }),
            makeRecipeBook({ id: 2, name: 'Weeknight Dinners' }),
        ]
        apiMock.apiRecipeBookList.mockResolvedValue({ results: books, count: 2 })

        const wrapper = mountPage(BooksPage)
        await flushPromises()

        expect(wrapper.text()).toContain('Favorites')
        expect(wrapper.text()).toContain('Weeknight Dinners')
    })

    it('renders empty state when no books', async () => {
        apiMock.apiRecipeBookList.mockResolvedValue({ results: [], count: 0 })
        const wrapper = mountPage(BooksPage)
        await flushPromises()

        // No book cards rendered
        expect(wrapper.text()).not.toContain('Favorites')
    })
})
