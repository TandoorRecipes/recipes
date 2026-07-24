/**
 * Regression coverage for HierarchyEditor.
 *
 * Smoke test: mounts with a valid model + editingObj v-model, stubs
 * the three Hierarchy child components so we're testing the editor's
 * top-level wiring (useHierarchyTree integration, generic model lookup)
 * rather than rendering a full tree.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'

// HierarchyEditor → HelpView → @/i18n.ts → virtual:locale-coverage,
// which is provided by a Vite plugin not loaded in the vitest env. Short-
// circuit by mocking @/i18n so the virtual module is never reached.
vi.mock('@/i18n', () => ({
    SUPPORT_LOCALES: [{code: 'en', label: 'English'}],
    resolveLocale: (c: string) => c,
    localeCoverage: {en: 100},
    LOCALE_MIN_COVERAGE: 0,
}))

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: vi.fn()}),
}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))
vi.mock('@/stores/MessageStore', () => ({
    useMessageStore: () => ({addError: vi.fn(), addPreparedMessage: vi.fn()}),
    ErrorMessageType: {FETCH_ERROR: 'FETCH_ERROR', UPDATE_ERROR: 'UPDATE_ERROR', CREATE_ERROR: 'CREATE_ERROR', DELETE_ERROR: 'DELETE_ERROR'},
    PreparedMessage: {UPDATE_SUCCESS: 'UPDATE_SUCCESS', MOVE_SUCCESS: 'MOVE_SUCCESS'},
}))

import HierarchyEditor from '@/components/inputs/HierarchyEditor.vue'

function mountEditor() {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(HierarchyEditor, {
        props: {
            model: 'Food' as any,
            modelValue: {id: 1, name: 'Butter'} as any,
        } as any,
        global: {
            plugins: [createPinia(), i18n, vuetify],
            stubs: {
                HierarchyTree: {template: '<div class="stub-tree"/>'},
                HierarchyDrillDown: {template: '<div class="stub-drilldown"/>'},
                HierarchyControls: {template: '<div class="stub-controls"/>'},
            },
        },
    })
}

describe('HierarchyEditor', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        apiMock.apiFoodList = vi.fn().mockResolvedValue({results: [], count: 0})
        apiMock.apiFoodRetrieve.mockResolvedValue({id: 1, name: 'Butter'})
    })

    it('mounts without error', () => {
        const w = mountEditor()
        expect(w.exists()).toBe(true)
    })

    it('renders at least one of the hierarchy child stubs', () => {
        const w = mountEditor()
        const hasStub = w.find('.stub-tree').exists()
            || w.find('.stub-drilldown').exists()
            || w.find('.stub-controls').exists()
        expect(hasStub).toBe(true)
    })
})
