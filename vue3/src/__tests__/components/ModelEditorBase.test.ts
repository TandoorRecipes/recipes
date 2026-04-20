/**
 * Regression coverage for ModelEditorBase.
 *
 * E-11: the desktop action bar must render a "Save and Close" button that
 * emits `save-and-close` so the containing ModelEditPage can navigate away
 * after save.
 *
 * Mobile recipe edit: upstream briefly hid the action bar on mobile for
 * recipes expecting a v-fab in ModelEditPage to replace it, but that
 * v-fab's state binding (modelEditorFunctions) was never wired up,
 * leaving mobile users with no Save / Delete / SaveAndClose buttons.
 * The Recipe-model test below locks the fix in.
 */
import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

import ModelEditorBase from '@/components/model_editors/ModelEditorBase.vue'

function mountBase(overrides: Partial<any> = {}) {
    const modelClass = {
        model: {
            name: 'Food',
            icon: 'fa-solid fa-carrot',
            localizationKey: 'Food',
            disableCreate: false,
            disableDelete: false,
            disableUpdate: false,
            isAdvancedDelete: false,
        },
    }
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Save: 'Save', SaveAndClose: 'Save and Close', Delete: 'Delete', Create: 'Create', Food: 'Food', Recipe: 'Recipe', unsaved: 'unsaved', WarnPageLeave: 'unsaved', Confirm: 'Confirm', Cancel: 'Cancel'}},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [
        {path: '/', component: {template: '<div/>'}},
        {path: '/edit/:model/:id?', name: 'ModelDeletePage', component: {template: '<div/>'}},
    ]})
    return mount(ModelEditorBase, {
        props: {
            loading: false,
            dialog: false,
            objectName: 'Butter',
            modelClass: modelClass as any,
            editingObject: {id: 1, name: 'Butter'} as any,
            isUpdate: true,
            isChanged: false,
            ...overrides,
        },
        global: {
            plugins: [i18n, vuetify, router],
            stubs: {
                'delete-confirm-dialog': {template: '<div class="stub-delete-dialog"/>'},
                'v-closable-card-title': {template: '<div class="stub-title"/>'},
            },
        },
    })
}

describe('ModelEditorBase action bar (E-11)', () => {
    it('renders a Save and Close button on update', () => {
        const w = mountBase()
        const btns = w.findAll('.v-btn').filter(b => b.text().includes('Save and Close'))
        expect(btns).toHaveLength(1)
    })

    it('emits save-and-close when the Save and Close button is clicked', async () => {
        const w = mountBase()
        const btn = w.findAll('.v-btn').find(b => b.text().includes('Save and Close'))
        expect(btn).toBeDefined()
        await btn!.trigger('click')
        expect(w.emitted('saveAndClose')).toBeTruthy()
    })

    it('hides Save and Close when the model disables update', () => {
        const w = mountBase({modelClass: {model: {name: 'ViewLog', icon: '', localizationKey: 'ViewLog', disableCreate: false, disableDelete: false, disableUpdate: true, isAdvancedDelete: false}}})
        const btns = w.findAll('.v-btn').filter(b => b.text().includes('Save and Close'))
        expect(btns).toHaveLength(0)
    })
})

describe('ModelEditorBase recipe edit', () => {
    it('renders the action bar for a Recipe model (lock in the mobile-fab-bypass fix)', () => {
        const recipeModel = {model: {name: 'Recipe', icon: 'fa-solid fa-book', localizationKey: 'Recipe', disableCreate: false, disableDelete: false, disableUpdate: false, isAdvancedDelete: true}}
        const w = mountBase({modelClass: recipeModel as any})
        expect(w.html().includes('v-card-actions'), 'action bar must render for recipes').toBe(true)
        const saveBtn = w.findAll('.v-btn').find(b => b.text().includes('Save and Close'))
        expect(saveBtn, 'Save and Close button must be present for recipes').toBeDefined()
    })
})
