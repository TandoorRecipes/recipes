import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('vuetify', async () => {
    const actual = await vi.importActual<typeof import('vuetify')>('vuetify')
    return {
        ...actual,
        useDisplay: () => ({ mobile: { value: true } }),
    }
})

vi.mock('@/openapi', () => ({
    ApiApi: class {},
}))

import ModelEditorBase from '@/components/model_editors/ModelEditorBase.vue'
import { TRecipe, GenericModel } from '@/types/Models'

function mountEditor() {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const pinia = createPinia()
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', name: 'Home', component: { template: '<div/>' } }],
    })
    const modelClass = new GenericModel(TRecipe as any, i18n.global.t)

    return mount(ModelEditorBase, {
        props: {
            modelClass,
            editingObject: { id: 1 } as any,
            isUpdate: true,
            objectName: 'Test Recipe',
        },
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                VClosableCardTitle: { template: '<div class="stub-title"/>' },
                DeleteConfirmDialog: { template: '<div class="stub-delete-dialog"/>' },
            },
        },
    })
}

describe('ModelEditorBase', () => {
    it('renders action buttons on mobile for recipe edit', async () => {
        const wrapper = mountEditor()
        const html = wrapper.html()
        // On mobile for a recipe, the action bar must render (upstream hid it
        // with a v-if hoping a v-fab in ModelEditPage would replace it, but
        // that v-fab's binding was never wired up).
        expect(html.includes('v-card-actions'), `expected v-card-actions in HTML:\n${html.slice(0, 500)}`).toBe(true)
    })
})
