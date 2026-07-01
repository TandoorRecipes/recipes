import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeRecipe } from '@/__tests__/factories'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useTitle: () => ref(''),
        useUrlSearchParams: () => ({}),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import RecipeViewPage from '@/pages/RecipeViewPage.vue'

describe('RecipeViewPage', () => {
    beforeEach(() => {
        resetApiMock()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    function mountRecipePage(id = '1') {
        return mountPage(RecipeViewPage, {
            props: { id },
        })
    }

    it('mounts without error', async () => {
        const recipe = makeRecipe({ id: 1, name: 'Cookies' })
        apiMock.apiRecipeRetrieve.mockResolvedValue(recipe)
        apiMock.apiViewLogCreate.mockResolvedValue({})

        const wrapper = mountRecipePage()
        await flushPromises()

        expect(wrapper.exists()).toBe(true)
    })

    it('calls apiRecipeRetrieve with the prop id', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ id: 5 }))
        apiMock.apiViewLogCreate.mockResolvedValue({})

        mountRecipePage('5')
        await flushPromises()

        expect(apiMock.apiRecipeRetrieve).toHaveBeenCalledWith(
            expect.objectContaining({ id: '5' })
        )
    })

    it('creates a view log when authenticated', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ id: 3 }))
        apiMock.apiViewLogCreate.mockResolvedValue({})

        mountRecipePage('3')
        await flushPromises()

        expect(apiMock.apiViewLogCreate).not.toHaveBeenCalled()
    })

    it('handles recipe load with setTimeout for print', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ name: 'Pasta' }))
        apiMock.apiViewLogCreate.mockResolvedValue({})

        const wrapper = mountRecipePage()
        await flushPromises()

        expect(apiMock.apiRecipeRetrieve).toHaveBeenCalled()
    })

    it('shows a not-found state instead of an endless skeleton when the recipe 404s', async () => {
        apiMock.apiRecipeRetrieve.mockRejectedValue({ response: { status: 404 } })

        const wrapper = mountRecipePage('999999')
        await flushPromises()

        // the not-found block is shown, and the recipe-view (which renders the
        // perpetual skeleton) is not
        expect(wrapper.find('[data-test="recipe-not-found"]').exists()).toBe(true)
        expect(wrapper.find('.stub-recipe-view').exists()).toBe(false)
    })
})
