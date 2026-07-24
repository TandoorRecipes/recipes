import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createRouter, createMemoryHistory} from 'vue-router'

import ModelEditorBase from '@/components/model_editors/ModelEditorBase.vue'

function mountBase(overrides: Partial<any> = {}) {
    const modelClass = {
        model: {
            name: 'Recipe',
            icon: 'fa-solid fa-book',
            localizationKey: 'Recipe',
            disableCreate: false,
            disableDelete: false,
            disableUpdate: false,
            isAdvancedDelete: true,
        },
    }
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Save: 'Save', Delete: 'Delete', Create: 'Create', Recipe: 'Recipe', unsaved: 'unsaved', WarnPageLeave: 'unsaved', Confirm: 'Confirm', Cancel: 'Cancel'}},
        missingWarn: false, fallbackWarn: false,
    })
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
            plugins: [i18n, router],
            stubs: {
                'delete-confirm-dialog': {template: '<div class="stub-delete-dialog"/>'},
                'v-closable-card-title': {template: '<div class="stub-title"/>'},
            },
        },
    })
}

describe('ModelEditorBase recipe edit', () => {
    it('renders the action bar for a Recipe model', () => {
        const w = mountBase()
        expect(w.html().includes('v-card-actions'), 'action bar must render for recipes').toBe(true)
        const saveBtn = w.findAll('.v-btn').find(b => b.text().includes('Save'))
        expect(saveBtn, 'Save button must be present for recipes').toBeDefined()
    })
})
