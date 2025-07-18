<template>

    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-h4">Welcome {{ useUserPreferenceStore().userSettings.user.displayName }}</v-card-title>

                    <v-card-text class="text-body-1">
                        <p>This page contains basic information to the most important features and concepts of Tandoor.</p>
                        <p> It is recommended to read at least the first few entries to get a feel of what Tandoor can do for you.</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <i :class="TUserSpace.icon" class="fa-fw me-2"></i> {{ $t('Space') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <p>All your data is stored in a space where you can invite other people to collaborate on your recipe database.</p>
                            <p class="mt-1">
                                Books, Shopping Lists and Mealplans are not shared by default. You can share them with specific other members of
                                your space using the settings.
                            </p>
                            <p class="mt-1">
                                You can create and be a member of multiple spaces. Switch between them freely using the navigation or space settings.
                                Depending on the permission configured by the space owner some features might not be available in all spaces.
                            </p>
                            <v-divider class="mt-2 mb-2"></v-divider>
                            <v-btn color="info" variant="tonal" prepend-icon="$settings" class="me-2" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
                            <v-btn color="info" variant="tonal" prepend-icon="fa-solid fa-users" class="me-2" :to="{name: 'SpaceMemberSettings'}">{{ $t('Invites') }}</v-btn>

                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <i :class="TRecipe.icon" class="fa-fw me-2"></i> {{ $t('Recipes') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <p>Recipes are the foundation of your Tandoor space. A Recipe has one or more steps that contain
                                all ingredients, instructions and other information. Ingredients in turn consist of an amount, a unit and a food,
                                allowing recipes to be scaled, nutrition's to be calculated and shopping to be organized.</p>

                            <p class="mt-1">Besides manually creating them you can also
                                import them from various different places.</p>

                            <v-divider class="mt-2 mb-2"></v-divider>
                            <v-btn color="info" variant="tonal" prepend-icon="$create" class="me-2" :to="{ name: 'ModelEditPage', params: {model: 'recipe'} }">{{ $t('Create') }}
                            </v-btn>
                            <v-btn color="info" variant="tonal" prepend-icon="$import" class="me-2" :to="{ name: 'RecipeImportPage' }">{{ $t('Import') }}</v-btn>

                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <i :class="TUnit.icon" class="fa-fw me-2"></i> {{ $t('Units') }} & {{ $t('UnitConversion') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <p>Units allow you to measure how much of something you need in a recipe or on a shopping list. They are
                            also essential for the calculation of Properties. </p>

                            <p class="mt-1">Setting a base unit allows you to name your Unit however you want (e.g. grams, g, G, gram)
                            while allowing Tandoor to automatically convert between the units in the same system (weight/volume).
                            Additionally you can use custom unit conversion to convert between volume and weight trough the
                            specific density of a food (e.g. 1 cup of flour = 120 g). These conversions are used to calculate
                            the Properties for a Recipe and might allow cosmetic display changes later.</p>

                            <v-divider class="mt-2 mb-2"></v-divider>
                            <v-btn color="info" variant="tonal" prepend-icon="$create" class="me-2" :to="{ name: 'ModelEditPage', params: {model: 'unit'} }">{{ $t('Unit') }}
                            </v-btn>
                            <v-btn color="info" variant="tonal" prepend-icon="$create" class="me-2" :to="{ name: 'ModelEditPage', params: {model: 'unitconversion'} }">{{ $t('UnitConversion') }}</v-btn>

                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>

    </v-container>

</template>

<script setup lang="ts">

import {TKeyword, TRecipe, TUnit, TUserSpace} from "@/types/Models";
import {useUserPreferenceStore} from "../stores/UserPreferenceStore";
import HelpDialog from "@/components/dialogs/HelpDialog.vue";
</script>

<style scoped>

</style>