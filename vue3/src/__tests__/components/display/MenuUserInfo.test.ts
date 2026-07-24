import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { makeUserPreference, makeSpace } from '@/__tests__/factories'

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return { useStorage: (_k: string, d: unknown) => ref(d) }
})

import MenuUserInfo from '@/components/display/MenuUserInfo.vue'

// Regression coverage for the user-avatar feature that was dropped from
// feature/photo-enhancements during the 2026-06-30 real-stacked rebuild
// (same squash-drop that ate the RecipeImage gallery). The sidebar chip must
// show the uploaded avatar image when one is set, and fall back to the
// display-name initial otherwise.
function mountMenu(image: unknown, displayName = 'Zoe') {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            const up = makeUserPreference() as Record<string, unknown>
            up.image = image
            up.user = { ...(up.user as object ?? {}), id: 1, displayName }
            store.userSettings = up
            store.activeSpace = makeSpace()
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div/>' } }] })
    return mount(MenuUserInfo, { global: { plugins: [pinia, i18n, router] } })
}

describe('MenuUserInfo — sidebar avatar', () => {
    it('renders the uploaded avatar image when image.preview is set', () => {
        const w = mountMenu({ preview: 'https://example.test/av.jpg', cropData: null })
        const vimg = w.findComponent({ name: 'VImg' })
        expect(vimg.exists()).toBe(true)
        expect(vimg.props('src')).toBe('https://example.test/av.jpg')
    })

    it('falls back to the display-name initial when no avatar image is set', () => {
        const w = mountMenu(null, 'Zoe')
        expect(w.findComponent({ name: 'VImg' }).exists()).toBe(false)
        expect(w.text()).toContain('Z')
    })
})
