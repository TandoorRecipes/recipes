<template>
    <v-form>
        <p class="text-h6">{{ $t('Profile') }}</p>
        <v-divider class="mb-3"></v-divider>

        <thank-you-note></thank-you-note>

        <v-text-field class="mt-3" :label="$t('Username')" v-model="user.username" disabled :hint="$t('theUsernameCannotBeChanged')" persistent-hint></v-text-field>

        <v-label class="mt-3">{{ $t('Avatar') }}</v-label>
        <div class="d-flex align-center ga-4 mb-3">
            <v-avatar size="64" color="primary">
                <v-img v-if="userPrefs.userSettings.image?.preview" :src="userPrefs.userSettings.image.preview" :position="cropPosition(userPrefs.userSettings.image?.cropData)" />
                <span v-else class="text-h5">{{ userPrefs.userSettings.user.displayName?.charAt(0) }}</span>
            </v-avatar>
            <div class="flex-grow-1">
                <user-file-field v-model="userPrefs.userSettings.image" :label="$t('Avatar')" />
            </div>
        </div>

        <v-text-field :label="$t('First_name')" v-model="user.firstName"></v-text-field>
        <v-text-field :label="$t('Last_name')" v-model="user.lastName"></v-text-field>
        <v-btn color="success" prepend-icon="$save" @click="save()">{{ $t('Save') }}</v-btn>

        <p class="text-h6 mt-3">{{ $t('Account') }}</p>
        <v-divider class="mb-3"></v-divider>
        <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/email/')" target="_blank">{{ $t('Manage_Emails') }}</v-btn>
        <br/>
        <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/password/change/')" target="_blank">{{ $t('Change_Password') }}</v-btn>
        <br/>
        <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/social/connections/')" target="_blank">{{ $t('Social_Authentication') }}</v-btn>
        <br/>
        <v-btn color="primary" class="mt-1" :href="getDjangoUrl('accounts/sessions/')" target="_blank">{{ $t('Manage_Sessions') }}</v-btn>
        <br/>

        <p class="text-h6 mt-3">{{ $t('DeviceSettings') }}</p>
        <p class="text-disabled">{{ $t('DeviceSettingsHelp') }}</p>

        <v-checkbox v-model="userPrefs.deviceSettings.start_showMealPlan" :label="$t('ShowMealPlanOnStartPage')"></v-checkbox>

        <v-btn @click="userPrefs.resetDeviceSettings()" color="warning">{{ $t('Reset') }}</v-btn>  <br/>
        <v-btn @click="userPrefs.deviceSettings.general_closedHelpAlerts = []" color="warning" class="mt-1">{{ $t('ResetHelp') }}</v-btn> <br/>
        <v-btn color="info" class="mt-1">
            <message-list-dialog></message-list-dialog>
            {{ $t('Messages') }}
        </v-btn>

    </v-form>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, User} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {cropPosition} from "@/utils/image_crop";
import ThankYouNote from "@/components/display/ThankYouNote.vue";
import MessageListDialog from "@/components/dialogs/MessageListDialog.vue";
import UserFileField from "@/components/inputs/UserFileField.vue";

const {getDjangoUrl} = useDjangoUrls()
const userPrefs = useUserPreferenceStore()

const user = ref({} as User)

onMounted(() => {
    let api = new ApiApi()

    api.apiUserRetrieve({id: userPrefs.userSettings.user.id}).then(r => {
        user.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

function save() {
    let api = new ApiApi()
    api.apiUserPartialUpdate({id: user.value.id!, patchedUser: user.value}).then(r => {
        user.value = r
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>