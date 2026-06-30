<template>
    <TabbedDrawer
        v-model="isOpen"
        v-model:pinned="isPinned"
        :pinnable="false"
        :tabs="drawerTabs"
        :width="320"
        :use-sheet="mobile"
    >
        <template #settings>
            <v-expansion-panels :model-value="[0, 1, 2]" multiple variant="accordion" class="mt-2">
                <!-- Ingredient display: only relevant on the recipe view. -->
                <v-expansion-panel v-if="isOnRecipeView" data-test="ingredient-display-panel">
                    <v-expansion-panel-title>{{ $t('IngredientDisplay') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <!-- Live preview (mobile only): the desktop recipe uses the multi-column
                             table, which can't be shown faithfully in the narrow drawer, so on
                             desktop we rely on the labelled Summary/Detail controls below. -->
                        <div v-if="mobile" class="settings-preview mb-4">
                            <div class="text-caption text-medium-emphasis">{{ $t('Summary') }}</div>
                            <div data-test="preview-summary" class="preview-pane">
                                <IngredientsTable
                                    :model-value="previewSummary" :ingredient-factor="1" context="overview"
                                    :show-checkbox="deviceSettings.recipe_overviewShowCheckboxes" :show-actions="deviceSettings.recipe_overviewShowActions"
                                />
                            </div>
                            <div class="text-caption text-medium-emphasis mt-2">{{ $t('Detail') }}</div>
                            <div data-test="preview-detail" class="preview-pane">
                                <IngredientsTable
                                    :model-value="previewDetail" :ingredient-factor="1" context="step"
                                    :show-checkbox="deviceSettings.recipe_stepShowCheckboxes" :show-actions="deviceSettings.recipe_stepShowActions"
                                />
                            </div>
                        </div>

                        <!-- Per-setting Summary / Detail controls. -->
                        <div class="settings-grid">
                            <div></div>
                            <div class="col-head">{{ $t('Summary') }}</div>
                            <div class="col-head">{{ $t('Detail') }}</div>

                            <div class="setting-label">{{ $t('StartExpanded') }}</div>
                            <div class="setting-cell" data-test="summary-expanded">
                                <v-switch v-model="deviceSettings.recipe_overviewExpanded" hide-details density="compact" color="primary" />
                            </div>
                            <div class="setting-cell text-disabled">—</div>

                            <div class="setting-label">{{ $t('Checkboxes') }}</div>
                            <div class="setting-cell" data-test="summary-checkboxes">
                                <v-switch v-model="deviceSettings.recipe_overviewShowCheckboxes" hide-details density="compact" color="primary" />
                            </div>
                            <div class="setting-cell" data-test="detail-checkboxes">
                                <v-switch v-model="deviceSettings.recipe_stepShowCheckboxes" hide-details density="compact" color="primary" />
                            </div>

                            <div class="setting-label">{{ $t('IngredientMenu') }}</div>
                            <div class="setting-cell" data-test="summary-actions">
                                <v-switch v-model="deviceSettings.recipe_overviewShowActions" hide-details density="compact" color="primary" />
                            </div>
                            <div class="setting-cell" data-test="detail-actions">
                                <v-switch v-model="deviceSettings.recipe_stepShowActions" hide-details density="compact" color="primary" />
                            </div>

                            <!-- Shared sub-option: highlight colour, revealed when either menu is on. -->
                            <div v-if="anyActions" class="span-row">
                                <v-select
                                    v-model="deviceSettings.recipe_contextMenuColor"
                                    data-test="highlight-color"
                                    :label="$t('HighlightWhen')"
                                    :items="contextMenuColorOptions" item-title="label" item-value="value"
                                    hide-details density="compact" variant="outlined"
                                />
                            </div>

                            <!-- Notes selects need more room than the switch columns, so they
                                 break to a full-width row with their own Summary/Detail labels. -->
                            <div class="full-row">
                                <div class="setting-label mb-1">{{ $t('IngredientNotes') }}</div>
                                <div class="notes-selects">
                                    <v-select
                                        v-model="deviceSettings.recipe_overviewNotesDisplay"
                                        data-test="summary-notes" :label="$t('Summary')"
                                        :items="notesDisplayOptions" item-title="label" item-value="value"
                                        hide-details density="compact" variant="outlined"
                                    />
                                    <v-select
                                        v-model="deviceSettings.recipe_stepNotesDisplay"
                                        data-test="detail-notes" :label="$t('Detail')"
                                        :items="notesDisplayOptions" item-title="label" item-value="value"
                                        hide-details density="compact" variant="outlined"
                                    />
                                </div>
                            </div>

                            <!-- Shared sub-option: truncate length, revealed when either notes mode is truncate. -->
                            <div v-if="anyTruncate" class="span-row">
                                <v-text-field
                                    v-model.number="deviceSettings.recipe_notesTruncateLength"
                                    data-test="truncate-length"
                                    :label="$t('MaxCharacters')"
                                    type="number" min="10" max="200"
                                    hide-details density="compact" variant="outlined"
                                />
                            </div>

                            <div class="setting-label">{{ $t('StatusIcons') }}</div>
                            <div class="setting-cell" data-test="summary-status">
                                <v-switch v-model="deviceSettings.recipe_overviewInlineStatus" hide-details density="compact" color="primary" />
                            </div>
                            <div class="setting-cell" data-test="detail-status">
                                <v-switch v-model="deviceSettings.recipe_stepInlineStatus" hide-details density="compact" color="primary" />
                            </div>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <!-- Recipe layout: which recipe-view fields / footer details are shown. -->
                <v-expansion-panel v-if="isOnRecipeView" data-test="recipe-layout-panel">
                    <v-expansion-panel-title>{{ $t('RecipeLayout') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-switch
                            v-model="deviceSettings.recipe_showAuthor"
                            :label="$t('Show_Author')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showTimeChips"
                            :label="$t('Show_Time_Chips')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showServings"
                            :label="$t('Show_Servings')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showFootCreatedBy"
                            :label="$t('Show_Created_By')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showFootCreatedDate"
                            :label="$t('Show_Created_Date')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showFootUpdatedDate"
                            :label="$t('Show_Updated_Date')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.recipe_showFootImportedFrom"
                            :label="$t('Show_Imported_From')"
                            hide-details density="compact" color="primary"
                        />
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <!-- Card display: applies wherever recipe cards are shown. -->
                <v-expansion-panel v-if="isOnCardContext" data-test="card-display-panel">
                    <v-expansion-panel-title>{{ $t('CardDisplay') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-switch
                            v-model="deviceSettings.card_showRating"
                            :label="$t('Show_Rating')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showAuthor"
                            :label="$t('Show_Author')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showLastCooked"
                            :label="$t('Show_Last_Cooked')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showNewBadge"
                            :label="$t('Show_New_Badge')"
                            hide-details density="compact" color="primary"
                        />
                        <v-switch
                            v-model="deviceSettings.card_show_cook_time"
                            :label="$t('Show_Cook_Time')"
                            hide-details density="compact" color="primary"
                        />
                        <v-select
                            v-model="deviceSettings.card_maxKeywords"
                            :label="$t('Max_Keywords')"
                            :items="maxKeywordsOptions"
                            item-title="title" item-value="value"
                            hide-details density="compact" variant="outlined"
                            class="py-2"
                        />
                        <div class="text-caption pt-2 pb-1 text-medium-emphasis">{{ $t('Menu_Items') }}</div>
                        <v-checkbox
                            v-for="item in menuItemDefs"
                            :key="item.key"
                            :label="$t(item.labelKey)"
                            :model-value="deviceSettings.card_visibleMenuItems.includes(item.key)"
                            @update:model-value="onToggleMenuItem(item.key, $event)"
                            hide-details density="compact" color="primary"
                        />
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </template>
    </TabbedDrawer>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'
import {useRoute} from 'vue-router'
import type {Ingredient} from '@/openapi'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'
import IngredientsTable from '@/components/display/IngredientsTable.vue'

const {t} = useI18n()
const {mobile} = useDisplay()
const route = useRoute()
const {isOpen, isPinned} = useRecipeViewSettings()
const deviceSettings = useUserPreferenceStore().deviceSettings

const isOnRecipeView = computed(() => route.name === 'RecipeViewPage')
// Routes where RecipeCard is rendered as part of a list/grid — the only
// places where the Card Display settings actually affect what the user
// sees. Outside these, the panel is gated out so the drawer is contextual.
const CARD_CONTEXT_ROUTES = new Set(['SearchPage', 'StartPage', 'BookEntryPage', 'MealPlanPage'])
const isOnCardContext = computed(() => CARD_CONTEXT_ROUTES.has(route.name as string))

const drawerTabs = computed(() => [
    {key: 'settings', label: t('DisplaySettings'), icon: 'fa-solid fa-gear'},
])

const notesDisplayOptions = computed(() => [
    {value: 'bubble', label: t('NotesHidden')},
    {value: 'inline', label: t('NotesAlwaysShown')},
    {value: 'truncate', label: t('NotesTruncated')},
])

const contextMenuColorOptions = computed(() => [
    {value: 'never', label: t('Never')},
    {value: 'onhand', label: t('OnHand')},
    {value: 'shopping', label: t('InShoppingList')},
])

const anyActions = computed(() => deviceSettings.recipe_overviewShowActions || deviceSettings.recipe_stepShowActions)
const anyTruncate = computed(() => deviceSettings.recipe_overviewNotesDisplay === 'truncate' || deviceSettings.recipe_stepNotesDisplay === 'truncate')

const maxKeywordsOptions = computed(() => [
    {title: '3', value: 3},
    {title: '5', value: 5},
    {title: '10', value: 10},
    {title: t('All'), value: 0},
])

const menuItemDefs: ReadonlyArray<{key: string; labelKey: string}> = [
    {key: 'edit', labelKey: 'Edit'},
    {key: 'plan', labelKey: 'Add_to_Plan'},
    {key: 'shopping', labelKey: 'Add_to_Shopping'},
    {key: 'book', labelKey: 'Add_to_Book'},
    {key: 'cooklog', labelKey: 'Log_Cooking'},
    {key: 'photo', labelKey: 'Edit_Photo'},
    {key: 'properties', labelKey: 'Property_Editor'},
    {key: 'share', labelKey: 'Share'},
    {key: 'export', labelKey: 'Export'},
    {key: 'duplicate', labelKey: 'Duplicate'},
    {key: 'print', labelKey: 'Print'},
    {key: 'delete', labelKey: 'Delete'},
]

function onToggleMenuItem(key: string, checked: boolean | null) {
    if (checked) {
        if (!deviceSettings.card_visibleMenuItems.includes(key)) {
            deviceSettings.card_visibleMenuItems = [...deviceSettings.card_visibleMenuItems, key]
        }
    } else {
        deviceSettings.card_visibleMenuItems = deviceSettings.card_visibleMenuItems.filter(k => k !== key)
    }
}

// A deliberately high-density sample row for the live preview: long amount,
// unit and name (so wrapping shows), a long note, shopping + ignore flags, and
// multiple on-hand substitutes (green "+N" chip) so every element is exercised
// and the user can see the worst case as they toggle settings.
function sample(): Ingredient {
    return {
        id: -1, amount: 12.5, order: 0, isHeader: false, noAmount: false,
        unit: {id: -1, name: 'heaping tablespoons', pluralName: null} as any,
        food: {
            id: -1, name: 'organic flat-leaf Italian parsley, finely chopped',
            shopping: true, foodOnhand: false, inInventory: false, ignoreShopping: true,
            substitute: [
                {id: -2, name: 'fresh cilantro'},
                {id: -3, name: 'dried parsley flakes'},
                {id: -4, name: 'chervil'},
            ],
            availableSubstitutes: [
                {id: -2, name: 'fresh cilantro'},
                {id: -3, name: 'dried parsley flakes'},
                {id: -4, name: 'chervil'},
            ],
            substituteOnhand: true,
        } as any,
        note: 'use the freshest bunch you can find, stems removed and leaves finely minced just before serving',
        checked: false,
    } as unknown as Ingredient
}

const previewSummary = [sample()]
const previewDetail = [sample()]
</script>

<style scoped>
.settings-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    column-gap: 8px;
    row-gap: 4px;
    align-items: center;
}

.col-head {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.7;
}

.setting-label {
    font-size: 0.875rem;
}

.setting-cell {
    display: flex;
    justify-content: center;
}

/* Shared sub-options span all three columns at the same width as the other inputs. */
.span-row {
    grid-column: 1 / -1;
    padding: 4px 0 8px 0;
}

/* A primary setting whose controls need the full width (e.g. the notes selects). */
.full-row {
    grid-column: 1 / -1;
    padding-top: 4px;
}

/* Stacked full-width so the longest option label ("Hidden (tap to show)") never clips. */
.notes-selects {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
}

/* Interactive preview so the note-expand (truncate) and note-bubble behaviours
 * can be tried out directly; opening the kebab makes no network calls. */
.preview-pane {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 4px;
    padding: 4px 8px;
}
</style>
