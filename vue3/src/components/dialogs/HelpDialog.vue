<template>

    <v-dialog max-width="1200px" activator="parent" v-model="dialog">
        <v-card>
            <v-closable-card-title v-model="dialog" :title="$t('Help')" icon="fa-solid fa-question">
                <template #content>
                    <div class="d-flex align-center">

                        <v-btn variant="text" icon="fa-solid fa-bars" @click.stop="drawer = !drawer"></v-btn>
                        <span>{{ $t('Help') }}</span>
                    </div>
                </template>
            </v-closable-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
                <help-view v-model="drawer"></help-view>
            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref} from "vue";
import HelpView from "@/components/display/HelpView.vue";

const dialog = ref(false)

const drawer = ref(true)

</script>


<style scoped>

</style>