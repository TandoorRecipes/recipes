import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import ModelListStatsFooter from '@/components/model_list/ModelListStatsFooter.vue'
import type {StatDef} from '@/composables/modellist/types'

function mountFooter(statDefs: StatDef[], stats: Record<string, number>) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {Showing: 'Showing'}}, missingWarn: false, fallbackWarn: false})
    return mount(ModelListStatsFooter, {
        props: {pageCount: 3, itemCount: 42, stats, statDefs},
        global: {plugins: [vuetify, i18n]},
    })
}

describe('ModelListStatsFooter', () => {
    it('renders stat chips with counts from the stats object', () => {
        const defs: StatDef[] = [
            {key: 'fooBar', labelKey: 'FooBar', icon: 'fa-solid fa-x', color: 'info'},
        ]
        const w = mountFooter(defs, {total: 10, fooBar: 7})
        expect(w.text()).toContain('FooBar: 7')
    })

    it('chips without a filter are not clickable and do not emit on click', async () => {
        const defs: StatDef[] = [
            {key: 'fooBar', labelKey: 'FooBar', icon: 'fa-solid fa-x', color: 'info'},
        ]
        const w = mountFooter(defs, {total: 10, fooBar: 7})
        // The "Showing X / Y" chip is first; skip it, target the stat chip
        const chips = w.findAll('.v-chip--label')
        expect(chips.length).toBe(1)
        await chips[0]!.trigger('click')
        expect(w.emitted('apply-filter')).toBeUndefined()
    })

    it('chips with a filter emit apply-filter with the resolved filter object', async () => {
        const defs: StatDef[] = [
            {
                key: 'neverCooked',
                labelKey: 'NeverCooked',
                icon: 'fa-regular fa-clock',
                color: 'warning',
                filter: () => ({timescookedLte: '0'}),
            },
        ]
        const w = mountFooter(defs, {total: 10, neverCooked: 3})
        // Find the clickable stat chip (the "Showing X / Y" chip has no label prop)
        const chip = w.find('.v-chip[role="button"]')
        expect(chip.exists()).toBe(true)
        await chip.trigger('click')
        const emitted = w.emitted('apply-filter')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([{timescookedLte: '0'}])
    })
})
