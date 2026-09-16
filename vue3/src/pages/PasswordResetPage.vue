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

        <v-row v-if="!key">
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('PasswordReset') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-form :disabled="loading">
                            <v-text-field v-model="email" :label="$t('Email')" required></v-text-field>
                        </v-form>

                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" variant="elevated" :loading="loading" color="primary" @click="requestResetLink()">{{ $t('Send') }}</v-btn>

                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="key">
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('PasswordReset') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-form :disabled="loading">
                            <v-text-field type="password" :label="$t('NewPassword')" v-model="newPassword1"></v-text-field>
                            <v-text-field type="password" :label="$t('RepeatNewPassword')" v-model="newPassword2" @keydown.enter="resetPassword()"></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" variant="elevated" :loading="loading" color="save" @click="resetPassword()">{{ $t('PasswordReset') }}</v-btn>

                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <div style="max-width: 400px; margin: auto;" class="text-center mt-2">
            <a href="">Schon Account? Login! TODO</a>
        </div>
    </v-container>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {AuthenticationPasswordResetApi} from "@/authapi";
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useRouteQuery} from "@vueuse/router";
import {load} from "esbuild-register/dist/loader";

const router = useRouter()
const {t} = useI18n()

const loading = ref(false)

const key = useRouteQuery("key")

let newPassword1 = ref('')
let newPassword2 = ref('')

const email = ref('')

function requestResetLink() {
    let authenticationPasswordResetApi = new AuthenticationPasswordResetApi()
    loading.value = true

    authenticationPasswordResetApi.allauthClientV1AuthPasswordRequestPost({client: "browser", requestPassword: {email: email.value}}).then(r => {
        console.log(r)
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    }).catch(err => {
        err.response.json().then(responseJson => {
            if (responseJson.status == 429) {
                useMessageStore().addPreparedMessage(PreparedMessage.RATE_LIMIT)
            } else {
                let message = ''
                responseJson.errors.forEach(error => {
                    message += error.message + ' (' + error.param + ')\n'
                })
                useMessageStore().addMessage(MessageType.ERROR, {title: t('UPDATE_ERROR'), text: message}, 7000, responseJson)
            }
        })
    }).finally(() => {
        loading.value = false
    })
}

function resetPassword() {
    const authenticationPasswordResetApi = new AuthenticationPasswordResetApi()

    if (newPassword1.value == newPassword2.value) {
        loading.value = true

        authenticationPasswordResetApi.allauthClientV1AuthPasswordResetPost({client: "browser", resetPassword: {key: key.value, password: newPassword1.value}}).then(r => {
            if(r.meta.isAuthenticated){
                // this does not trigger because the response status is 401 and triggers the error block
                // leaving this in in case there is any case I missed
                router.push({name: 'StartPage'})
            } else {
                router.push({name: 'LoginPage'})
            }
        }).catch(err => {
            if(err.response.status == 401){
                // 401 indicates successfull reset but no automatic login configured
                router.push({name: 'LoginPage'})
            } else {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }
        }).finally(() => {
            loading.value = false
        })
    } else {
        useMessageStore().addPreparedMessage(PreparedMessage.PASSWORDS_DONT_MATCH)
    }
}
</script>

<style scoped>

</style>