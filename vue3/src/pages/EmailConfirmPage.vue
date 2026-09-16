<template>
    <v-container style="max-width: 450px; margin: auto;">


        <v-row v-if="!invalidToken">
            <v-col>
                <v-card>
                    <v-card-title>
                        {{ $t('EmailConfirmation') }}
                        <v-progress-circular indeterminate color="primary" class="float-right" v-if="loading"></v-progress-circular>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <p>
                            {{ $t('EmailConfirmWait') }}
                        </p>

                        <v-alert class="mb-4" type="warning" v-if="generalError">{{ generalError }}</v-alert>
                    </v-card-text>
                    <v-card-actions v-if="!loading">
                        <v-btn variant="elevated" color="info" :to="{name: 'PasswordResetPage'}">{{ $t('PasswordReset') }}</v-btn>
                        <v-btn variant="elevated" color="primary" :to="{name: 'LoginPage'}">{{ $t('Login') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="invalidToken">
            <v-col>
                <v-card>
                    <v-card-title>
                        {{ $t('EmailConfirmation') }}

                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-alert class="mb-4" type="warning">{{ invalidToken }}</v-alert>
                        <p>
                            {{ $t('EmailConfirmFail1') }}
                        </p>
                        <p>
                            {{ $t('EmailConfirmFail2') }}</p>
                        <p>
                            {{ $t('EmailConfirmFail3') }}

                        </p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn variant="elevated" color="info" :to="{name: 'PasswordResetPage'}">{{ $t('PasswordReset') }}</v-btn>
                        <v-btn variant="elevated" color="primary" :to="{name: 'LoginPage'}">{{ $t('Login') }}</v-btn>
                    </v-card-actions>
                </v-card>

            </v-col>
        </v-row>


    </v-container>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {AuthenticationAccountApi} from "@/authapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useRouteQuery} from "@vueuse/router";

const router = useRouter()
const {t} = useI18n()

const invalidToken = ref('')
const generalError = ref('')

const loading = ref(false)

const key = useRouteQuery("key")

const email = ref('')
const emailError = ref('')

onMounted(() => {
    confirmEmail()
})

function confirmEmail() {
    let authenticationAccountApi = new AuthenticationAccountApi()

    loading.value = true
    authenticationAccountApi.allauthClientV1AuthEmailVerifyPost({client: "browser", verifyEmail: {key: key.value}}).then(r => {
        if (r.meta.isAuthenticated) {
            // this does not trigger because the response status is 401 and triggers the error block
            // leaving this in in case there is any case I missed
            router.push({name: 'StartPage'})
        } else {
            router.push({name: 'LoginPage'})
        }
    }).catch(err => {
        try {
            err.response.json().then(responseJson => {
                if (responseJson.status == 429) {
                    useMessageStore().addPreparedMessage(PreparedMessage.RATE_LIMIT)
                } else if (responseJson.status == 401) {
                    if (responseJson.meta.isAuthenticated) {
                        router.push({name: 'StartPage'})
                    } else {
                        router.push({name: 'LoginPage'})
                    }
                } else if (responseJson.status == 400 && responseJson.errors[0].code == "invalid_or_expired_key") {
                    invalidToken.value = responseJson.errors[0].message
                } else if (responseJson.status == 400) {
                    try {
                        responseJson.errors.forEach(error => {
                            generalError.value += error.message + "\n"
                        })
                    } catch (e) {
                        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                    }

                } else {
                    useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                }
            })
        } catch (e) {
            console.error(e)
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }

    }).finally(() => {
        loading.value = false
    })
}

// TODO
function resendConfirmationLink() {
    let authenticationAccountApi = new AuthenticationAccountApi()

    authenticationAccountApi.allauthClientV1AuthEmailVerifyResendPost({client: "browser"}).then(r => {
        console.log(r)
    }).catch(err => {
        console.error(err)
    })
}

</script>

<style scoped>

</style>