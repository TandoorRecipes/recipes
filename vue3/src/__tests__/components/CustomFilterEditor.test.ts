import {describe, it, expect, beforeEach, vi} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {apiMock, resetApiMock} from '@/__tests__/api-mock'

vi.mock('@/openapi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/openapi')>()
    return {...actual, ApiApi: class {constructor() { return apiMock }}}
})
vi.mock('@vueuse/core', async (importOriginal) => {
    const {ref} = await import('vue')
    return {...(await importOriginal<typeof import('@vueuse/core')>()), useStorage: (_k: string, d: any) => ref(d)}
})
vi.mock('vue-router', () => ({useRouter: () => ({push: vi.fn()})}))
vi.mock('@vueuse/router', () => ({useRouteQuery: () => ({value: false})}))
vi.mock('vuetify', async (importOriginal) => ({...(await importOriginal<typeof import('vuetify')>()), useTheme: () => ({change: vi.fn()})}))

import CustomFilterEditor from '@/components/model_editors/CustomFilterEditor.vue'

function mountEditor(search: any) {
    const pinia = createPinia(); setActivePinia(pinia)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(CustomFilterEditor, {
        props: {item: {id: 3, name: 'F', type: 'RECIPE', search, shared: []} as any},
        global: {
            plugins: [pinia, i18n, vuetify],
            stubs: {ModelEditorBase: {template: '<div><slot/></div>'}, ModelSelect: {template: '<div/>'}},
        },
    })
}

describe('CustomFilterEditor — sort + unknown-key notice', () => {
    beforeEach(() => resetApiMock())

    it('reads and writes search.sort_order via the sort dropdown, clearing on empty', async () => {
        const w = mountEditor({keywords: [1], sort_order: '-rating'})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.sortOrder).toBe('-rating')
        vm.sortOrder = 'name'
        expect(vm.sortOrder).toBe('name')
        vm.sortOrder = ''
        expect(vm.sortOrder).toBe('')  // cleared (sort_order removed)
        w.unmount()
    })

    it('flags a search with unrecognized foreign keys but not derived/recognized ones', async () => {
        const foreign = mountEditor({keywords: [1], foo: 'legacy'})
        await flushPromises()
        expect((foreign.vm as any).hasUnknownKeys).toBe(true)
        foreign.unmount()

        const derived = mountEditor({keywords: [1], servings_gte: 5, sort_order: 'name'})
        await flushPromises()
        expect((derived.vm as any).hasUnknownKeys).toBe(false)
        derived.unmount()
    })
})
