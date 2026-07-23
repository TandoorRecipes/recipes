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

        </v-expansion-panels>
    </v-form>
</template>

<script setup lang="ts">
import {ref} from "vue"
import {useI18n} from "vue-i18n"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import LanguageSelect from "@/components/inputs/LanguageSelect.vue"

const {t} = useI18n()
const userPrefs = useUserPreferenceStore()
const openPanels = ref(['appearance', 'recipe-display'])

</script>

<style scoped></style>
