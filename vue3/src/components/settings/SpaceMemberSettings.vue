<template>
    <v-form>
        <p class="text-h6">{{ $t('SpaceMembers') }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-data-table :items="spaceUserSpaces" :headers="userTableHeaders" density="compact" :hide-default-footer="spaceUserSpaces.length < 10">
            <template #item.groups="{item}">
                <span v-for="g in item.groups">{{ g.name }}&nbsp;</span>
            </template>

            <template #item.edit="{item}">
                <v-btn icon="$edit" color="edit" size="small" variant="tonal" @click="spaceUserEditDialogUserSpace = Object.assign({}, item); spaceUserEditDialogState = true"></v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="spaceUserEditDialogState" max-width="400px">
            <v-card>
                <v-card-title>{{ $t('User') }}: {{ spaceUserEditDialogUserSpace.user.displayName }}</v-card-title>
                <v-card-subtitle>{{ $t('Created') }} {{ DateTime.fromJSDate(spaceUserEditDialogUserSpace.createdAt).toLocaleString(DateTime.DATETIME_MED) }}</v-card-subtitle>
                <v-card-text>
                    <v-form>
                        <v-select :items="groups" item-value="id" item-title="name" v-model="spaceUserEditDialogUserSpace.groups" multiple return-object></v-select>
                    </v-form>
                    <div v-if="spaceUserEditDialogUserSpace.internalNote">
                        <p>{{ $t('Note') }}</p>
                        <span>{{ spaceUserEditDialogUserSpace.internalNote }}</span>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="cancel" @click="spaceUserEditDialogState = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="save" prepend-icon="$save" @click="updateUserSpace(spaceUserEditDialogUserSpace)">{{ $t('Save') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <p class="text-h6 mt-3">{{ $t('Invites') }}
            <v-btn size="small" class="float-right" prepend-icon="$create" color="create" @click="inviteLinkDialogObject = {} as InviteLink;inviteLinkDialogState = true">{{ $t('New') }}</v-btn>
        </p>
        <v-divider class="mb-3"></v-divider>

        <v-data-table :items="spaceInviteLinks" :headers="inviteTableHeaders" density="compact" :hide-default-footer="spaceInviteLinks.length < 10">
            <template #item.edit="{item}">
                <v-btn icon="$copy" color="success" size="small" variant="tonal" @click="copyInviteLink(item)"></v-btn>
                <v-btn icon="$edit" color="edit" size="small" variant="tonal" @click="inviteLinkDialogObject = Object.assign({}, item); inviteLinkDialogState = true"></v-btn>
            </template>

        </v-data-table>

        <v-dialog v-model="inviteLinkDialogState" max-width="400px">
            <v-card>
                <v-card-title>{{ $t('Invites') }}</v-card-title>
                <v-card-text>
                    <v-form>
                        <v-text-field :label="$t('Email')" v-model="inviteLinkDialogObject.email"></v-text-field>
                        <v-select :label="$t('Role')" :items="groups" item-value="id" item-title="name" return-object v-model="inviteLinkDialogObject.group"></v-select>
                        <v-date-input :label="$t('Valid Until')" v-model="inviteLinkDialogObject.validUntil"></v-date-input>
                        <v-textarea :label="$t('Note')" v-model="inviteLinkDialogObject.internalNote"></v-textarea>
                        <v-checkbox :label="$t('Reusable')" v-model="inviteLinkDialogObject.reusable"></v-checkbox>
                    </v-form>

                </v-card-text>
                <v-card-actions>
                    <v-btn color="cancel" @click="inviteLinkDialogState = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="save" prepend-icon="$save" @click="saveInviteLink(inviteLinkDialogObject)" :loading="inviteLinkDialogLoading">
                        <span v-if="inviteLinkDialogObject.id == undefined">{{ $t('Create') }}</span>
                        <span v-if="inviteLinkDialogObject.id != undefined">{{ $t('Update') }}</span>
                    </v-btn>
                    <v-btn color="delete" prepend-icon="$delete" @click="deleteInviteLink(inviteLinkDialogObject)" v-if="inviteLinkDialogObject.id != undefined">{{ $t('Delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-form>
</template>


<script setup lang="ts">


import {onMounted, ref} from "vue";
import {ApiApi, Group, InviteLink, UserSpace} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {DateTime} from "luxon";
import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {useClipboard} from "@vueuse/core"; //TODO remove once component is out of labs

const {t} = useI18n()

const spaceUserSpaces = ref([] as UserSpace[])
const spaceInviteLinks = ref([] as InviteLink[])
const groups = ref([] as Group[])

const spaceUserEditDialogState = ref(false)
const spaceUserEditDialogUserSpace = ref({} as UserSpace)

const inviteLinkDialogState = ref(false)
const inviteLinkDialogObject = ref({} as InviteLink)
const inviteLinkDialogLoading = ref(false)

const userTableHeaders = [
    {title: t('Username'), key: 'user.username'},
    {title: t('Role'), key: 'groups'},
    {title: t('Edit'), key: 'edit', align: 'end'},
]

const inviteTableHeaders = [
    {title: 'ID', key: 'id'},
    {title: t('Email'), key: 'email'},
    {title: t('Role'), key: 'group.name'},
    {title: t('Edit'), key: 'edit', align: 'end'},
]

onMounted(() => {
    const api = new ApiApi()

    api.apiGroupList().then(r => {
        groups.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    api.apiUserSpaceList().then(r => {
        spaceUserSpaces.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    api.apiInviteLinkList().then(r => {
        spaceInviteLinks.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

/**
 * update user space in DB and list on client
 * @param userSpace UserSpace object to update
 */
function updateUserSpace(userSpace: UserSpace) {
    const api = new ApiApi()

    api.apiUserSpacePartialUpdate({id: userSpace.id!, patchedUserSpace: userSpace}).then(r => {
        spaceUserSpaces.value.splice(spaceUserSpaces.value.indexOf(userSpace), 1, r)
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

/**
 * create or update the invite link, refresh invite link list on client
 * @param inviteLink InviteLink object to update
 */
function saveInviteLink(inviteLink: InviteLink) {
    const api = new ApiApi()

    inviteLinkDialogLoading.value = true

    if (inviteLink.id == undefined) {
        api.apiInviteLinkCreate({inviteLink: inviteLink}).then(r => {
            inviteLinkDialogState.value = false
            spaceInviteLinks.value.push(r)
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        }).finally(() => {
            inviteLinkDialogLoading.value = false
        })
    } else {
        api.apiInviteLinkUpdate({inviteLink: inviteLink, id: inviteLink.id}).then(r => {
            inviteLinkDialogState.value = false
            spaceInviteLinks.value.splice(spaceInviteLinks.value.indexOf(inviteLink), 1, r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            inviteLinkDialogLoading.value = false
        })
    }

}

/**
 * delete invite link from database and client
 * @param inviteLink InviteLink object to delete
 */
function deleteInviteLink(inviteLink: InviteLink) {
    const api = new ApiApi()
    api.apiInviteLinkDestroy({id: inviteLink.id}).then(r => {
        inviteLinkDialogState.value = false
        spaceInviteLinks.value.splice(spaceInviteLinks.value.indexOf(inviteLink) - 1, 1)
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

/**
 * copy invite link with url to clipboard
 * @param inviteLink InviteLink object to copy
 */
function copyInviteLink(inviteLink: InviteLink) {
    const {copy} = useClipboard()
    copy(`${location.protocol}//${location.host}/invite/${inviteLink.uuid}`)
}

</script>

<style scoped>

</style>