<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card prepend-icon="fa-solid fa-folder-tree" :title="$t('Database')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('DatabaseHelp') }}
                        </div>
                    </template>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ $t('Basics') }}</h2>
            </v-col>
        </v-row>
        <v-row dense>
            <database-model-col model="Food"></database-model-col>
            <database-model-col model="Unit"></database-model-col>
            <database-model-col model="Keyword"></database-model-col>
            <database-model-col model="PropertyType"></database-model-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ $t('Planning&Shopping') }}</h2>
            </v-col>
        </v-row>
        <v-row dense>
            <database-model-col model="Supermarket"></database-model-col>
            <database-model-col model="SupermarketCategory"></database-model-col>
            <database-model-col model="MealType"></database-model-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ $t('Miscellaneous') }}</h2>
            </v-col>
        </v-row>
        <v-row dense>
            <database-model-col model="UnitConversion"></database-model-col>
            <database-model-col model="Automation"></database-model-col>
            <database-model-col model="UserFile"></database-model-col>
            <database-model-col model="CustomFilter"></database-model-col>
            <database-model-col model="CookLog"></database-model-col>
            <database-model-col model="ViewLog"></database-model-col>
            
             <database-link-col :to="{name: 'IngredientEditorPage'}"
                               prepend-icon="fa-solid fa-table-list"
                               :title="$t('Ingredient Editor')"
                               :subtitle="$t('IngredientEditorHelp')">

            </database-link-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ $t('External') }}</h2>
            </v-col>
        </v-row>
        <v-row dense>
            <database-model-col model="Sync"></database-model-col>
            <database-model-col model="SyncLog"></database-model-col>
            <database-model-col model="Storage"></database-model-col>
            <database-model-col model="RecipeImport"></database-model-col>
            <database-model-col model="ConnectorConfig"></database-model-col>
        </v-row>

    </v-container>

</template>

<script setup lang="ts">

import DatabaseModelCol from "@/components/display/DatabaseModelCol.vue";
import DatabaseLinkCol from "@/components/display/DatabaseLinkCol.vue";
</script>


<style scoped>

</style>