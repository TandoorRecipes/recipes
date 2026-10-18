<template>

    <v-container style="max-width: 450px; margin: auto;">
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.push({name: 'LoginPage'})" prepend-icon="fa-solid fa-arrow-left">{{ $t('Login') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-card :loading="loading">
                    <v-card-title>{{ $t('Login') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text v-if="!loading">
                        {{ $t('GenericSocialSignupError') }}

                        <!--                        <v-btn @click="authStatus">{{ $t('CheckAuthenticationStatus') }}</v-btn>-->

                    </v-card-text>

                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script setup lang="ts">

import {AuthenticationCurrentSessionApi, AuthenticationProvidersApi} from "@/authapi";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()

const loading = ref(true)

onMounted(() => {
    authStatus()
})

function authStatus() {

    /**
     * the correct way seems to be to check the flows returned by the following api call
     * depending on the flows redirect to login or a form that gets pre filled with the provider data
     * and requires the user to perform a signup. In that signup errors (like duplicate usernames/emails) would be handled
     * properly and resovled
     *
     * i currently do not want to implement all the edgecases here, so providers must be configured to provide
     * all necessary fields (username/email) and if the account exists the user just needs to try something else
     * or you need to acitivate auto linking (attention, security implications)
     */

    let authenticationCurrentSessionApi = new AuthenticationCurrentSessionApi();
    authenticationCurrentSessionApi.allauthClientV1AuthSessionGet({client: "browser"}).then((response) => {
        if (response.meta.isAuthenticated) {
            router.push({name: 'StartPage'})
        }
    }).catch((error) => {
        console.log(error);
    }).finally(() => {
        setTimeout(() => {
            loading.value = false
        }, 400)
    })


}

</script>


<style scoped>

</style>