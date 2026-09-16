<template>
    <v-container>
        <v-card style="max-width: 400px; margin: auto;">
            <v-card-title>{{ $t('SignUp') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>

                <v-form v-if="!awaitingEmailConfirmation">
                    <v-alert class="mb-4" v-if="generalError" type="warning">{{ generalError }}</v-alert>
                    <v-text-field :label="$t('Email')" v-model="email" :error-messages="emailError" :error="!!emailError"></v-text-field>
                    <v-text-field :label="$t('Username')" v-model="username" :error-messages="usernameError" :error="!!usernameError" @change="usernameManuallyChanged = true"></v-text-field>
                </v-form>

                <span v-if="awaitingEmailConfirmation">
                    {{$t('PleaseConfirmMail')}}
                </span>
            </v-card-text>
            <v-card-actions>
                <v-btn type="submit" variant="elevated" :loading="loading" color="primary" @click="createAccount()" v-if="!awaitingEmailConfirmation">{{ $t('SignUp') }}</v-btn>
            </v-card-actions>
        </v-card>

    </v-container>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {AuthenticationAccountApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";

const router = useRouter()
const {t} = useI18n()

const loading = ref(false)

const email = ref('')
const username = ref('')
const usernameManuallyChanged = ref(false)

const generalError = ref('')
const emailError = ref('')
const usernameError = ref('')

const awaitingEmailConfirmation = ref(false)

watch(() => email.value, (newValue) => {
    if (!usernameManuallyChanged.value && email.value.length > 0 && email.value.split('@').length > 0) {
        username.value = email.value.split('@')[0]
    }
})

function createAccount() {
    let authenticationAccountApi = new AuthenticationAccountApi()
    loading.value = true

    authenticationAccountApi.allauthClientV1AuthSignupPost({client: 'browser', signup: {email: email.value, username: username.value, password: ''}}).then(r => {
        console.log(r)
    }).catch(err => {
        try {
            err.response.json().then(responseJson => {
                if (responseJson.status == 429) {
                    generalError.value = t('RateLimitHelp')
                } else  if (responseJson.status == 401){
                    if(responseJson.meta.is_authenticated){
                        router.push({name: 'StartPage'})
                    } else {
                        awaitingEmailConfirmation.value = true
                    }
                } else {
                    responseJson.errors.forEach(error => {
                        if (error.param == 'email') {
                            email.value = error.message
                        } else if (error.param == 'username') {
                            usernameError.value = error.message
                        } else {
                            generalError.value += error.message + ' (' + error.param + ')\n'
                        }
                    })

                }
            })
        } catch (e) {
            console.error(e)
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        }
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>