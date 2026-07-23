/**
 * Regression / resurrection-guard: saving a UserSpace must refresh the store's
 * userSpaces list (onAfterSave -> loadUserSpaces). The fork's food-filters
 * refactor dropped this callback, leaving activeUserSpace (a computed derived
 * from the persisted userSpaces list) stale after an edit.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeUserSpace} from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/openapi')>()
    return {
        ...actual,
        ApiApi: class {constructor() { return apiMock }},
        ResponseError: class extends Error {
            response: any
            constructor(r: any) { super(); this.response = r }
        },
    }
})

vi.mock('@vueuse/core', async (importOriginal) => {
    const {ref} = await import('vue')
    return {
        ...(await importOriginal<typeof import('@vueuse/core')>()),
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

// UserPreferenceStore setup pulls in router/i18n/theme — stub them (as the store test does)
vi.mock('vue-router', () => ({
    useRouter: () => ({push: vi.fn().mockResolvedValue(undefined)}),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({value: false}),
}))

vi.mock('vue-i18n', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vue-i18n')>()),
    useI18n: () => ({t: (key: string) => key}),
}))

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({change: vi.fn()}),
}))

import UserSpaceEditor from '@/components/model_editors/UserSpaceEditor.vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

describe('UserSpaceEditor', () => {
    beforeEach(() => {
        resetApiMock()
    })

    it('refreshes the store user-space list after saving an edit', async () => {
        const pinia = createPinia()
        setActivePinia(pinia)

        const item = makeUserSpace({id: 5})
        ;(apiMock as any).apiGroupList = vi.fn().mockResolvedValue([])
        ;(apiMock as any).apiUserSpaceUpdate = vi.fn().mockResolvedValue(item)
        // loadUserSpaces() re-fetches via this endpoint — assert it fires after save
        ;(apiMock as any).apiUserSpaceAllPersonalList = vi.fn().mockResolvedValue([])

        const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
        const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})

        const w = mount(UserSpaceEditor, {
            props: {item},
            global: {
                plugins: [pinia, i18n, vuetify],
                stubs: {
                    ModelEditorBase: {
                        template: '<div><button class="save-btn" @click="$emit(\'save\')" /></div>',
                        emits: ['save'],
                    },
                    ModelSelect: {template: '<div />'},
                },
            },
        })
        await flushPromises()

        await w.find('.save-btn').trigger('click')
        await flushPromises()

        expect((apiMock as any).apiUserSpaceUpdate).toHaveBeenCalled()
        expect((apiMock as any).apiUserSpaceAllPersonalList).toHaveBeenCalled()

        w.unmount()
    })
})
