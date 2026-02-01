<template>
    <v-dialog max-width="600px" v-model="dialog">
        <template #activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="fa-solid fa-calendar-days" link>
                {{ $t('Calendar') }}
            </v-list-item>
        </template>
        <v-card :loading="loading">
            <v-closable-card-title v-model="dialog" :title="$t('Calendar')" icon="fa-solid fa-calendar-days"></v-closable-card-title>

            <v-card-text>
                <p class="mb-4">{{ $t('CalendarIcsHelp') }}</p>
                <v-text-field
                    v-model="icalUrl"
                    :label="$t('Calendar_URL')"
                    readonly
                >
                    <template #append-inner>
                        <btn-copy icon variant="plain" color="" :copyValue="icalUrl"></btn-copy>
                    </template>
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn prepend-icon="$download" :href="icalUrl">{{$t('Download')}}</v-btn>
                <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {AccessToken, ApiApi} from "@/openapi";

import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {DateTime} from "luxon";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";

const {getDjangoUrl} = useDjangoUrls()

const dialog = ref(false);
const loading = ref(false);

const apiToken = ref('')

const icalUrl = computed(() => {
    return getDjangoUrl('/api/meal-plan/ical/') + "?access_token=" + apiToken.value
})

onMounted(() => {
    loadOrCreateToken()
})

/**
 * load or create an AccessToken with the mealplan scope
 */
function loadOrCreateToken() {
    let api = new ApiApi()
    api.apiAccessTokenList().then(r => {
        r.forEach(token => {
            if (token.scope == 'mealplan') {
                apiToken.value = token.token
            }
        })

        if (apiToken.value == '') {
            api.apiAccessTokenCreate({accessToken: {scope: 'mealplan', expires: DateTime.now().plus({year: 100}).toJSDate()} as AccessToken}).then(r => {
                apiToken.value = r.token
            })
        }
    })
}

</script>
