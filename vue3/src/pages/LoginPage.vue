<template>
    <v-container>
        <v-card style="max-width: 400px; margin: auto;">
            <v-card-title>{{ $t('Login') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>

                <v-form>
                    <v-alert class="mb-4" v-if="generalError" type="warning">{{ generalError }}</v-alert>

                    <v-text-field :label="$t('Username')" autofocus v-model="username" :disabled="loading" :error-messages="usernameError" :error="!!usernameError"/>
                    <v-text-field :label="$t('Password')" type="password" v-model="password" :disabled="loading" @keyup.enter="login()" :error-messages="passwordError" :error="!!passwordError"/>

                </v-form>
                <!-- TODO email send screen -->

                <!-- TODO reset screen when GET param is present -->

            </v-card-text>
            <v-card-actions>
                <v-btn type="submit" :to="{name: 'SignUpPage'}" variant="elevated" :loading="loading" color="info">{{ $t('SignUp') }} TODO</v-btn>
                <v-btn type="submit" @click="login()" variant="elevated" :loading="loading" color="primary">{{ $t('Login') }}</v-btn>
            </v-card-actions>
        </v-card>
        <div style="max-width: 400px; margin: auto;" class="text-center mt-2">
            <router-link :to="{name: 'PasswordResetPage'}">Passwort vergessen? TODO</router-link>
        </div>
    </v-container>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {AuthenticationAccountApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useI18n} from "vue-i18n";

const router = useRouter()
const {t} = useI18n()

const loading = ref(false)
const username = ref('')
const password = ref('')

const generalError = ref('')
const passwordError = ref('')
const usernameError = ref('')

const next = useRouter().currentRoute.value.query.next

function login() {
    let accountApi = new AuthenticationAccountApi()
    loading.value = true

    generalError.value = ''
    passwordError.value = ''
    usernameError.value = ''

    accountApi.allauthClientV1AuthLoginPost({client: 'browser', login: {username: username.value, password: password.value}}).then(r => {
        useUserPreferenceStore().init().then(r => {
            if (next && typeof next === 'string') {
                router.push(next)
            } else {
                router.push({name: 'StartPage'})
            }
        })

    }).catch(err => {
        try {
            err.response.json().then(responseJson => {
                if (responseJson.status == 429) {
                    generalError.value = t('RateLimitHelp')
                } else {
                    responseJson.errors.forEach(error => {
                        if (error.param == 'password') {
                            passwordError.value = error.message
                        } else if (error.param == 'username') {
                            usernameError.value = error.message
                        } else {
                            generalError.value += error.message + ' (' + error.param + ')\n'
                        }
                    })

                }
            })
        } catch (e) {
            //useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }

    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>