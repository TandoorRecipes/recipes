<template>
    <v-form>
        <v-expansion-panels multiple v-model="openPanels">

            <!-- Appearance -->
            <v-expansion-panel value="appearance">
                <v-expansion-panel-title>
                    <v-icon start icon="fa-solid fa-palette" />
                    {{ $t('Appearance') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-select
                        :label="$t('Theme')"
                        class="mt-2"
                        v-model="userPrefs.userSettings.theme"
                        :items="[{title: 'Tandoor', value: 'TANDOOR'}, {title: 'Tandoor Dark', value: 'TANDOOR_DARK'}]"
                    />

                    <v-label class="mt-2">{{ $t('Nav_Color') }}</v-label>
                    <v-color-picker
                        v-model="userPrefs.userSettings.navBgColor"
                        mode="hex"
                        :modes="['hex']"
                        show-swatches
                        :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"
                        class="mb-2"
                    />

                    <v-checkbox :label="$t('Show_Logo')" :hint="$t('Show_Logo_Help')" persistent-hint v-model="userPrefs.userSettings.navShowLogo" />
                    <v-checkbox :label="$t('Sticky_Nav')" :hint="$t('Sticky_Nav_Help')" persistent-hint v-model="userPrefs.userSettings.navSticky" />

                    <div class="mt-2">
                        <language-select />
                    </div>

                    <v-btn class="mt-4" color="success" @click="userPrefs.updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Recipe Display -->
            <v-expansion-panel value="recipe-display">
                <v-expansion-panel-title>
                    <v-icon start icon="fa-solid fa-utensils" />
                    {{ $t('Recipe_Display') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-checkbox :label="$t('Use_Fractions')" :hint="$t('Use_Fractions_Help')" persistent-hint v-model="userPrefs.userSettings.useFractions" />
                    <v-number-input v-model="userPrefs.userSettings.ingredientDecimals" :label="$t('Decimals')" :step="1" :min="0" :max="4" class="mt-2" />
                    <v-text-field v-model="userPrefs.userSettings.defaultUnit" :label="$t('Default_Unit')" class="mt-2" />
                    <v-checkbox :label="$t('show_step_ingredients_setting')" :hint="$t('show_step_ingredients_setting_help')" persistent-hint v-model="userPrefs.userSettings.showStepIngredients" />
                    <v-checkbox :label="$t('Comments_setting')" v-model="userPrefs.userSettings.comments" />
                    <v-checkbox :label="$t('left_handed')" :hint="$t('left_handed_help')" persistent-hint v-model="userPrefs.userSettings.leftHanded" />

                    <v-btn class="mt-4" color="success" @click="userPrefs.updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Recipe Card -->
            <v-expansion-panel value="recipe-cards">
                <v-expansion-panel-title>
                    <v-icon start icon="fa-solid fa-image" />
                    {{ $t('Recipe_Card') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <!-- Live preview -->
                    <div class="d-flex justify-center mb-4">
                        <v-card variant="outlined" style="width: 220px; overflow: hidden;">
                            <recipe-card :recipe="previewRecipe" :show-menu="false" height="120px" />
                        </v-card>
                    </div>

                    <v-switch v-model="deviceSettings.card_showRating"
                              :label="$t('Rating')" density="compact" hide-details color="primary" />
                    <v-switch v-model="deviceSettings.card_showAuthor"
                              :label="$t('CreatedBy')" density="compact" hide-details color="primary" />
                    <v-switch v-model="deviceSettings.card_showLastCooked"
                              :label="$t('last_cooked')" density="compact" hide-details color="primary" />
                    <v-switch v-model="deviceSettings.card_showNewBadge"
                              :label="$t('New')" density="compact" hide-details color="primary" />
                    <v-select v-model="deviceSettings.card_maxKeywords"
                              :label="$t('Keywords')" density="compact" hide-details class="mt-2"
                              :items="[{title: '3', value: 3}, {title: '5', value: 5}, {title: '10', value: 10}, {title: $t('All'), value: 0}]" />

                    <v-btn class="mt-4" color="success" @click="userPrefs.updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Recipe Context Menu -->
            <v-expansion-panel value="context-menu">
                <v-expansion-panel-title>
                    <v-icon start icon="fa-solid fa-ellipsis-vertical" />
                    {{ $t('context_menu') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-checkbox v-for="item in menuItemOptions" :key="item.key"
                                v-model="deviceSettings.card_visibleMenuItems"
                                :label="$t(item.label)" :value="item.key" density="compact" hide-details />

                    <v-btn class="mt-4" color="success" @click="userPrefs.updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
                </v-expansion-panel-text>
            </v-expansion-panel>

        </v-expansion-panels>
    </v-form>
</template>

<script setup lang="ts">
import {computed, ref} from "vue"
import {useI18n} from "vue-i18n"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import LanguageSelect from "@/components/inputs/LanguageSelect.vue"
import RecipeCard from "@/components/display/RecipeCard.vue"

const {t} = useI18n()
const userPrefs = useUserPreferenceStore()
const deviceSettings = userPrefs.deviceSettings
const openPanels = ref(['appearance', 'recipe-display'])

const previewRecipe = computed(() => ({
    id: 0,
    name: t('Example_Recipe'),
    rating: 4.5,
    createdBy: {displayName: 'Chef'},
    lastCooked: new Date(Date.now() - 2 * 86400000).toISOString(),
    keywords: [
        {id: 1, name: t('dinner'), label: t('dinner')},
        {id: 2, name: t('quick'), label: t('quick')},
        {id: 3, name: t('healthy'), label: t('healthy')},
        {id: 4, name: t('vegetarian'), label: t('vegetarian')},
    ],
    _new: true,
    _private: false,
    internal: true,
    workingTime: 25,
    waitingTime: 10,
    servings: 4,
}))

const menuItemOptions = [
    {key: 'edit', label: 'Edit'},
    {key: 'plan', label: 'Add_to_Plan'},
    {key: 'shopping', label: 'Add_to_Shopping'},
    {key: 'book', label: 'Add_to_Book'},
    {key: 'cooklog', label: 'Log_Cooking'},
    {key: 'photo', label: 'Edit_Photo'},
    {key: 'properties', label: 'Property_Editor'},
    {key: 'share', label: 'Share'},
    {key: 'export', label: 'Export'},
    {key: 'duplicate', label: 'Duplicate'},
    {key: 'print', label: 'Print'},
    {key: 'delete', label: 'Delete'},
]

</script>

<style scoped></style>
