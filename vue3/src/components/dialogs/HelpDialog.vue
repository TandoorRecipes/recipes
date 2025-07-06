<template>

    <v-dialog height="70vh" activator="parent">
        <v-card>
            <v-closable-card-title v-model="dialog" :title="$t('Help')" icon="fa-solid fa-question"></v-closable-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
                <v-layout style="height: 100%">
                    <v-navigation-drawer style="height: calc(100% + 0px)">
                        <v-list-item>
                            <v-text-field density="compact" variant="outlined" class="pt-2 pb-2" :label="$t('Search')" hide-details clearable ></v-text-field>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item link title="Start" @click="window = 'start'"></v-list-item>
                        <v-list-item link title="Test" @click="window = 'test'"></v-list-item>

                    </v-navigation-drawer>

                    <v-main>
                        <v-container>
                            <v-window v-model="window">
                                <v-window-item value="start">
                                    Start
                                </v-window-item>
                                <v-window-item value="test">
                                    Test
                                </v-window-item>
                            </v-window>
                        </v-container>
                    </v-main>
                </v-layout>

            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref} from "vue";

const dialog = ref(false)
const window = ref('start')

</script>


<style scoped>

</style>