<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card prepend-icon="fa-solid fa-folder-tree" :title="$t('OpenData')">
                    <v-card-text>
                        {{ $t('OpenDataHelp') }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn href="https://github.com/TandoorRecipes/open-tandoor-data" target="_blank">GitHub</v-btn>
                        <v-btn href="https://discord.gg/RhzBrfWgtp" target="_blank">Discord</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>Data</h2>
            </v-col>
        </v-row>
        <v-row dense>
            <database-model-col model="OpenDataFood"></database-model-col>
            <database-model-col model="OpenDataUnit"></database-model-col>
            <database-model-col model="OpenDataConversion"></database-model-col>
            <database-model-col model="OpenDataCategory"></database-model-col>
            <database-model-col model="OpenDataProperty"></database-model-col>
            <database-model-col model="OpenDataVersion"></database-model-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ $t('Help') }}</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Quickstart</v-card-title>
                    <v-card-text>
                        <ul>
                            <li>Create and Edit data as you are used to with tandoor</li>
                            <li>Many foods can be found in the <a href="https://fdc.nal.usda.gov/index.html" target="_blank" rel="noreferrer nofollow">FDC Database</a>. Copy the
                                FDC ID to quickly import it in the
                                food editor. If appropriate for the food create a conversion (some foods will come with a measurement comment).
                            </li>
                            <li>You can only edit foods, stores and conversions you created yourself, ask on discord to get <b>verified</b> so you can edit everything.</li>
                            <li>If unsure about something ask others for their opinion on discord. Also take a look at this <a
                                href="https://github.com/TandoorRecipes/open-tandoor-data/wiki/Data-Considerations-and-Standards" target="_blank"> collection of examples</a>.
                            </li>
                            <li>Use the <code>comment</code> field in each object to add notes for other people reading or contributing.</li>
                        </ul>
                    </v-card-text>
                </v-card>

                <v-card class="mt-2">
                    <v-card-title>
                        Versions
                    </v-card-title>
                    <v-card-text>
                        <ul>
                            <li>Each object has a version</li>
                            <li>The <code>base</code> version contains data valid around the world and is always in english</li>
                            <li>All objects of specific versions are in their respective language</li>
                        </ul>
                    </v-card-text>
                </v-card>

                <v-card class="mt-2">
                    <v-card-title>
                        Translations
                    </v-card-title>
                    <v-card-text>
                        Data for a select language is only available for translated entries.
                        To help translate head over to the Tandoor Translation Page <a href="https://translate.tandoor.dev/projects/tandoor-open-data/" target="_blank">here</a>.
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>Leaderboards</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                WIP
            </v-col>
        </v-row>

    </v-container>


</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import DatabaseModelCol from "@/components/display/DatabaseModelCol.vue";

onMounted(() => {

})

</script>


<style scoped>
/**
 vuetify removes all margins and paddings which break layout, re-add them by reverting vuetify change
 */
p, ol, ul, li {
    padding: revert;
    margin: revert;
}
</style>