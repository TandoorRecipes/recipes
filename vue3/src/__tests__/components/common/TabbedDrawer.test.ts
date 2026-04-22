import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {h, nextTick, ref} from 'vue'

const mobileRef = ref(false)
vi.mock('vuetify', async (importOriginal) => {
    const orig = await importOriginal<any>()
    return {...orig, useDisplay: () => ({mobile: mobileRef})}
})

import TabbedDrawer from '@/components/common/TabbedDrawer.vue'

const NavDrawerStub = {
    name: 'VNavigationDrawer',
    props: {
        modelValue: Boolean,
        permanent: Boolean,
        temporary: Boolean,
        disableResizeWatcher: Boolean,
        location: String,
        width: [String, Number],
    },
    emits: ['update:modelValue'],
    render() { return h('div', {class: 'nav-drawer-stub'}, [(this as any).$slots.default?.()]) },
}

const BottomSheetStub = {
    name: 'VBottomSheet',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    render() { return h('div', {class: 'bottom-sheet-stub'}, [(this as any).$slots.default?.()]) },
}

function mountDrawer(props: Record<string, any> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})

    return mount(TabbedDrawer, {
        props: {
            modelValue: true,
            pinned: true,
            tabs: [{key: 'filters', label: 'Filters', icon: 'fa-solid fa-filter'}],
            ...props,
        },
        global: {
            plugins: [vuetify, i18n],
            stubs: {
                VNavigationDrawer: NavDrawerStub,
                VBottomSheet: BottomSheetStub,
                VToolbar: {template: '<div><slot /></div>'},
                VBtn: {inheritAttrs: false, template: '<button v-bind="$attrs"><slot /></button>'},
                VIcon: {template: '<i><slot /></i>'},
                VTooltip: {template: '<div><slot /></div>'},
                VTabs: {template: '<div><slot /></div>'},
                VTab: {template: '<div><slot /></div>'},
                VTabsWindow: {template: '<div><slot /></div>'},
                VTabsWindowItem: {template: '<div><slot /></div>'},
                VDivider: {template: '<hr />'},
                VSpacer: {template: '<div />'},
                VCard: {template: '<div><slot /></div>'},
                VCardTitle: {template: '<div><slot /></div>'},
                VCardText: {template: '<div><slot /></div>'},
                VCardActions: {template: '<div><slot /></div>'},
            },
        },
    })
}

describe('TabbedDrawer', () => {
    describe('unpin keeps drawer open', () => {
        it('passes disable-resize-watcher so Vuetify does not auto-close on unpin', () => {
            // Vuetify's v-navigation-drawer has an internal watcher that sets
            // isActive=false when `isTemporary` flips true (which happens the
            // moment permanent goes false). Disabling that watcher is the only
            // reliable way to keep the drawer open when the user clicks unpin.
            const wrapper = mountDrawer()
            const stub = wrapper.findComponent({name: 'VNavigationDrawer'})
            expect(stub.exists()).toBe(true)
            expect(stub.props('disableResizeWatcher')).toBe(true)
        })

        it('clicking pin toggle emits update:pinned but does NOT emit update:modelValue false', async () => {
            const wrapper = mountDrawer({pinned: true, modelValue: true})
            const pinBtn = wrapper.find('[aria-label="Unpin"]')
            expect(pinBtn.exists()).toBe(true)
            await pinBtn.trigger('click')
            await nextTick()

            const pinEvents = wrapper.emitted('update:pinned') ?? []
            expect(pinEvents).toEqual([[false]])

            const closeEvents = (wrapper.emitted('update:modelValue') ?? []).filter(e => e[0] === false)
            expect(closeEvents).toEqual([])
        })
    })

    describe('close button', () => {
        // When the user clicks the × button on a pinned drawer, they mean "dismiss".
        // Without this behavior the pin state persists to localStorage, but on next
        // page load the drawer starts closed, so the user sees a pinned=true state
        // with a closed drawer and can no longer reach the pin toggle to unpin.
        it('clicking close on a pinned drawer also unpins it', async () => {
            const wrapper = mountDrawer({pinned: true, modelValue: true})
            const closeBtn = wrapper.find('[aria-label="Close"]')
            expect(closeBtn.exists()).toBe(true)
            await closeBtn.trigger('click')
            await nextTick()

            const modelEvents = wrapper.emitted('update:modelValue') ?? []
            expect(modelEvents.some(e => e[0] === false)).toBe(true)

            const pinEvents = wrapper.emitted('update:pinned') ?? []
            expect(pinEvents.some(e => e[0] === false)).toBe(true)
        })
    })
})
