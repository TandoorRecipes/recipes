<template>

    <p class="text-h6 mt-3">{{ $t('Account') }}</p>
    <v-divider class="mb-3"></v-divider>
    <v-row>
        <v-col>
            <v-text-field class="mt-3" :label="$t('Username')" v-model="user.username" disabled :hint="$t('theUsernameCannotBeChanged')" persistent-hint></v-text-field>
        </v-col>
    </v-row>

    <p class="text-h6 mt-3">{{ $t('Email') }}</p>
    <v-divider class="mb-3"></v-divider>
    <!-- email change -->
    <v-row>
        <v-col>

            <v-list>
                <v-list-item v-for="email in emailAddresses" :key="email.email">
                    {{ email.email }}
                    <template #append>
                        <v-chip v-if="email.primary">{{ $t('Primary') }}</v-chip>
                        <v-chip v-if="email.verified">{{ $t('Verified') }}</v-chip>
                        <v-chip v-if="!email.verified" color="warning" >{{ $t('NotVerified') }}</v-chip>
                        <!-- <v-btn @click="removeEmail(email.email)" icon="$delete"></v-btn>-->
                    </template>

                </v-list-item>
                <v-divider v-if="emailAddresses.length > 0"></v-divider>
                <v-list-item>
                    <v-text-field type="email" density="compact" v-model="newEmail" :hint="$t('EmailAddHint')" persistent-hint>
                        <template #append>
                            <v-btn icon="$create" color="create" @click="addEmail()"></v-btn>
                        </template>
                    </v-text-field>
                </v-list-item>
            </v-list>
        </v-col>
    </v-row>

    <p class="text-h6 mt-3">{{ $t('Password') }}</p>
    <v-divider class="mb-3"></v-divider>
    <!-- password change -->
    <v-row>
        <v-col>

            <v-form :disabled="loading">
                <v-text-field type="password" :label="$t('CurrentPassword')" v-model="currentPassword"></v-text-field>
                <v-text-field type="password" :label="$t('NewPassword')" v-model="newPassword1"></v-text-field>
                <v-text-field type="password" :label="$t('RepeatNewPassword')" v-model="newPassword2"></v-text-field>
                <v-btn prepend-icon="$save" color="save" @click="changePassword()" :loading="loading">{{ $t('Save') }}</v-btn>
            </v-form>
        </v-col>
    </v-row>


    <br/>
    <br/>
    <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/social/connections/')" target="_blank">{{ $t('Social_Authentication') }}</v-btn>
    <br/>
    <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/sessions/')" target="_blank">{{ $t('Manage_Sessions') }}</v-btn>
    <br/>

</template>

<script setup lang="ts">

import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";
import {AccountEmailApi, AccountPasswordApi, AuthenticationAccountApi, EmailAddress} from "@/authapi";
import {onMounted, ref} from "vue";
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import {ApiApi, User} from "@/openapi";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const {getDjangoUrl} = useDjangoUrls()
const {t} = useI18n()

let currentPassword = ref('')
let newPassword1 = ref('')
let newPassword2 = ref('')
let loading = ref(false)

const newEmail = ref('')

const user = ref({} as User)

const emailAddresses = ref([] as EmailAddress[])

onMounted(() => {

    loadUser()
    loadEmailAddresses()
})

/**
 * load all email addresses linked to the account
 */
function loadEmailAddresses() {
    let accountEmailApi = new AccountEmailApi()

    accountEmailApi.allauthClientV1AccountEmailGet({client: 'browser'}).then(r => {
        emailAddresses.value = r.data
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * load django user model to show basic information
 */
function loadUser() {
    let api = new ApiApi()

    api.apiUserRetrieve({id: useUserPreferenceStore().userSettings.user.id}).then(r => {
        user.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * add a new email to the account so it can be verified
 */
function addEmail() {
    let accountEmailApi = new AccountEmailApi()

    if (newEmail.value) {
        accountEmailApi.allauthClientV1AccountEmailPost({client: 'browser', allauthClientV1AccountEmailPutRequest: {email: newEmail.value}}).then(r => {
            newEmail.value = ''
            loadEmailAddresses()
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }
}

/**
 * remove an email linked to the account
 */
function removeEmail(email: string) {
    let accountEmailApi = new AccountEmailApi()

    accountEmailApi.allauthClientV1AccountEmailDelete({client: 'browser', allauthClientV1AccountEmailPutRequest: {email: email}}).then(r => {

        loadEmailAddresses()
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * re-send an email verification link to to the user
 * @param email
 */
function sendVerifyEmail(email: string) {
    let authenticationAccountApi = new AuthenticationAccountApi()
    authenticationAccountApi.allauthClientV1AuthEmailVerifyResendPost({client: 'browser', allauthClientV1AccountEmailResendPostRequest: {email: email}}).then(r => {
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * change the password for the current account
 */
function changePassword() {
    const accountPasswordApi = new AccountPasswordApi()

    if (newPassword1.value == newPassword2.value) {
        loading.value = true
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
    } else {
        useMessageStore().addPreparedMessage(PreparedMessage.PASSWORDS_DONT_MATCH)
    }
}

</script>

<style scoped>

</style>