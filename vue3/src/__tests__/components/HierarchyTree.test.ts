import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import {createI18n} from 'vue-i18n'
import HierarchyTree from '@/components/hierarchy/HierarchyTree.vue'
import type {FlatTreeNode} from '@/composables/hierarchy/types'

function makeNode(id: number, name: string, depth: number, hasChildren = false, parent: number | null = null): FlatTreeNode {
    return {id, name, depth, hasChildren, parent, numchild: hasChildren ? 1 : 0, data: {id, name, parent} as any}
}

function mountTree(props: Partial<InstanceType<typeof HierarchyTree>['$props']> = {}) {
    const vuetify = createVuetify()
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})

    return mount(HierarchyTree, {
        props: {
            flatTree: [],
            selectedId: null,
            editingId: 1,
            expandedIds: new Set<number>(),
            loadingIds: new Set<number | string>(),
            ...props,
        },
        global: {plugins: [vuetify, i18n]},
    })
}

describe('HierarchyTree', () => {
    it('renders tree rows for each node', () => {
        const wrapper = mountTree({
            flatTree: [makeNode(1, 'Root', 0, true), makeNode(10, 'Child', 1)],
        })
        const rows = wrapper.findAll('.tree-row')
        expect(rows).toHaveLength(2)
    })

    it('applies editing class to the editing item', () => {
        const wrapper = mountTree({
            editingId: 1,
            flatTree: [makeNode(1, 'EditMe', 0), makeNode(2, 'Other', 0)],
        })
        const rows = wrapper.findAll('.tree-row')
        expect(rows[0].classes()).toContain('tree-row--editing')
        expect(rows[1].classes()).not.toContain('tree-row--editing')
    })

    it('applies selected class to the selected item', () => {
        const wrapper = mountTree({
            selectedId: 2,
            flatTree: [makeNode(1, 'A', 0), makeNode(2, 'B', 0)],
        })
        const rows = wrapper.findAll('.tree-row')
        expect(rows[0].classes()).not.toContain('tree-row--selected')
        expect(rows[1].classes()).toContain('tree-row--selected')
    })

    it('emits select when a row is clicked', async () => {
        const node = makeNode(5, 'Garlic', 0)
        const wrapper = mountTree({flatTree: [node]})

        await wrapper.find('.tree-row').trigger('click')
        expect(wrapper.emitted('select')).toBeTruthy()
        expect(wrapper.emitted('select')![0][0]).toEqual(node)
    })

    it('emits toggleExpand when chevron is clicked', async () => {
        const node = makeNode(5, 'Parent', 0, true)
        const wrapper = mountTree({flatTree: [node]})

        await wrapper.find('.tree-chevron').trigger('click')
        expect(wrapper.emitted('toggleExpand')).toBeTruthy()
        expect(wrapper.emitted('toggleExpand')![0][0]).toBe(5)
    })

    it('renders indentation spacers based on depth', () => {
        const wrapper = mountTree({
            flatTree: [makeNode(1, 'Root', 0), makeNode(10, 'Deep', 3)],
        })
        const rows = wrapper.findAll('.tree-row')
        expect(rows[0].findAll('.tree-indent')).toHaveLength(0)
        expect(rows[1].findAll('.tree-indent')).toHaveLength(3)
    })

    it('shows hint when tree is loaded but nothing selected', () => {
        const wrapper = mountTree({
            flatTree: [makeNode(1, 'A', 0)],
            selectedId: null,
        })
        expect(wrapper.find('.tree-hint').exists()).toBe(true)
    })

    it('hides hint when an item is selected', () => {
        const wrapper = mountTree({
            flatTree: [makeNode(1, 'A', 0)],
            selectedId: 1,
        })
        expect(wrapper.find('.tree-hint').exists()).toBe(false)
    })
})
