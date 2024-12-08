<template>
    <v-form>
        <p class="text-h6">{{ $t('Profile') }}</p>
        <v-divider class="mb-3"></v-divider>
        <v-text-field :label="$t('Username')" v-model="user.username" disabled :hint="$t('theUsernameCannotBeChanged')" persistent-hint></v-text-field>

        <!--                    <v-label>Avatar</v-label><br/>-->
        <!--                    <v-avatar class="mt-3 mb-3" style="height: 10vh; width: 10vh" color="info">V</v-avatar> Feature coming in a future Version of Tandoor.-->

        <v-text-field :label="$t('First_name')" v-model="user.firstName"></v-text-field>
        <v-text-field :label="$t('Last_name')" v-model="user.lastName"></v-text-field>
        <v-btn color="success" prepend-icon="$save" @click="save()">{{ $t('Save') }}</v-btn>

        <p class="text-h6 mt-3">{{ $t('Account') }}</p>
        <v-divider class="mb-3"></v-divider>
        <v-btn color="primary" class="mt-1" href="/accounts/email/" target="_blank">{{ $t('Manage_Emails') }}</v-btn>
        <br/>
        <v-btn color="primary" class="mt-1" href="/accounts/password/change/" target="_blank">{{ $t('Change_Password') }}</v-btn>
        <br/>
        <v-btn color="primary" class="mt-1" href="/accounts/social/connections/" target="_blank">{{ $t('Social_Authentication') }}</v-btn>
        <br/>

        <p class="text-h6 mt-3">{{ $t('DeviceSettings') }}</p>
        <p class="text-disabled">{{$t('DeviceSettingsHelp')}}</p>

        <v-btn @click="useUserPreferenceStore().resetDeviceSettings()">{{$t('Reset')}}</v-btn>

    </v-form>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, User} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";


const user = ref({} as User)

onMounted(() => {
    let api = new ApiApi()

    api.apiUserRetrieve({id: useUserPreferenceStore().userSettings.user.id}).then(r => {
        user.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

function save(){
    let api = new ApiApi()
    api.apiUserPartialUpdate({id: user.value.id!, patchedUser: user.value}).then(r =>  {
        user.value = r
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>