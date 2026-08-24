<template>

    <p class="text-h6 mt-3">{{ $t('Account') }}</p>
    <v-divider class="mb-3"></v-divider>
    <v-form>
        <v-text-field type="password" :label="$t('CurrentPassword')" v-model="currentPassword"></v-text-field>
        <v-text-field type="password" :label="$t('NewPassword')" v-model="newPassword1"></v-text-field>
        <v-text-field type="password" :label="$t('RepeatNewPassword')" v-model="newPassword2"></v-text-field>
        <v-btn prepend-icon="$save" color="save" @click="changePassword()">{{ $t('Save') }}</v-btn>
    </v-form>

    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/email/')" target="_blank">{{ $t('Manage_Emails') }}</v-btn>
    <br/>
    <br/>
    <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/social/connections/')" target="_blank">{{ $t('Social_Authentication') }}</v-btn>
    <br/>
    <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/sessions/')" target="_blank">{{ $t('Manage_Sessions') }}</v-btn>
    <br/>

</template>

<script setup lang="ts">

import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";
import {AccountPasswordApi} from "@/authapi";
import {ref} from "vue";
import {MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";

const {getDjangoUrl} = useDjangoUrls()
const {t} = useI18n()

let currentPassword = ref('')
let newPassword1 = ref('')
let newPassword2 = ref('')

function changePassword() {
    const accountPasswordApi = new AccountPasswordApi()

    if (newPassword1.value == newPassword2.value) {
        accountPasswordApi.allauthClientV1AccountPasswordChangePost({
            client: 'browser',
            allauthClientV1AccountPasswordChangePostRequest: {currentPassword: currentPassword.value, newPassword: newPassword1.value}
        }).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            currentPassword.value = ''
            newPassword1.value = ''
            newPassword2.value = ''
        }).catch(err => {
            err.response.json().then(responseJson => {
                if(responseJson.status == 429){
                    useMessageStore().addPreparedMessage(PreparedMessage.RATE_LIMIT)
                } else {
                    let message = ''
                    responseJson.errors.forEach(error => {
                        message += error.message + ' (' + error.param + ')\n'
                    })
                    useMessageStore().addMessage(MessageType.ERROR, {title:t('UPDATE_ERROR'), text: message}, 7000, responseJson)
                }
            })

        })
    }
}

</script>

<style scoped>

</style>