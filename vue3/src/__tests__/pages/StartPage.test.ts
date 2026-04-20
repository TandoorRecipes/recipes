import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
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

import StartPage from '@/pages/StartPage.vue'

describe('StartPage', () => {
    beforeEach(() => {
        resetApiMock()
    })

    it('calls apiRecipeList on mount', async () => {
        apiMock.apiRecipeList.mockResolvedValue({ results: [], count: 0 })
        mountPage(StartPage)
        await flushPromises()
        expect(apiMock.apiRecipeList).toHaveBeenCalledWith({ pageSize: 1 })
    })

    it('shows empty state when no recipes exist', async () => {
        apiMock.apiRecipeList.mockResolvedValue({ results: [], count: 0 })
        const wrapper = mountPage(StartPage)
        await flushPromises()
        expect(wrapper.text()).toContain('search_no_recipes')
    })

    it('shows recipe scrollers when recipes exist', async () => {
        apiMock.apiRecipeList.mockResolvedValue({ results: [{}], count: 15 })
        const wrapper = mountPage(StartPage)
        await flushPromises()
        expect(wrapper.text()).not.toContain('search_no_recipes')
        expect(wrapper.findAll('.stub-horizontal-recipe-scroller').length).toBeGreaterThan(0)
    })

    it('shows random scroller even with few recipes', async () => {
        apiMock.apiRecipeList.mockResolvedValue({ results: [{}], count: 5 })
        const wrapper = mountPage(StartPage)
        await flushPromises()
        // totalRecipes > 0 but <= 10: only random scroller shows
        expect(wrapper.findAll('.stub-horizontal-recipe-scroller').length).toBe(1)
    })
})
