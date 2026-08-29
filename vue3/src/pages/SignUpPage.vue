<template>
    <v-container>
        <v-card style="max-width: 400px; margin: auto;">
            <v-card-title>{{ $t('SignUp') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>

                <v-form>

                    <v-text-field :label="$t('Email')" v-model="email"></v-text-field>
                    <v-text-field :label="$t('Username')" v-model="username" @change="usernameManuallyChanged = true"></v-text-field>

                </v-form>
            </v-card-text>
            <v-card-actions>

                <v-btn type="submit" variant="elevated" :loading="loading" color="primary" @click="createAccount()">{{ $t('SignUp') }}</v-btn>
            </v-card-actions>
        </v-card>
        <div style="max-width: 400px; margin: auto;" class="text-center mt-2">
            <a href="">Schon Account? Login! TODO</a>
        </div>
    </v-container>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {AuthenticationAccountApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const loading = ref(false)

const email = ref('')
const username = ref('')
const usernameManuallyChanged = ref(false)

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
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>