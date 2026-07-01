import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import {createI18n} from 'vue-i18n'
import HierarchyDrillDown from '@/components/hierarchy/HierarchyDrillDown.vue'
import type {FlatTreeNode, BreadcrumbItem} from '@/composables/hierarchy/types'

function makeNode(id: number, name: string, hasChildren = false): FlatTreeNode {
    return {id, name, depth: 0, hasChildren, parent: null, numchild: hasChildren ? 1 : 0, data: {id, name} as any}
}

function mountDrillDown(props: Partial<InstanceType<typeof HierarchyDrillDown>['$props']> = {}) {
    const vuetify = createVuetify()
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {
        All: 'All', Back: 'Back', Loading: 'Loading', load_more: 'Load more', no_items: 'No items',
    }}, missingWarn: false, fallbackWarn: false})

    return mount(HierarchyDrillDown, {
        props: {
            items: [],
            parent: null,
            breadcrumbs: [],
            editingId: 1,
            selectedId: null,
            loading: false,
            hasMore: false,
            ...props,
        },
        global: {plugins: [vuetify, i18n]},
    })
}

describe('HierarchyDrillDown', () => {
    it('renders list of items', () => {
        const wrapper = mountDrillDown({
            items: [makeNode(1, 'Apple'), makeNode(2, 'Banana')],
        })
        expect(wrapper.findAll('.drill-item')).toHaveLength(2)
        expect(wrapper.text()).toContain('Apple')
        expect(wrapper.text()).toContain('Banana')
    })

    it('shows back button when parent is not null', () => {
        const wrapper = mountDrillDown({
            parent: {id: 5, name: 'Fruits'} as any,
            items: [makeNode(1, 'Apple')],
        })
        expect(wrapper.find('.drill-title--tappable').exists()).toBe(true)
        expect(wrapper.text()).toContain('Fruits')
    })

    it('hides back button at root level', () => {
        const wrapper = mountDrillDown({parent: null})
        expect(wrapper.text()).toContain('All')
        expect(wrapper.find('.drill-title--tappable').exists()).toBe(false)
    })

    it('emits drillInto when parent item tapped', async () => {
        const parentItem = makeNode(5, 'Fruits', true)
        const wrapper = mountDrillDown({items: [parentItem]})
        await wrapper.find('.drill-item').trigger('click')
        expect(wrapper.emitted('drillInto')).toBeTruthy()
        expect(wrapper.emitted('drillInto')![0][0]).toBe(5)
    })

    it('emits select when leaf item tapped', async () => {
        const leaf = makeNode(10, 'Apple', false)
        const wrapper = mountDrillDown({items: [leaf]})
        await wrapper.find('.drill-item').trigger('click')
        expect(wrapper.emitted('select')).toBeTruthy()
        expect(wrapper.emitted('select')![0][0]).toEqual(leaf)
    })

    it('emits selectParent when header name tapped', async () => {
        const parent = {id: 5, name: 'Fruits'} as any
        const wrapper = mountDrillDown({parent, items: [makeNode(1, 'Apple')]})
        await wrapper.find('.drill-title--tappable').trigger('click')
        expect(wrapper.emitted('selectParent')).toBeTruthy()
        expect(wrapper.emitted('selectParent')![0][0]).toEqual(parent)
    })

    it('emits drillBack when back button tapped', async () => {
        const wrapper = mountDrillDown({
            parent: {id: 5, name: 'Fruits'} as any,
            items: [makeNode(1, 'Apple')],
        })
        const backBtn = wrapper.find('[data-testid="drill-back-btn"]')
        expect(backBtn.exists()).toBe(true)
        await backBtn.trigger('click')
        expect(wrapper.emitted('drillBack')).toBeTruthy()
    })

    it('shows editing highlight on editing item', () => {
        const wrapper = mountDrillDown({
            editingId: 1,
            items: [makeNode(1, 'EditMe'), makeNode(2, 'Other')],
        })
        const items = wrapper.findAll('.drill-item')
        expect(items[0].classes()).toContain('drill-item--editing')
        expect(items[1].classes()).not.toContain('drill-item--editing')
    })

    it('shows breadcrumbs when provided', () => {
        const crumbs: BreadcrumbItem[] = [{id: 1, name: 'Root'}, {id: 5, name: 'Fruits'}]
        const wrapper = mountDrillDown({breadcrumbs: crumbs})
        expect(wrapper.find('.drill-breadcrumbs').exists()).toBe(true)
        expect(wrapper.text()).toContain('Root')
        expect(wrapper.text()).toContain('Fruits')
    })

    it('shows Load more when hasMore is true', () => {
        const wrapper = mountDrillDown({
            items: [makeNode(1, 'Apple')],
            hasMore: true,
        })
        expect(wrapper.find('.drill-load-more').exists()).toBe(true)
    })

    it('emits loadMore when Load more tapped', async () => {
        const wrapper = mountDrillDown({
            items: [makeNode(1, 'Apple')],
            hasMore: true,
        })
        await wrapper.find('.drill-load-more').trigger('click')
        expect(wrapper.emitted('loadMore')).toBeTruthy()
    })

    it('shows loading state when loading with empty items', () => {
        const wrapper = mountDrillDown({loading: true, items: []})
        expect(wrapper.find('.drill-loading').exists()).toBe(true)
    })

    it('shows empty state when not loading with empty items', () => {
        const wrapper = mountDrillDown({loading: false, items: []})
        expect(wrapper.find('.drill-empty').exists()).toBe(true)
        expect(wrapper.text()).toContain('No items')
    })

    it('shows chevron on parent items but not leaves', () => {
        const wrapper = mountDrillDown({
            items: [makeNode(1, 'Parent', true), makeNode(2, 'Leaf', false)],
        })
        const items = wrapper.findAll('.drill-item')
        expect(items[0].find('.drill-item-chevron').exists()).toBe(true)
        expect(items[1].find('.drill-item-chevron').exists()).toBe(false)
    })
})
