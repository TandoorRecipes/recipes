import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {VRating} from 'vuetify/components'
import FilterField from '@/components/filters/FilterField.vue'
import type {FilterDef} from '@/composables/modellist/types'

function mountField(def: FilterDef, filterValues: Record<string, string> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})

    const setFilter = vi.fn()
    const clearFilter = vi.fn()

    const wrapper = mount(FilterField, {
        props: {
            def,
            getFilter: (key: string) => filterValues[key],
            setFilter,
            clearFilter,
        },
        global: {plugins: [vuetify, i18n]},
    })
    return {wrapper, setFilter, clearFilter}
}

const RATING_DEF: FilterDef = {
    key: 'ratingGte',
    labelKey: 'RatingGte',
    type: 'rating-unrated',
    unratedKey: 'unrated',
    group: 'Rating',
}

describe('FilterField — rating-unrated (unified rating + unrated control)', () => {
    it('renders an unrated (0) toggle plus a star rating', () => {
        const {wrapper} = mountField(RATING_DEF)
        expect(wrapper.find('.unrated-toggle').exists()).toBe(true)
        expect(wrapper.findComponent(VRating).exists()).toBe(true)
    })

    it('clicking the 0/unrated toggle sets unrated and clears the rating', async () => {
        const {wrapper, setFilter, clearFilter} = mountField(RATING_DEF)
        await wrapper.find('.unrated-toggle').trigger('click')
        expect(setFilter).toHaveBeenCalledWith('unrated', '1')
        expect(clearFilter).toHaveBeenCalledWith('ratingGte')
    })

    it('selecting a star sets ratingGte and clears unrated', async () => {
        const {wrapper, setFilter, clearFilter} = mountField(RATING_DEF)
        wrapper.findComponent(VRating).vm.$emit('update:modelValue', 3)
        await wrapper.vm.$nextTick()
        expect(setFilter).toHaveBeenCalledWith('ratingGte', '3')
        expect(clearFilter).toHaveBeenCalledWith('unrated')
    })

    it('when unrated is active the star value reads 0 and the toggle is highlighted', () => {
        const {wrapper} = mountField(RATING_DEF, {unrated: '1'})
        expect(wrapper.findComponent(VRating).props('modelValue')).toBe(0)
        // active toggle carries the warning color class
        expect(wrapper.find('.unrated-toggle').classes().join(' ')).toContain('warning')
    })

    it('clicking the 0/unrated toggle while already unrated clears unrated (toggles off)', async () => {
        const {wrapper, setFilter, clearFilter} = mountField(RATING_DEF, {unrated: '1'})
        await wrapper.find('.unrated-toggle').trigger('click')
        expect(clearFilter).toHaveBeenCalledWith('unrated')
        expect(setFilter).not.toHaveBeenCalledWith('unrated', '1')
    })

    it('clear button resets both rating and unrated', async () => {
        const {wrapper, clearFilter} = mountField(RATING_DEF, {ratingGte: '4'})
        await wrapper.find('.rating-clear').trigger('click')
        expect(clearFilter).toHaveBeenCalledWith('ratingGte')
        expect(clearFilter).toHaveBeenCalledWith('unrated')
    })
})
