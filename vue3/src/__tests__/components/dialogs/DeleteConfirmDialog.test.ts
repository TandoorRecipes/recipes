import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog.vue'

function mountDialog() {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    return mount(DeleteConfirmDialog, {
        props: {objectName: 'My Token', modelName: 'AccessToken'},
        global: {plugins: [vuetify, i18n]},
    })
}

describe('DeleteConfirmDialog', () => {
    it('uses parent-click as the dialog activator so nested-in-button usage opens it', () => {
        // Every call site across the app (ModelEditorBase, RecipeEditor,
        // ShoppingListView, ModelDeletePage) nests DeleteConfirmDialog inside a
        // v-btn without passing v-model, relying on v-dialog's parent activator.
        // If activator="parent" is removed the button becomes a no-op.
        const wrapper = mountDialog()
        const dialog = wrapper.findComponent(components.VDialog)
        expect(dialog.exists()).toBe(true)
        expect(dialog.props('activator')).toBe('parent')
    })
})
