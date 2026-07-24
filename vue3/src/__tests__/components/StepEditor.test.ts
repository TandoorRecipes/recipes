/**
 * Regression test for: empty headline ingredients (isHeader=true, food/note/amount all empty)
 * were silently wiped when parseAndInsertIngredients ran its pre-paste filter.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeIngredient, makeStep, makeRecipe, makeUserPreference, makeSpace, makeFood, makeUnit} from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/openapi')>()
    return {
        ...actual,
        ApiApi: class {constructor() { return apiMock }},
        ResponseError: class extends Error {
            response: any
            constructor(r: any) { super(); this.response = r }
        },
    }
})

vi.mock('@vueuse/core', async () => {
    const {ref} = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useWakeLock: () => ({request: vi.fn(), release: vi.fn()}),
    }
})

import StepEditor from '@/components/inputs/StepEditor.vue'

describe('StepEditor', () => {
    beforeEach(() => {
        resetApiMock()
    })

    function mountEditor(step = makeStep(), recipe = makeRecipe()) {
        const prePopulate: PiniaPlugin = ({store}) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
                store.activeSpace = makeSpace() as any
            }
        }
        const pinia = createPinia()
        pinia.use(prePopulate)

        const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
        const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})

        return mount(StepEditor, {
            props: {modelValue: step, recipe, stepIndex: 0},
            attachTo: document.body,
            global: {
                plugins: [pinia, i18n, vuetify],
                stubs: {
                    StepMarkdownEditor: {template: '<div />'},
                    ModelSelect: {template: '<div />'},
                    VueDraggable: {template: '<div><slot /></div>'},
                    VClosableCardTitle: {template: '<div><slot /></div>'},
                    IngredientString: {template: '<span />'},
                    StepIngredientSorterDialog: {template: '<div />'},
                },
            },
        })
    }

    it('preserves empty headline ingredients when pasting parsed ingredients', async () => {
        const emptyHeadline = makeIngredient({
            id: 10,
            isHeader: true,
            food: null as any,
            note: null as any,
            amount: 0,
            unit: null as any,
        })
        const step = makeStep({ingredients: [emptyHeadline]})

        const parsedIngredient = makeIngredient({id: 99, food: makeFood({id: 5, name: 'flour'}), amount: 2, unit: makeUnit()})
        ;(apiMock as any).apiIngredientParserPostCreate = vi.fn().mockResolvedValue({
            ingredients: [parsedIngredient],
        })

        const w = mountEditor(step)
        await flushPromises()

        // Open the ingredient parser dialog
        const iconBtns = w.findAll('button')
        const clipboardBtn = iconBtns.find(b => {
            const html = b.element.outerHTML
            return html.includes('clipboard-list')
        })
        expect(clipboardBtn).toBeTruthy()
        await clipboardBtn!.trigger('click')
        await flushPromises()

        // Fill in the textarea and click Add (dialog teleports to body)
        const textarea = document.body.querySelector('textarea')
        expect(textarea).toBeTruthy()
        if (textarea) {
            Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set?.call(textarea, '2 cups flour')
            textarea.dispatchEvent(new Event('input'))
        }
        await flushPromises()

        const addBtn = [...document.body.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Add')
        expect(addBtn).toBeTruthy()
        addBtn!.click()
        await flushPromises()

        expect((apiMock as any).apiIngredientParserPostCreate).toHaveBeenCalled()
        // Empty headline (isHeader=true, no food/note/amount) must survive the paste filter
        expect(step.ingredients.some(i => i.isHeader && !i.food && !i.note && i.amount === 0)).toBe(true)
        // Parsed ingredient must also be present
        expect(step.ingredients.some(i => i.id === 99)).toBe(true)

        w.unmount()
    })
})
