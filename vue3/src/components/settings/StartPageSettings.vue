<template>
    <v-form>
        <p class="text-h6">{{ $t('Home') }}</p>
        <v-divider class="mb-3" />

        <!-- Default page -->
        <v-select
            :label="$t('DefaultPage')"
            :hint="$t('DefaultPageHelp')"
            persistent-hint
            v-model="defaultPage"
            :items="defaultPageOptions"
            item-title="label"
            item-value="page"
            density="compact"
            class="mb-4"
        />

        <!-- Meal Plan toggle -->
        <v-label class="text-overline text-medium-emphasis d-block mb-1">{{ $t('Meal_Plan') }}</v-label>
        <v-card variant="outlined" class="d-flex align-center ga-2 pa-3 mb-2">
            <v-icon icon="fa-solid fa-calendar-days" size="small" />
            <span class="text-body-2 font-weight-medium flex-grow-1">{{ $t('show_meal_plan_on_home') }}</span>
            <v-switch
                v-model="showMealPlan"
                density="compact"
                hide-details
                color="primary"
                class="flex-grow-0"
            />
        </v-card>

        <!-- Recipe Sections -->
        <v-label class="text-overline text-medium-emphasis d-block mb-1 mt-4">{{ $t('Sections') }}</v-label>
        <p class="text-body-2 text-medium-emphasis mb-2">{{ $t('home_sections_help') }}</p>

        <VueDraggable
            v-model="localSections"
            handle=".drag-handle"
        >
            <v-card
                v-for="section in localSections"
                :key="section._key"
                variant="outlined"
                class="d-flex align-center ga-2 pa-3 mb-1"
            >
                <v-icon
                    class="drag-handle flex-shrink-0"
                    icon="fa-solid fa-grip-vertical"
                    size="small"
                    aria-label="Drag to reorder"
                />

                <div class="flex-grow-1 d-flex flex-column ga-1" style="min-height: 48px" @click.stop @mousedown.stop>
                    <span class="text-body-2 font-weight-medium">{{ modeLabel(section.mode) }}</span>
                    <span class="text-caption text-medium-emphasis">{{ modeDescription(section.mode) }}</span>

                    <div v-if="MODEL_FOR_MODE[section.mode]" style="max-width: 280px">
                        <model-select
                            :model="MODEL_FOR_MODE[section.mode]"
                            v-model="section._filterObj"
                            density="compact"
                            hide-details
                            search-on-load
                            can-clear
                            append-to-body
                            :placeholder="t('any_random', {target: modeLabel(section.mode)})"
                        />
                    </div>
                    <v-select
                        v-else-if="section.mode === 'created_by'"
                        v-model="section.filter_id"
                        :items="availableUsers"
                        item-title="label"
                        item-value="value"
                        density="compact"
                        hide-details
                        :placeholder="t('any_random', {target: t('User')})"
                        clearable
                        style="max-width: 280px"
                    />
                    <v-select
                        v-else-if="section.mode === 'rating'"
                        v-model="section.filter_id"
                        :items="ratingOptions"
                        item-title="label"
                        item-value="value"
                        density="compact"
                        hide-details
                        :placeholder="t('default_rating_4')"
                        clearable
                        style="max-width: 280px"
                    />
                </div>

                <v-btn
                    icon="fa-solid fa-trash"
                    variant="plain"
                    size="default"
                    :aria-label="$t('Delete')"
                    @click="removeSection(section._key)"
                >
                    <v-icon size="small" icon="fa-solid fa-trash" />
                    <v-tooltip activator="parent" location="top">{{ $t('remove_section') }}</v-tooltip>
                </v-btn>
            </v-card>
        </VueDraggable>

        <!-- Add section -->
        <div class="d-flex align-center mt-3 ga-2">
            <v-select
                v-model="newMode"
                :items="availableModes"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                variant="outlined"
                :placeholder="$t('add_section')"
                class="flex-grow-1"
            />
            <v-btn
                icon="fa-solid fa-plus"
                color="primary"
                size="default"
                :disabled="!newMode"
                :aria-label="$t('add_section')"
                @click="addSection"
            >
                <v-icon icon="fa-solid fa-plus" />
            </v-btn>
        </div>

        <!-- Actions -->
        <div class="d-flex align-center mt-4 ga-2">
            <v-btn
                color="success"
                prepend-icon="$save"
                @click="save"
            >
                {{ $t('Save') }}
            </v-btn>
            <v-spacer />
            <v-btn
                variant="text"
                color="warning"
                prepend-icon="fa-solid fa-rotate-left"
                @click="confirmReset = true"
            >
                {{ $t('Reset') }}
            </v-btn>
        </div>

        <!-- Reset confirmation dialog -->
        <v-dialog v-model="confirmReset" max-width="400">
            <v-card>
                <v-card-title>{{ $t('Reset') }}</v-card-title>
                <v-card-text>{{ $t('confirm_reset_sections') }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirmReset = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="warning" @click="confirmReset = false; resetToDefaults()">{{ $t('Reset') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete confirmation dialog -->
        <v-dialog v-model="confirmDelete" max-width="400">
            <v-card>
                <v-card-title>{{ $t('Delete') }}</v-card-title>
                <v-card-text>{{ $t('confirm_delete_section', {name: deleteSectionName}) }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirmDelete = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="error" @click="confirmDelete = false; doRemoveSection()">{{ $t('Delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-form>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from "vue"
import {VueDraggable} from "vue-draggable-plus"
import {useI18n} from "vue-i18n"
import {ApiApi, type DefaultPageEnum} from "@/openapi"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore"
import type {StartPageSection, StartPageSectionMode} from "@/types/settings"
import ModelSelect from "@/components/inputs/ModelSelect.vue"

const {t} = useI18n()
const userPrefs = useUserPreferenceStore()

// --- Types ---

interface LocalSection extends StartPageSection {
    _key: string
    _filterObj: {id?: number, name?: string, label?: string, displayName?: string} | null
}

// --- Constants ---

const ratingOptions = [
    {value: 1, label: '≥ 1'},
    {value: 2, label: '≥ 2'},
    {value: 3, label: '≥ 3'},
    {value: 4, label: '≥ 4'},
    {value: 5, label: '5'},
]

const ALL_MODES: {value: StartPageSectionMode, label: string}[] = [
    {value: 'recent', label: t('Recently_Viewed')},
    {value: 'new', label: t('New')},
    {value: 'random', label: t('Random')},
    {value: 'rating', label: t('Rating')},
    {value: 'keyword', label: t('Keyword')},
    {value: 'food', label: t('Food')},
    {value: 'books', label: t('Recipe_Book')},
    {value: 'created_by', label: t('Created_By')},
    {value: 'saved_search', label: t('Saved_Filter')},
]

const MODE_DESCRIPTIONS: Record<string, string> = {
    recent: t('section_desc_recent'),
    new: t('section_desc_new'),
    keyword: t('section_desc_keyword'),
    random: t('section_desc_random'),
    created_by: t('section_desc_created_by'),
    rating: t('section_desc_rating'),
    books: t('section_desc_books'),
    food: t('section_desc_food'),
    saved_search: t('section_desc_saved_search'),
}

const DEFAULT_SECTIONS: StartPageSection[] = [
    {mode: 'recent', enabled: true, min_recipes: 10},
    {mode: 'new', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 10},
    {mode: 'random', enabled: true, min_recipes: 0},
    {mode: 'created_by', enabled: true, min_recipes: 10},
    {mode: 'rating', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 25},
    {mode: 'random', enabled: true, min_recipes: 25},
]

const MODEL_FOR_MODE: Record<string, string> = {
    keyword: 'Keyword',
    books: 'RecipeBook',
    food: 'Food',
    saved_search: 'CustomFilter',
}

// --- State ---

const defaultPage = ref('HOME')
const showMealPlan = ref(true)
const localSections = ref<LocalSection[]>([])
const newMode = ref<StartPageSectionMode | null>(null)
const availableModes = computed(() => ALL_MODES)
const availableUsers = ref<{value: number, label: string}[]>([])
const confirmReset = ref(false)
const confirmDelete = ref(false)
const deleteSectionKey = ref<string | null>(null)
const deleteSectionName = ref('')

const defaultPageOptions = [
    {page: 'HOME', label: t('Home')},
    {page: 'SEARCH', label: t('Search')},
    {page: 'PLAN', label: t('Meal_Plan')},
    {page: 'BOOKS', label: t('Books')},
    {page: 'SHOPPING', label: t('Shopping_list')},
]

let keyCounter = 0
function makeKey(): string {
    return `section-${Date.now()}-${keyCounter++}`
}

// --- Helpers ---

function modeLabel(mode: StartPageSectionMode): string {
    return ALL_MODES.find(m => m.value === mode)?.label ?? mode
}

function modeDescription(mode: StartPageSectionMode): string {
    return MODE_DESCRIPTIONS[mode] ?? ''
}

function toLocalSection(s: StartPageSection): LocalSection {
    return {...s, _key: makeKey(), _filterObj: null}
}

// --- Actions (local only, no auto-save) ---

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

// --- Save (explicit only) ---

async function save() {
    try {
        // Serialize sections: meal plan first (if enabled), then recipe sections
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

        // Save sections and default page
        userPrefs.userSettings.startPageSections = serialized
        userPrefs.userSettings.defaultPage = defaultPage.value as DefaultPageEnum
        await userPrefs.updateUserSettings()
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }
}

function resetToDefaults() {
    localSections.value = DEFAULT_SECTIONS.map(s => toLocalSection(s))
    showMealPlan.value = true
}

// --- Load & resolve ---

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
    const source: StartPageSection[] = Array.isArray(raw) && raw.length > 0 ? raw : [{mode: 'meal_plan', enabled: true}, ...DEFAULT_SECTIONS]

    showMealPlan.value = source.some(s => s.mode === 'meal_plan' && s.enabled)
    const recipeSections = source.filter(s => s.mode !== 'meal_plan')
    localSections.value = recipeSections.map((s: StartPageSection) => toLocalSection(s))
    resolveFilterObjects()

    defaultPage.value = (userPrefs.userSettings.defaultPage as string) || 'HOME'
}

// --- Init ---

onMounted(async () => {
    // Wait for store init if it hasn't completed yet (direct URL navigation)
    if (!userPrefs.initCompleted) {
        await userPrefs.init()
    }

    new ApiApi().apiUserList({}).then(users => {
        availableUsers.value = users.map(u => ({value: u.id!, label: u.displayName ?? `User #${u.id}`}))
    }).catch(() => {})

    loadFromStore()
})
</script>

<style scoped>
.drag-handle {
    cursor: grab;
}
</style>
