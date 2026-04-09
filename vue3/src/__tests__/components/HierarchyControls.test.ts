import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import {createRouter, createMemoryHistory} from 'vue-router'

vi.mock('@/openapi', () => ({
    ApiApi: class {},
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => ({
            model: {name: 'Food', isMerge: true},
            merge: vi.fn(),
        }),
    }
})

vi.mock('@vueuse/core', async () => {
    const {ref} = await import('vue')
    return {useStorage: (_key: string, defaultValue: any) => ref(defaultValue)}
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({value: false}),
}))

import HierarchyControls from '@/components/hierarchy/HierarchyControls.vue'

function makeItem(id: number, name: string) {
    return {id, name, parent: null} as any
}

function mountControls(props: Partial<InstanceType<typeof HierarchyControls>['$props']> = {}) {
    const pinia = createPinia()
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {
        AddChild: 'Add child to',
        Parent: 'Set parent of',
        Merge: 'Merge',
        RemoveParent: 'Remove Parent',
        Edit: 'Edit',
        Recipes: 'Recipes',
        'will be deleted': 'will be deleted',
        Settings: 'Settings',
        Search: 'Search',
    }}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', component: {template: '<div/>'}},
            {path: '/search', name: 'SearchPage', component: {template: '<div/>'}},
            {path: '/edit/:model/:id', name: 'ModelEditPage', component: {template: '<div/>'}},
        ],
    })

    return mount(HierarchyControls, {
        props: {
            selectedItem: makeItem(5, 'Garlic'),
            editingItem: makeItem(1, 'Produce'),
            model: 'Food' as const,
            operating: false,
            ...props,
        },
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                ModelSelect: {template: '<div class="stub-model-select"><slot name="append"/></div>'},
            },
        },
    })
}

describe('HierarchyControls', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('renders section labels for hierarchy actions', () => {
        const wrapper = mountControls({selectedItem: makeItem(5, 'Garlic')})
        const text = wrapper.text()
        expect(text).toContain('Parent')
        expect(text).toContain('Add child')
        expect(text).toContain('Merge')
    })

    it('shows confirmation dialog when Remove Parent is clicked', async () => {
        const wrapper = mountControls()
        const removeBtn = wrapper.find('[data-testid="remove-parent-btn"]')
        expect(removeBtn.exists()).toBe(true)
        await removeBtn.trigger('click')
        // Should open confirmation dialog, not emit directly
        expect(wrapper.emitted('removeParent')).toBeFalsy()
    })

    it('hides Edit button when selected == editing item', () => {
        const item = makeItem(1, 'Produce')
        const wrapper = mountControls({selectedItem: item, editingItem: item})
        // When selected==editing, the v-if hides the Edit button entirely
        const allText = wrapper.text()
        const editLinks = wrapper.findAll('a').filter(a => a.attributes('href')?.includes('/edit/'))
        expect(editLinks).toHaveLength(0)
    })

    it('shows Edit button when selected != editing item', () => {
        const wrapper = mountControls({
            selectedItem: makeItem(5, 'Garlic'),
            editingItem: makeItem(1, 'Produce'),
        })
        // The Edit button should be rendered as a router-link
        const text = wrapper.text()
        expect(text).toContain('Edit')
    })

    it('renders navigation buttons', () => {
        const wrapper = mountControls({
            selectedItem: makeItem(5, 'Garlic'),
            editingItem: makeItem(1, 'Produce'),
        })
        expect(wrapper.text()).toContain('Edit')
        expect(wrapper.text()).toContain('Recipes')
    })
})
