<template>
    <v-container>
        <v-card style="max-width: 400px; margin: auto;">
            <v-card-title>{{ $t('Login') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>

                <v-form>
                    <v-text-field :label="$t('Username')" autofocus v-model="username" :disabled="loading"/>
                    <v-text-field :label="$t('Password')" type="password" v-model="password" :disabled="loading" @keyup.enter="login()"/>

                    <a href="">Passwort vergessen? TODO</a>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn type="submit" @click="login()" variant="elevated" :loading="loading" color="primary">{{ $t('Login') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {AuthenticationAccountApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const router = useRouter()

const loading = ref(false)
const username = ref('')
const password = ref('')

const next = useRouter().currentRoute.value.query.next

function login() {
    let accountApi = new AuthenticationAccountApi()
    loading.value = true

    accountApi.allauthClientV1AuthLoginPost({client: 'browser', login: {username: username.value, password: password.value}}).then(r => {
        useUserPreferenceStore().init().then(r => {
            if(next && typeof next === 'string'){
                router.push(next)
            } else {
                router.push({name: 'StartPage'})
            }
        })

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>