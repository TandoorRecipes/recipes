<template>
    <v-alert color="primary" variant="tonal" v-if="useUserPreferenceStore().serverSettings.hosted">
        <v-alert-title>
            <v-row>
                <v-col>
                    <v-avatar image="../../assets/logo_color.svg" class="me-2"></v-avatar>
                    {{ $t('ThankYou') }}!

                </v-col>
                <v-col>
                    <v-btn color="primary" class="float-right" href="https://tandoor.dev/manage" target="_blank">{{ $t('ManageSubscription') }}</v-btn>

                </v-col>
            </v-row>
        </v-alert-title>
        <p class="mt-2">{{ $t('ThanksTextHosted') }}</p>
    </v-alert>

    <v-alert color="primary" variant="tonal" v-if="!useUserPreferenceStore().serverSettings.hosted">
        <v-alert-title>
            <v-row>
                <v-col>
                    <v-avatar image="../../assets/logo_color.svg" class="me-2"></v-avatar>
                    {{ $t('ThankYou') }}!

                </v-col>
                <v-col>
                    <v-btn color="primary" class="float-right" href="https://github.com/sponsors/vabene1111" target="_blank"><i class="fa-brands fa-github"></i> GitHub Sponsors
                    </v-btn>

                </v-col>
            </v-row>
        </v-alert-title>
        <p class="mt-2">{{ $t('ThanksTextSelfhosted') }}</p>
    </v-alert>

</template>

<script setup lang="ts">

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
</script>


<style scoped>

</style>