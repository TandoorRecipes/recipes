<template>
    <TabbedDrawer
        v-model="isOpen"
        v-model:active-tab="activeTab"
        v-model:pinned="isPinned"
        :tabs="drawerTabs"
        :width="300"
        :use-sheet="mobile"
    >
        <template #overview>
            <v-switch
                v-model="deviceSettings.recipe_overviewExpanded"
                :label="$t('StartExpanded')"
                hide-details density="compact" class="px-4 pt-2"
            />
            <v-select
                v-model="deviceSettings.recipe_overviewNotesDisplay"
                :label="$t('IngredientNotes')"
                :items="notesDisplayOptions"
                item-title="label" item-value="value"
                hide-details density="compact" variant="outlined"
                class="px-4 py-2"
            />
            <v-text-field
                v-if="deviceSettings.recipe_overviewNotesDisplay === 'truncate'"
                v-model.number="deviceSettings.recipe_notesTruncateLength"
                :label="$t('MaxCharacters')"
                type="number" min="10" max="200"
                hide-details density="compact" variant="outlined"
                class="px-4 pb-2"
            />
            <v-switch
                v-if="!mobile"
                v-model="deviceSettings.recipe_overviewInlineStatus"
                :label="$t('IngredientStatusIcons')"
                hide-details density="compact" class="px-4"
            />
            <v-switch
                v-model="deviceSettings.recipe_showIngredientActions"
                :label="$t('IngredientActions')"
                hide-details density="compact" class="px-4"
            />
            <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ $t('IngredientActionsHelp') }}</div>
            <v-select
                v-if="deviceSettings.recipe_showIngredientActions"
                v-model="deviceSettings.recipe_contextMenuColor"
                :label="$t('HighlightWhen')"
                :items="contextMenuColorOptions"
                item-title="label" item-value="value"
                hide-details density="compact" variant="outlined"
                class="px-4 py-2"
            />
        </template>

        <template #steps>
            <v-switch
                v-model="deviceSettings.recipe_showCheckboxes"
                :label="$t('CheckOffIngredients')"
                hide-details density="compact" class="px-4 pt-2"
            />
            <v-select
                v-model="deviceSettings.recipe_stepNotesDisplay"
                :label="$t('IngredientNotes')"
                :items="notesDisplayOptions"
                item-title="label" item-value="value"
                hide-details density="compact" variant="outlined"
                class="px-4 py-2"
            />
            <v-text-field
                v-if="deviceSettings.recipe_stepNotesDisplay === 'truncate'"
                v-model.number="deviceSettings.recipe_notesTruncateLength"
                :label="$t('MaxCharacters')"
                type="number" min="10" max="200"
                hide-details density="compact" variant="outlined"
                class="px-4 pb-2"
            />
            <v-switch
                v-if="!mobile"
                v-model="deviceSettings.recipe_stepInlineStatus"
                :label="$t('IngredientStatusIcons')"
                hide-details density="compact" class="px-4"
            />
            <v-switch
                v-model="deviceSettings.recipe_showIngredientActions"
                :label="$t('IngredientActions')"
                hide-details density="compact" class="px-4"
            />
            <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ $t('IngredientActionsHelp') }}</div>
            <v-select
                v-if="deviceSettings.recipe_showIngredientActions"
                v-model="deviceSettings.recipe_contextMenuColor"
                :label="$t('HighlightWhen')"
                :items="contextMenuColorOptions"
                item-title="label" item-value="value"
                hide-details density="compact" variant="outlined"
                class="px-4 py-2"
            />
        </template>
    </TabbedDrawer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'

const {t} = useI18n()
const {mobile} = useDisplay()
const {isOpen, isPinned} = useRecipeViewSettings()
const deviceSettings = useUserPreferenceStore().deviceSettings
const activeTab = ref('overview')

const drawerTabs = computed(() => [
    {key: 'overview', label: t('Overview'), icon: 'far fa-list-alt'},
    {key: 'steps', label: t('StepDetails'), icon: 'fa-solid fa-layer-group'},
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
    {value: 'substitute', label: t('HasSubstitute')},
])
</script>
