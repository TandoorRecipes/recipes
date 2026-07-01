/**
 * UserFileField — server-driven search table contract.
 *
 * The file picker's Search tab must paginate on the server (page / pageSize /
 * query) so users with >50 UserFiles can find files beyond the first page.
 * Prior behavior fetched the first 50 and filtered client-side.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import {createPinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {apiMock, resetApiMock} from '@/__tests__/api-mock'

vi.mock('@/openapi', async (imp) => ({
    ...(await imp<any>()),
    ApiApi: class { constructor() { return apiMock } },
}))

import UserFileField from '@/components/inputs/UserFileField.vue'

function okResponse(results: any[] = [], count = 0) {
    return {results, count, next: null, previous: null}
}

function mountField() {
    const pinia = createPinia()
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {
            Files: 'Files', Preview: 'Preview', New: 'New', Search: 'Search',
            Name: 'Name', created_on: 'Created', created_by: 'By',
            'Quick actions': 'Quick actions', select_file: 'Select file',
            Save: 'Save', Cancel: 'Cancel', Close: 'Close', Crop: 'Crop',
            Download: 'Download', Remove: 'Remove', Delete: 'Delete',
        }},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify({components, directives})
    return mount(UserFileField, {
        global: {
            plugins: [pinia, i18n, vuetify],
            stubs: {
                ImageEditor: {template: '<div class="stub-image-editor" />'},
            },
        },
    })
}

describe('UserFileField server-driven Search tab', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiUserFileList.mockResolvedValue(okResponse([], 0))
    })

    it('opens the dialog and loads files with pagination args', async () => {
        const w = mountField()
        w.vm.dialog = true
        await flushPromises()

        expect(apiMock.apiUserFileList).toHaveBeenCalled()
        const call = apiMock.apiUserFileList.mock.calls.at(-1)![0]
        expect(call).toMatchObject({page: expect.any(Number), pageSize: expect.any(Number)})
    })

    it('passes query to the API when the search input changes', async () => {
        const w = mountField()
        w.vm.dialog = true
        await flushPromises()
        apiMock.apiUserFileList.mockClear()

        w.vm.tableSearch = 'chicken'
        await flushPromises()

        expect(apiMock.apiUserFileList).toHaveBeenCalled()
        const call = apiMock.apiUserFileList.mock.calls.at(-1)![0]
        expect(call).toMatchObject({query: 'chicken', page: 1})
    })

    it('passes updated page/pageSize when the table emits update:options', async () => {
        const w = mountField()
        w.vm.dialog = true
        await flushPromises()
        apiMock.apiUserFileList.mockClear()

        w.vm.loadItems({page: 3, itemsPerPage: 25, sortBy: [], search: ''})
        await flushPromises()

        expect(apiMock.apiUserFileList).toHaveBeenCalled()
        const call = apiMock.apiUserFileList.mock.calls.at(-1)![0]
        expect(call).toMatchObject({page: 3, pageSize: 25})
    })

    it('stores items-length from the server response for v-data-table-server', async () => {
        apiMock.apiUserFileList.mockResolvedValueOnce(okResponse([{id: 1, name: 'a'}], 699))
        const w = mountField()
        w.vm.dialog = true
        await flushPromises()

        expect(w.vm.itemCount).toBe(699)
        expect(w.vm.userFiles).toHaveLength(1)
    })
})
