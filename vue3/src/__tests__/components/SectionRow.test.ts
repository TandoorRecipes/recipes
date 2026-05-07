import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import SectionRow from '@/components/settings/SectionRow.vue'
import type { LocalSection } from '@/composables/useStartPageSections'

function makeSection(overrides: Partial<LocalSection> = {}): LocalSection {
    return {
        mode: 'recent',
        enabled: true,
        min_recipes: 10,
        _key: 'section-test-1',
        _filterObj: null,
        ...overrides,
    }
}

function mountRow(section: LocalSection) {
    const pinia = createPinia()
    setActivePinia(pinia)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify()

    return mount(SectionRow, {
        props: {
            section,
            label: 'Test Label',
            description: 'Test description',
            availableUsers: [{ value: 1, label: 'Alice' }, { value: 2, label: 'Bob' }],
            ratingOptions: [
                { value: 1, label: '≥ 1' },
                { value: 4, label: '≥ 4' },
            ],
        },
        global: {
            plugins: [pinia, i18n, vuetify],
            stubs: {
                ModelSelect: { name: 'ModelSelect', template: '<div class="stub-model-select"/>', props: ['model', 'modelValue'], emits: ['update:modelValue'] },
            },
        },
    })
}

describe('SectionRow', () => {
    beforeEach(() => {
        resetApiMock()
    })

    it('renders the label and description', () => {
        const w = mountRow(makeSection())
        expect(w.text()).toContain('Test Label')
        expect(w.text()).toContain('Test description')
    })

    it('renders a drag handle', () => {
        const w = mountRow(makeSection())
        expect(w.findAll('.drag-handle')).toHaveLength(1)
    })

    it('renders ModelSelect for mode=keyword', () => {
        const w = mountRow(makeSection({ mode: 'keyword' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(1)
    })

    it('renders ModelSelect for mode=books', () => {
        const w = mountRow(makeSection({ mode: 'books' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(1)
    })

    it('renders ModelSelect for mode=food', () => {
        const w = mountRow(makeSection({ mode: 'food' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(1)
    })

    it('renders ModelSelect for mode=saved_search', () => {
        const w = mountRow(makeSection({ mode: 'saved_search' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(1)
    })

    it('renders v-select (not ModelSelect) for mode=created_by', () => {
        const w = mountRow(makeSection({ mode: 'created_by' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(0)
        expect(w.findAll('.v-select').length).toBeGreaterThan(0)
    })

    it('renders v-select (not ModelSelect) for mode=rating', () => {
        const w = mountRow(makeSection({ mode: 'rating' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(0)
        expect(w.findAll('.v-select').length).toBeGreaterThan(0)
    })

    it('renders neither selector for mode=recent', () => {
        const w = mountRow(makeSection({ mode: 'recent' }))
        expect(w.findAll('.stub-model-select')).toHaveLength(0)
        expect(w.findAll('.v-select')).toHaveLength(0)
    })

    it('emits delete with section._key when delete button clicked', async () => {
        const section = makeSection({ _key: 'unique-key-99' })
        const w = mountRow(section)
        const deleteBtn = w.find('button[aria-label="$vuetify.Delete"], button[aria-label="Delete"]')
        // Vuetify renders v-btn as a button; locate via the trash icon's parent
        const btn = w.find('.v-btn')
        await btn.trigger('click')

        expect(w.emitted('delete')).toBeTruthy()
        expect(w.emitted('delete')![0]).toEqual(['unique-key-99'])
    })

    it('@update:model-value on ModelSelect syncs filter_id (regression: stale filter_id clear)', async () => {
        const section = makeSection({ mode: 'keyword', filter_id: 42 })
        const w = mountRow(section)
        const modelSelectStub = w.findComponent('.stub-model-select')
        modelSelectStub.vm.$emit('update:modelValue', null)
        await w.vm.$nextTick()

        expect(section.filter_id).toBeUndefined()
    })

    it('@update:model-value on ModelSelect syncs filter_id to picked entity id', async () => {
        const section = makeSection({ mode: 'keyword', filter_id: 42 })
        const w = mountRow(section)
        const modelSelectStub = w.findComponent('.stub-model-select')
        modelSelectStub.vm.$emit('update:modelValue', { id: 99, name: 'new keyword' })
        await w.vm.$nextTick()

        expect(section.filter_id).toBe(99)
    })
})
