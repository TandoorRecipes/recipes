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
                <v-expansion-panel v-if="isOnRecipeView">
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
                <v-expansion-panel v-if="isOnRecipeView">
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
                <v-expansion-panel>
                    <v-expansion-panel-title>{{ $t('CardDisplay') }}</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-switch
                            v-model="deviceSettings.card_showRating"
                            :label="$t('Show_Rating')"
                            hide-details density="compact"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showAuthor"
                            :label="$t('Show_Author')"
                            hide-details density="compact"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showLastCooked"
                            :label="$t('Show_Last_Cooked')"
                            hide-details density="compact"
                        />
                        <v-switch
                            v-model="deviceSettings.card_showNewBadge"
                            :label="$t('Show_New_Badge')"
                            hide-details density="compact"
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
import {useRoute} from 'vue-router'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'

const {t} = useI18n()
const {mobile} = useDisplay()
const route = useRoute()
const {isOpen, isPinned} = useRecipeViewSettings()
const deviceSettings = useUserPreferenceStore().deviceSettings

const isOnRecipeView = computed(() => route.name === 'RecipeViewPage')

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
</script>
