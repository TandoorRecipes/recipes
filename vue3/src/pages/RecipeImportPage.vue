<template>
    <v-container>
        <v-row>
            <v-col>

                <v-stepper v-model="stepper">
                    <v-stepper-header>
                        <v-stepper-item :title="$t('Import')" :value="1"></v-stepper-item>
                        <v-divider></v-divider>
                        <v-stepper-item :title="$t('Keywords')" :value="2"></v-stepper-item>
                        <v-divider></v-divider>
                        <v-stepper-item :title="$t('Steps')" :value="3"></v-stepper-item>
                        <v-divider></v-divider>
                        <v-stepper-item :title="$t('Save')" :value="4"></v-stepper-item>
                    </v-stepper-header>

                    <v-stepper-window>
                        <v-stepper-window-item :value="1">
                            test1
                        </v-stepper-window-item>
                        <v-stepper-window-item :value="2">
                            test2
                        </v-stepper-window-item>
                        <v-stepper-window-item :value="3">
                            test3
                        </v-stepper-window-item>
                        <v-stepper-window-item :value="4">
                            test4
                        </v-stepper-window-item>
                    </v-stepper-window>

                    <v-stepper-actions >

                    </v-stepper-actions>
                </v-stepper>


            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>

import {ref} from "vue";

const stepper = ref(0)

</script>

<style scoped>

</style>