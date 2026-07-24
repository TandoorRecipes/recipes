/**
 * Unit coverage for SourceImagePicker — the multi-select thumbnail grid shared
 * by the import wizard (Cover/#n ordering badges) and the recipe image editor
 * (plain check badges). Selection is an ordered v-model array of image URLs.
 */
import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import SourceImagePicker from '@/components/inputs/SourceImagePicker.vue'

function mountPicker(props: any = {}) {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {Cover: 'Cover'}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(SourceImagePicker, {
        props: {images: ['a.jpg', 'b.jpg', 'c.jpg'], modelValue: [], ...props},
        global: {plugins: [i18n, vuetify]},
    })
}

describe('SourceImagePicker', () => {
    it('renders one selectable card per image', () => {
        const w = mountPicker()
        expect(w.findAll('.v-card').length).toBe(3)
    })

    it('clicking an unselected image adds it to the selection', async () => {
        const w = mountPicker({modelValue: []})
        await w.findAll('.v-card')[1].trigger('click')
        const emitted = w.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toEqual(['b.jpg'])
    })

    it('clicking a selected image removes it from the selection', async () => {
        const w = mountPicker({modelValue: ['b.jpg']})
        await w.findAll('.v-card')[1].trigger('click')
        const emitted = w.emitted('update:modelValue')
        expect(emitted![0][0]).toEqual([])
    })

    it('appends new selections to the end, preserving order', async () => {
        const w = mountPicker({modelValue: ['c.jpg']})
        await w.findAll('.v-card')[0].trigger('click') // add a.jpg
        const emitted = w.emitted('update:modelValue')
        expect(emitted![0][0]).toEqual(['c.jpg', 'a.jpg'])
    })

    it('with showCoverBadge, first selected shows "Cover" and the next shows its position', () => {
        const w = mountPicker({modelValue: ['a.jpg', 'b.jpg'], showCoverBadge: true})
        const chips = w.findAll('.v-chip')
        expect(chips.length).toBe(2)
        expect(chips[0].text()).toContain('Cover')
        expect(chips[1].text()).toContain('2')
    })

    it('without showCoverBadge, selected images show a check icon, not a number or Cover', () => {
        const w = mountPicker({modelValue: ['a.jpg'], showCoverBadge: false})
        const chips = w.findAll('.v-chip')
        expect(chips.length).toBe(1)
        expect(chips[0].text()).not.toContain('Cover')
        expect(chips[0].find('.v-icon').exists()).toBe(true)
    })
})
