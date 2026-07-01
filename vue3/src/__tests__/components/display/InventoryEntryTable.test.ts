import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
}))

import InventoryEntryTable from '@/components/display/InventoryEntryTable.vue'

describe('InventoryEntryTable pagination (R09-3)', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiInventoryEntryList.mockResolvedValue({ results: [], count: 25 })
    })

    it('sends page and pageSize to the API so the server paginates', async () => {
        // Bug: loadItems passed only food/location filters, so the API returned
        // every row and v-data-table-server (server mode, no client slicing)
        // rendered all of them while the footer claimed "1-N of count".
        const wrapper = mountPage(InventoryEntryTable)
        await flushPromises()

        const table = wrapper.findComponent({ name: 'VDataTableServer' })
        table.vm.$emit('update:options', { page: 3, itemsPerPage: 10 })
        await flushPromises()

        const params = apiMock.apiInventoryEntryList.mock.calls.at(-1)![0]
        expect(params.page).toBe(3)
        expect(params.pageSize).toBe(10)
    })
})
