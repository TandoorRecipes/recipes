import {ref, computed} from "vue"
import {useI18n} from "vue-i18n"
import {ApiApi, type DefaultPageEnum} from "@/openapi"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore"
import type {StartPageSection, StartPageSectionMode} from "@/types/settings"

export interface LocalSection extends StartPageSection {
    _key: string
    _filterObj: {id?: number, name?: string, label?: string, displayName?: string} | null
}

export const MODEL_FOR_MODE: Partial<Record<StartPageSectionMode, 'Keyword' | 'RecipeBook' | 'Food' | 'CustomFilter'>> = {
    keyword: 'Keyword',
    books: 'RecipeBook',
    food: 'Food',
    saved_search: 'CustomFilter',
}

export const DEFAULT_SECTIONS: StartPageSection[] = [
    {mode: 'recent', enabled: true, min_recipes: 10},
    {mode: 'new', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 10},
    {mode: 'random', enabled: true, min_recipes: 0},
    {mode: 'created_by', enabled: true, min_recipes: 10},
    {mode: 'rating', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 25},
    {mode: 'random', enabled: true, min_recipes: 25},
]

export function useStartPageSections() {
    const {t} = useI18n()
    const userPrefs = useUserPreferenceStore()

    const ALL_MODES = computed<{value: StartPageSectionMode, label: string}[]>(() => [
        {value: 'recent', label: t('Recently_Viewed')},
        {value: 'new', label: t('New')},
        {value: 'random', label: t('Random')},
        {value: 'rating', label: t('Rating')},
        {value: 'keyword', label: t('Keyword')},
        {value: 'food', label: t('Food')},
        {value: 'books', label: t('Recipe_Book')},
        {value: 'created_by', label: t('Created_By')},
        {value: 'saved_search', label: t('Saved_Filter')},
    ])

    const MODE_DESCRIPTIONS = computed<Record<string, string>>(() => ({
        recent: t('section_desc_recent'),
        new: t('section_desc_new'),
        keyword: t('section_desc_keyword'),
        random: t('section_desc_random'),
        created_by: t('section_desc_created_by'),
        rating: t('section_desc_rating'),
        books: t('section_desc_books'),
        food: t('section_desc_food'),
        saved_search: t('section_desc_saved_search'),
    }))

    const defaultPageOptions = computed(() => [
        {page: 'HOME', label: t('Home')},
        {page: 'SEARCH', label: t('Search')},
        {page: 'PLAN', label: t('Meal_Plan')},
        {page: 'BOOKS', label: t('Books')},
        {page: 'SHOPPING', label: t('Shopping_list')},
    ])

    const defaultPage = ref<DefaultPageEnum>('HOME' as DefaultPageEnum)
    const showMealPlan = ref(true)
    const localSections = ref<LocalSection[]>([])
    const newMode = ref<StartPageSectionMode | null>(null)
    const confirmReset = ref(false)
    const confirmDelete = ref(false)
    const deleteSectionKey = ref<string | null>(null)
    const deleteSectionName = ref('')

    let keyCounter = 0
    function makeKey(): string {
        return `section-${Date.now()}-${keyCounter++}`
    }

    function modeLabel(mode: StartPageSectionMode): string {
        return ALL_MODES.value.find(m => m.value === mode)?.label ?? mode
    }

    function modeDescription(mode: StartPageSectionMode): string {
        return MODE_DESCRIPTIONS.value[mode] ?? ''
    }

    function toLocalSection(s: StartPageSection): LocalSection {
        return {...s, _key: makeKey(), _filterObj: null}
    }

    function removeSection(key: string) {
        const idx = localSections.value.findIndex(s => s._key === key)
        if (idx === -1) return
        deleteSectionKey.value = key
        deleteSectionName.value = modeLabel(localSections.value[idx].mode)
        confirmDelete.value = true
    }

    function doRemoveSection() {
        if (!deleteSectionKey.value) return
        const idx = localSections.value.findIndex(s => s._key === deleteSectionKey.value)
        if (idx !== -1) localSections.value.splice(idx, 1)
        deleteSectionKey.value = null
    }

    function cancelDelete() {
        confirmDelete.value = false
        deleteSectionKey.value = null
    }

    function addSection() {
        if (!newMode.value) return
        const section = toLocalSection({
            mode: newMode.value,
            enabled: true,
            min_recipes: 0,
        })
        localSections.value.push(section)
        newMode.value = null
    }

    function resetToDefaults() {
        localSections.value = DEFAULT_SECTIONS.map(s => toLocalSection(s))
        showMealPlan.value = true
    }

    async function save() {
        try {
            const serialized: StartPageSection[] = []

            if (showMealPlan.value) {
                serialized.push({mode: 'meal_plan', enabled: true})
            }

            for (const s of localSections.value) {
                const out: StartPageSection = {
                    mode: s.mode,
                    enabled: s.enabled,
                }
                if (s.min_recipes !== undefined) out.min_recipes = s.min_recipes

                const filterId = s._filterObj?.id ?? s.filter_id
                if (filterId && typeof filterId === 'number') {
                    out.filter_id = filterId
                }

                serialized.push(out)
            }

            userPrefs.userSettings.startPageSections = serialized
            userPrefs.userSettings.defaultPage = defaultPage.value
            await userPrefs.updateUserSettings()
        } catch (err: any) {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }
    }

    async function resolveFilterObjects() {
        const api = new ApiApi()
        const pending = localSections.value
            .filter(s => s.filter_id && MODEL_FOR_MODE[s.mode])
            .map(async (section) => {
                const method = `api${MODEL_FOR_MODE[section.mode]}Retrieve` as keyof typeof api
                if (typeof api[method] === 'function') {
                    try {
                        section._filterObj = await (api[method] as Function)({id: section.filter_id})
                    } catch { /* item may have been deleted */ }
                }
            })
        await Promise.all(pending)
    }

    function loadFromStore() {
        const raw = userPrefs.userSettings?.startPageSections
        const source: StartPageSection[] = Array.isArray(raw) && raw.length > 0
            ? raw
            : [{mode: 'meal_plan', enabled: true}, ...DEFAULT_SECTIONS]

        showMealPlan.value = source.some(s => s.mode === 'meal_plan' && s.enabled)
        const recipeSections = source.filter(s => s.mode !== 'meal_plan')
        localSections.value = recipeSections.map((s: StartPageSection) => toLocalSection(s))
        resolveFilterObjects()

        defaultPage.value = userPrefs.userSettings.defaultPage || ('HOME' as DefaultPageEnum)
    }

    return {
        defaultPage,
        showMealPlan,
        localSections,
        newMode,
        confirmReset,
        confirmDelete,
        deleteSectionName,
        availableModes: ALL_MODES,
        defaultPageOptions,
        modeLabel,
        modeDescription,
        addSection,
        removeSection,
        doRemoveSection,
        cancelDelete,
        resetToDefaults,
        save,
        loadFromStore,
    }
}
