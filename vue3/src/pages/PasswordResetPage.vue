<template>
    <v-container>
        <v-card style="max-width: 400px; margin: auto;">
            <v-card-title>{{ $t('PasswordReset') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>

                <v-form>

                    <v-text-field v-model="email" :label="$t('Email')" required></v-text-field>

                </v-form>
            </v-card-text>
            <v-card-actions>

                <v-btn type="submit" variant="elevated" :loading="loading" color="primary" @click="createAccount()">{{ $t('Save') }}</v-btn>
            </v-card-actions>
        </v-card>
        <div style="max-width: 400px; margin: auto;" class="text-center mt-2">
            <a href="">Schon Account? Login! TODO</a>
        </div>
    </v-container>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {AuthenticationAccountApi, AuthenticationPasswordResetApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const loading = ref(false)


const password = ref('')

const email = ref('')

function createAccount() {
    let authenticationPasswordResetApi = new AuthenticationPasswordResetApi()
    loading.value = true

    authenticationPasswordResetApi.allauthClientV1AuthPasswordRequestPost({client: "browser", requestPassword: {email: email.value}}).then(r => {
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