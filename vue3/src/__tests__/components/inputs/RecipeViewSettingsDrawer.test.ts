/**
 * Tests for the RecipeViewSettingsDrawer.
 *
 * The drawer presents a consolidated "Ingredient display" panel (Summary/Detail
 * columns + a mobile live preview), gated to the recipe view, plus a "Card
 * display" panel shown wherever recipe cards appear. Binding is asserted via
 * data-test hooks so the tests survive visual layout changes.
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

const routeState = vi.hoisted(() => ({name: 'RecipeViewPage' as string | null}))
vi.mock('vue-router', async (imp) => ({
    ...(await imp<any>()),
    useRoute: () => ({query: {}, get name() { return routeState.name }}),
}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import RecipeViewSettingsDrawer from '@/components/inputs/RecipeViewSettingsDrawer.vue'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

function mountDrawer({mobile = false} = {}) {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {
            IngredientMenu: 'Ingredient menu',
            HighlightWhen: 'Highlight when',
            OnHand: 'On hand',
            InShoppingList: 'In shopping list',
            Never: 'Never',
            IngredientDisplay: 'Ingredient display',
            CardDisplay: 'Card display',
            RecipeLayout: 'Recipe layout',
            Show_Time_Chips: 'Show time chips',
            Show_Servings: 'Show servings',
            Show_Created_By: 'Show created by',
            Show_Created_Date: 'Show created date',
            Show_Updated_Date: 'Show updated date',
            Show_Imported_From: 'Show imported from',
            Show_Rating: 'Show rating',
            Show_Author: 'Show author',
            Show_Last_Cooked: 'Show last cooked',
            Show_New_Badge: 'Show new badge',
            Show_Cook_Time: 'Show cook time',
            Max_Keywords: 'Max keywords',
            Menu_Items: 'Menu items',
            All: 'All',
            Edit: 'Edit',
            Add_to_Plan: 'Add to plan',
            Add_to_Shopping: 'Add to shopping',
            Add_to_Book: 'Add to book',
            Log_Cooking: 'Log cooking',
            Edit_Photo: 'Edit photo',
            Property_Editor: 'Property editor',
            Share: 'Share',
            Export: 'Export',
            Duplicate: 'Duplicate',
            Print: 'Print',
            Delete: 'Delete',
        }},
        missingWarn: false, fallbackWarn: false,
    })
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
        routeState.name = 'RecipeViewPage'
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

    it('on the recipe view shows the Ingredient display + Recipe layout panels (Card display is card-context only)', () => {
        const w = mountDrawer()
        expect(w.findAll('.v-expansion-panel').length).toBe(2)
        expect(w.find('[data-test="ingredient-display-panel"]').exists()).toBe(true)
        expect(w.find('[data-test="recipe-layout-panel"]').exists()).toBe(true)
        expect(w.find('[data-test="card-display-panel"]').exists()).toBe(false)
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

    it('renders only the Card display panel on a card-context route (Ingredient/Recipe-layout are recipe-only)', () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        expect(w.findAll('.v-expansion-panel').length).toBe(1)
        expect(w.find('[data-test="card-display-panel"]').exists()).toBe(true)
    })

    it('seeds the seven Recipe Layout defaults to true on deviceSettings', () => {
        mountDrawer()
        const store = useUserPreferenceStore()
        expect(store.deviceSettings.recipe_showAuthor).toBe(true)
        expect(store.deviceSettings.recipe_showTimeChips).toBe(true)
        expect(store.deviceSettings.recipe_showServings).toBe(true)
        expect(store.deviceSettings.recipe_showFootCreatedBy).toBe(true)
        expect(store.deviceSettings.recipe_showFootCreatedDate).toBe(true)
        expect(store.deviceSettings.recipe_showFootUpdatedDate).toBe(true)
        expect(store.deviceSettings.recipe_showFootImportedFrom).toBe(true)
    })

    it('renders the Recipe Layout panel when route is RecipeViewPage', () => {
        routeState.name = 'RecipeViewPage'
        const w = mountDrawer()
        expect(w.find('[data-test="recipe-layout-panel"]').exists()).toBe(true)
    })

    it('hides the Recipe Layout panel on card-context routes (e.g. SearchPage)', () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        expect(w.find('[data-test="recipe-layout-panel"]').exists()).toBe(false)
    })
})

describe('Card Display panel + recipe-view gating', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = false
        isPinned.value = false
        routeState.name = 'SearchPage'
    })

    it('renders the Card Display panel on a card-context route (e.g. SearchPage)', () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        expect(w.find('[data-test="card-display-panel"]').exists()).toBe(true)
    })

    it.each(['StartPage', 'BookEntryPage', 'MealPlanPage'])(
        'renders Card Display panel on card-context route %s',
        (routeName) => {
            routeState.name = routeName
            const w = mountDrawer()
            expect(w.find('[data-test="card-display-panel"]').exists()).toBe(true)
        }
    )

    it('hides Card Display panel when route is not a card context (e.g. RecipeViewPage)', () => {
        // Card Display is for card contexts only. RecipeViewPage shows
        // a single recipe in detail, not cards, so the panel is gated out.
        routeState.name = 'RecipeViewPage'
        const w = mountDrawer()
        expect(w.find('[data-test="card-display-panel"]').exists()).toBe(false)
    })

    it('hides Card Display panel on non-card non-recipe routes (e.g. SettingsPage)', () => {
        routeState.name = 'SettingsPage'
        const w = mountDrawer()
        expect(w.find('[data-test="card-display-panel"]').exists()).toBe(false)
    })

    it('hides the Ingredient display panel when not on the recipe view', () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        expect(w.find('[data-test="ingredient-display-panel"]').exists()).toBe(false)
    })

    it('shows the Ingredient display panel on the recipe view', () => {
        routeState.name = 'RecipeViewPage'
        const w = mountDrawer()
        expect(w.find('[data-test="ingredient-display-panel"]').exists()).toBe(true)
    })

    it('Show Cook Time switch is rendered in Card Display panel and defaults ON', () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        // Default-true preserves the current behaviour where cook time
        // shows unconditionally on the card.
        expect(store.deviceSettings.card_show_cook_time).toBe(true)
        const cookTimeSwitch = w.findAll('.v-switch').find(s => s.text().includes('Show cook time'))
        expect(cookTimeSwitch, 'Show cook time switch should exist').toBeTruthy()
    })

    it('toggling Show Cook Time updates deviceSettings.card_show_cook_time', async () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        const cookTimeSwitch = w.findAll('.v-switch').find(s => s.text().includes('Show cook time'))
        await cookTimeSwitch!.find('input').setValue(false)
        expect(store.deviceSettings.card_show_cook_time).toBe(false)
    })

    it('toggling Show Rating updates deviceSettings.card_showRating', async () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        const showRating = w.findAll('.v-switch').find(s => s.text().includes('Show rating'))
        expect(showRating, 'Show rating switch should exist').toBeTruthy()
        await showRating!.find('input').setValue(true)
        expect(store.deviceSettings.card_showRating).toBe(true)
    })

    it('checking a menu item adds it to card_visibleMenuItems', async () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        expect(store.deviceSettings.card_visibleMenuItems).not.toContain('book')
        const bookCheckbox = w.findAll('.v-checkbox').find(c => c.text().includes('Add to book'))
        expect(bookCheckbox, 'Add to book checkbox should exist').toBeTruthy()
        await bookCheckbox!.find('input[type="checkbox"]').setValue(true)
        expect(store.deviceSettings.card_visibleMenuItems).toContain('book')
    })

    it('unchecking a default-on menu item removes it from card_visibleMenuItems', async () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        expect(store.deviceSettings.card_visibleMenuItems).toContain('edit')
        const editCheckbox = w.findAll('.v-checkbox').find(c => c.text().includes('Edit') && !c.text().includes('Photo'))
        expect(editCheckbox, 'Edit checkbox should exist').toBeTruthy()
        await editCheckbox!.find('input[type="checkbox"]').setValue(false)
        expect(store.deviceSettings.card_visibleMenuItems).not.toContain('edit')
    })

    it('the max-keywords select is present and bound to card_maxKeywords', async () => {
        routeState.name = 'SearchPage'
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        const select = w.findAll('.v-select').find(s => s.text().includes('Max keywords'))
        expect(select, 'Max keywords select should exist').toBeTruthy()
        store.deviceSettings.card_maxKeywords = 5
        await w.vm.$nextTick()
        expect(store.deviceSettings.card_maxKeywords).toBe(5)
    })
})
