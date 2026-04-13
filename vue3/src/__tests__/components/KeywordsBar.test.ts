import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { makeKeywordLabel, makeUserPreference, makeSpace } from '../factories'

vi.mock('@/openapi', () => ({
    ApiApi: class {},
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useClipboard: () => ({ copy: vi.fn(), copied: ref(false) }),
        useWakeLock: () => ({ request: vi.fn(), release: vi.fn() }),
        useUrlSearchParams: () => ({}),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

vi.mock('@/utils/cookie', () => ({
    getCookie: () => 'test-csrf-token',
}))

import KeywordsBar from '@/components/display/KeywordsBar.vue'

function createTestApp() {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.activeSpace = makeSpace() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', name: 'StartPage', component: { template: '<div/>' } }],
    })
    return { pinia, i18n, vuetify, router }
}

function mountKeywordsBar(props: Record<string, any> = {}) {
    const { pinia, i18n, vuetify, router } = createTestApp()
    return mount(KeywordsBar, {
        props,
        global: { plugins: [pinia, i18n, vuetify, router] },
    })
}

function makeKeywords(count: number) {
    return Array.from({ length: count }, (_, i) =>
        makeKeywordLabel({ id: i + 1, label: `keyword-${i + 1}` })
    )
}

describe('KeywordsBar', () => {
    it('renders all keywords when maxKeywords is 0', () => {
        const keywords = makeKeywords(5)
        const w = mountKeywordsBar({ keywords, maxKeywords: 0 })
        const chips = w.findAll('v-chip')
        expect(chips).toHaveLength(5)
    })

    it('truncates keywords and shows +N chip when maxKeywords exceeded', () => {
        const keywords = makeKeywords(5)
        const w = mountKeywordsBar({ keywords, maxKeywords: 3 })
        const chips = w.findAll('v-chip')
        // 3 keyword chips + 1 overflow chip
        expect(chips).toHaveLength(4)
        expect(chips[3].text()).toContain('+2')
    })

    it('does not show +N chip when keywords fit within maxKeywords', () => {
        const keywords = makeKeywords(2)
        const w = mountKeywordsBar({ keywords, maxKeywords: 3 })
        const chips = w.findAll('v-chip')
        expect(chips).toHaveLength(2)
    })

    it('does not show +N chip when keywords exactly equal maxKeywords', () => {
        const keywords = makeKeywords(3)
        const w = mountKeywordsBar({ keywords, maxKeywords: 3 })
        const chips = w.findAll('v-chip')
        expect(chips).toHaveLength(3)
    })
})
