<template>
    <TabbedDrawer
        v-model="isOpen"
        v-model:pinned="isPinned"
        :tabs="drawerTabs"
        :width="320"
        :use-sheet="mobile"
    >
        <template #settings>
            <v-expansion-panels :model-value="[0, 1]" multiple variant="accordion" class="mt-2">
                <v-expansion-panel>
                    <v-expansion-panel-title>{{ $t('IngredientSummarySection') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="text-caption pb-2 text-medium-emphasis">{{ $t('IngredientSummaryScope') }}</div>
                        <v-switch
                            v-model="deviceSettings.recipe_overviewExpanded"
                            :label="$t('StartExpanded')"
                            hide-details density="compact"
                        />
                        <div class="text-caption pb-1 text-medium-emphasis">{{ $t('StartExpandedHelper') }}</div>
                        <v-switch
                            v-model="deviceSettings.recipe_showIngredientActions"
                            :label="$t('IngredientMenu')"
                            hide-details density="compact"
                        />
                        <div class="text-caption pb-1 text-medium-emphasis">{{ $t('IngredientMenuHelp') }}</div>
                        <v-select
                            v-if="deviceSettings.recipe_showIngredientActions"
                            v-model="deviceSettings.recipe_contextMenuColor"
                            :label="$t('HighlightWhen')"
                            :items="contextMenuColorOptions"
                            item-title="label" item-value="value"
                            hide-details density="compact" variant="outlined"
                            class="py-2"
                        />
                        <v-select
                            v-model="deviceSettings.recipe_overviewNotesDisplay"
                            :label="$t('IngredientNotes')"
                            :items="notesDisplayOptions"
                            item-title="label" item-value="value"
                            hide-details density="compact" variant="outlined"
                            class="py-2"
                        />
                        <v-text-field
                            v-if="deviceSettings.recipe_overviewNotesDisplay === 'truncate'"
                            v-model.number="deviceSettings.recipe_notesTruncateLength"
                            :label="$t('MaxCharacters')"
                            type="number" min="10" max="200"
                            hide-details density="compact" variant="outlined"
                            class="pb-2"
                        />
                        <v-switch
                            v-if="!mobile"
                            v-model="deviceSettings.recipe_overviewInlineStatus"
                            :label="$t('IngredientStatusIcons')"
                            hide-details density="compact"
                        />
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-title>{{ $t('StepIngredientsSection') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="text-caption pb-2 text-medium-emphasis">{{ $t('StepIngredientsScope') }}</div>
                        <v-switch
                            v-model="deviceSettings.recipe_showCheckboxes"
                            :label="$t('CheckOffIngredients')"
                            hide-details density="compact"
                        />
                        <v-select
                            v-model="deviceSettings.recipe_stepNotesDisplay"
                            :label="$t('IngredientNotes')"
                            :items="notesDisplayOptions"
                            item-title="label" item-value="value"
                            hide-details density="compact" variant="outlined"
                            class="py-2"
                        />
                        <v-text-field
                            v-if="deviceSettings.recipe_stepNotesDisplay === 'truncate'"
                            v-model.number="deviceSettings.recipe_notesTruncateLength"
                            :label="$t('MaxCharacters')"
                            type="number" min="10" max="200"
                            hide-details density="compact" variant="outlined"
                            class="pb-2"
                        />
                        <v-switch
                            v-if="!mobile"
                            v-model="deviceSettings.recipe_stepInlineStatus"
                            :label="$t('IngredientStatusIcons')"
                            hide-details density="compact"
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
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'

const {t} = useI18n()
const {mobile} = useDisplay()
const {isOpen, isPinned} = useRecipeViewSettings()
const deviceSettings = useUserPreferenceStore().deviceSettings

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
</script>
