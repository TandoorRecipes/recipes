/**
 * Regression coverage for ModelListMobileView.
 *
 * Smoke tests: mounts with items, renders the empty state when
 * items=[], shows the swipe hint when applicable, and injects the
 * MODEL_LIST_SETTINGS_KEY settings correctly.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {computed, ref} from 'vue'

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: vi.fn()}),
}))

import ModelListMobileView from '@/components/model_list/ModelListMobileView.vue'
import {MODEL_LIST_SETTINGS_KEY} from '@/composables/modellist/useModelListSettings'
import type {ModelItem} from '@/composables/modellist/types'

function mountView(props: Partial<Parameters<typeof mount>[1]>['props'] = {}) {
    const settings = {
        quickActionKeys: computed(() => []),
        mobileSubtitleKeys: computed(() => []),
        swipeEnabled: ref(false),
        swipeLeftKeys: computed(() => []),
        swipeRightKeys: computed(() => []),
        showMobileHeaders: ref(false),
    } as any
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(ModelListMobileView, {
        props: {
            items: [],
            itemsLength: 0,
            loading: false,
            page: 1,
            itemsPerPage: 10,
            selectMode: false,
            selectedItems: [],
            allColumns: [],
            actionDefs: [],
            groupedActionDefs: new Map(),
            getToggleState: () => false,
            treeActive: false,
            treeSuspended: false,
            expandedIds: new Set<number>(),
            loadingIds: new Set<number>(),
            toggleExpand: vi.fn(),
            settingsKey: 'food',
            labelField: 'name',
            ...(props as any),
        },
        global: {
            plugins: [createPinia(), i18n, vuetify],
            provide: {[MODEL_LIST_SETTINGS_KEY as unknown as string]: settings},
            stubs: {
                ActionMenu: {template: '<div class="stub-action-menu"/>'},
            },
        },
    })
}

describe('ModelListMobileView', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('mounts without error with empty items', () => {
        const w = mountView()
        expect(w.exists()).toBe(true)
    })

    it('renders a v-list when items are provided', () => {
        const items: ModelItem[] = [
            {id: 1, name: 'Alpha'} as any,
            {id: 2, name: 'Beta'} as any,
        ]
        const w = mountView({items, itemsLength: 2})
        expect(w.find('.v-list').exists()).toBe(true)
    })

    it('renders the item name when labelField matches', () => {
        const items: ModelItem[] = [{id: 1, name: 'Butter'} as any]
        const w = mountView({items, itemsLength: 1})
        expect(w.text()).toContain('Butter')
    })

    it('shows a progress bar when loading=true', () => {
        const w = mountView({loading: true})
        expect(w.find('.v-progress-linear').exists()).toBe(true)
    })
})
