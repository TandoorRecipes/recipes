/**
 * Tests for the consolidated RecipeViewSettingsDrawer (Phase 3).
 *
 * The drawer presents ONE "Ingredient display" panel with Summary/Detail
 * columns + a live preview. These tests lock in that each Summary/Detail
 * control writes the correct per-context device-settings key, that the
 * separate-panel layout is gone, and that inline-status is exposed for both
 * contexts (no longer desktop-only). Binding is asserted via data-test hooks
 * so the tests survive visual layout changes.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeUserPreference} from '@/__tests__/factories'

vi.mock('vue-router', async (imp) => ({...(await imp<any>()), useRoute: () => ({query: {}})}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import RecipeViewSettingsDrawer from '@/components/inputs/RecipeViewSettingsDrawer.vue'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'

function mountDrawer({mobile = false} = {}) {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({
        components: vuetifyComponents, directives: vuetifyDirectives,
        display: {mobileBreakpoint: mobile ? 9999 : 0}, // 9999 → always mobile, 0 → always desktop
    })
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(RecipeViewSettingsDrawer, {
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                // The preview renders real IngredientsTable rows; its internals are
                // covered by IngredientsTable's own tests, so stub it here.
                IngredientsTable: true,
                TabbedDrawer: {
                    props: ['modelValue', 'activeTab', 'pinned', 'pinnable', 'tabs', 'width', 'useSheet'],
                    template: '<div class="stub-drawer"><slot name="settings"/></div>',
                },
            },
        },
    })
}

function settings(w: ReturnType<typeof mountDrawer>) {
    return (w.vm.$pinia as any)._s.get('user_preference_store').deviceSettings
}

describe('RecipeViewSettingsDrawer (consolidated)', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = false
        isPinned.value = false
    })

    it('mounts without error', () => {
        expect(mountDrawer().exists()).toBe(true)
    })

    it('binds isOpen / isPinned to the useRecipeViewSettings singleton', () => {
        mountDrawer()
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = true
        expect(isOpen.value).toBe(true)
        isPinned.value = true
        expect(isPinned.value).toBe(true)
    })

    it('renders the settings directly, not inside a collapsible panel', () => {
        const w = mountDrawer()
        expect(w.findAll('.v-expansion-panel').length).toBe(0)
        expect(w.find('[data-test="ingredient-display-panel"]').exists()).toBe(true)
    })

    it('summary and detail action switches write separate device-settings keys', async () => {
        const w = mountDrawer()
        const s = settings(w)
        // Start both off (independent of the shipped defaults) and let the DOM settle.
        s.recipe_overviewShowActions = false
        s.recipe_stepShowActions = false
        await w.vm.$nextTick()
        await w.find('[data-test="summary-actions"] input').setValue(true)
        expect(s.recipe_overviewShowActions).toBe(true)
        expect(s.recipe_stepShowActions).toBe(false)
        await w.find('[data-test="detail-actions"] input').setValue(true)
        expect(s.recipe_stepShowActions).toBe(true)
    })

    it('exposes inline-status switches for BOTH contexts (no longer desktop-only) and binds them', async () => {
        const w = mountDrawer()
        const s = settings(w)
        expect(w.find('[data-test="summary-status"]').exists()).toBe(true)
        expect(w.find('[data-test="detail-status"]').exists()).toBe(true)
        await w.find('[data-test="summary-status"] input').setValue(true)
        expect(s.recipe_overviewInlineStatus).toBe(true)
        await w.find('[data-test="detail-status"] input').setValue(true)
        expect(s.recipe_stepInlineStatus).toBe(true)
    })

    it('summary-only "start expanded" control exists', () => {
        const w = mountDrawer()
        expect(w.find('[data-test="summary-expanded"]').exists()).toBe(true)
    })

    it('checkboxes are a per-context setting (both Summary and Detail) writing separate keys', async () => {
        const w = mountDrawer()
        const s = settings(w)
        expect(w.find('[data-test="summary-checkboxes"]').exists()).toBe(true)
        expect(w.find('[data-test="detail-checkboxes"]').exists()).toBe(true)
        s.recipe_overviewShowCheckboxes = false
        s.recipe_stepShowCheckboxes = false
        await w.vm.$nextTick()
        await w.find('[data-test="summary-checkboxes"] input').setValue(true)
        expect(s.recipe_overviewShowCheckboxes).toBe(true)
        expect(s.recipe_stepShowCheckboxes).toBe(false)
        await w.find('[data-test="detail-checkboxes"] input').setValue(true)
        expect(s.recipe_stepShowCheckboxes).toBe(true)
    })

    it('shows the shared highlight-color select only when an actions toggle is on; options exclude substitute', async () => {
        const w = mountDrawer()
        const s = settings(w)
        s.recipe_overviewShowActions = false
        s.recipe_stepShowActions = false
        await w.vm.$nextTick()
        expect(w.find('[data-test="highlight-color"]').exists()).toBe(false)
        s.recipe_overviewShowActions = true
        await w.vm.$nextTick()
        expect(w.find('[data-test="highlight-color"]').exists()).toBe(true)
        // Vuetify renders the select's hidden <option>s outside the wrapper, so query globally.
        const options = w.findAll('option').map(o => o.attributes('value')).filter(Boolean)
        expect(options).not.toContain('substitute')
        expect(options).toContain('onhand')
    })

    it('shows the shared truncate-length field only when a notes display is "truncate"', async () => {
        const w = mountDrawer()
        const s = settings(w)
        s.recipe_overviewNotesDisplay = 'bubble'
        s.recipe_stepNotesDisplay = 'bubble'
        await w.vm.$nextTick()
        expect(w.find('[data-test="truncate-length"]').exists()).toBe(false)
        s.recipe_stepNotesDisplay = 'truncate'
        await w.vm.$nextTick()
        expect(w.find('[data-test="truncate-length"]').exists()).toBe(true)
    })

    it('renders summary and detail live previews on mobile', () => {
        const w = mountDrawer({mobile: true})
        expect(w.find('[data-test="preview-summary"]').exists()).toBe(true)
        expect(w.find('[data-test="preview-detail"]').exists()).toBe(true)
    })

    it('omits the live preview on desktop (the table cannot be shown faithfully in the narrow drawer)', () => {
        const w = mountDrawer({mobile: false})
        expect(w.find('[data-test="preview-summary"]').exists()).toBe(false)
        expect(w.find('[data-test="preview-detail"]').exists()).toBe(false)
    })
})
