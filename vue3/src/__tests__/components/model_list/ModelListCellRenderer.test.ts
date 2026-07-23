import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createRouter, createMemoryHistory, RouterLink} from 'vue-router'

import ModelListCellRenderer from '@/components/model_list/ModelListCellRenderer.vue'

function mountCell(header: any, item: Record<string, any>) {
    const i18n = createI18n({
        legacy: false,
        locale: 'en',
        messages: {en: {Recipes: 'Recipes', Children: 'Children'}},
    })
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', name: 'StartPage', component: {template: '<div />'}},
            {path: '/search', name: 'SearchPage', component: {template: '<div />'}},
        ],
    })
    return mount(ModelListCellRenderer, {
        props: {item, header, displayMode: 'text', showHeaders: true},
        global: {plugins: [i18n, router], components: {RouterLink}},
    })
}

describe('ModelListCellRenderer — number column with filterLink', () => {
    const filterLinkHeader = {
        title: 'Recipes',
        key: 'numrecipe',
        type: 'number',
        align: 'end',
        emphasizeNonZero: true,
        filterLink: {route: 'SearchPage', param: 'foods'},
    }

    it('renders a router-link when value > 0 and filterLink is set', () => {
        const wrapper = mountCell(filterLinkHeader, {id: 42, numrecipe: 5})
        const link = wrapper.findComponent(RouterLink)
        expect(link.exists()).toBe(true)
        expect(link.props('to')).toEqual({name: 'SearchPage', query: {foods: 42}})
        expect(wrapper.text()).toContain('5')
    })

    it('renders plain (non-link) text when value is 0 even with filterLink set', () => {
        // Zero stat → no link (no recipes to filter to)
        const wrapper = mountCell(filterLinkHeader, {id: 42, numrecipe: 0})
        expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
        expect(wrapper.text()).toContain('0')
    })

    it('renders plain text when value > 0 but filterLink is NOT set', () => {
        const plainHeader = {
            title: 'Recipes',
            key: 'numrecipe',
            type: 'number',
            align: 'end',
        }
        const wrapper = mountCell(plainHeader, {id: 42, numrecipe: 5})
        expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
        expect(wrapper.text()).toContain('5')
    })

    it('renders nothing visible when value is null', () => {
        const wrapper = mountCell(filterLinkHeader, {id: 42, numrecipe: null})
        expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
        expect(wrapper.text().trim()).toBe('')
    })
})
