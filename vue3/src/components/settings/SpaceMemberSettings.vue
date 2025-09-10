<template>
    <v-form>
        <p class="text-h6">{{ $t('SpaceMembers') }}</p>
        <v-divider></v-divider>
        <p class="text-subtitle-2">{{ $t('SpaceMemberHelp') }}</p>

        <v-data-table :items="spaceUserSpaces" :headers="userTableHeaders" density="compact" :hide-default-footer="spaceUserSpaces.length < 10" class="mt-3">
            <template #item.groups="{item}">
                <span v-for="g in item.groups">{{ g.name }}&nbsp;</span>
            </template>

            <template #item.edit="{item}">
                <v-btn color="edit" size="small" v-if="item.user.id != useUserPreferenceStore().activeSpace.createdBy.id">
                    <v-icon icon="$edit"></v-icon>
                    <model-edit-dialog model="UserSpace" :item="item" @delete="deleteUserSpace(item)" class="mt-2"></model-edit-dialog>
                </v-btn>
                <v-chip color="edit" v-else>{{ $t('Owner') }}</v-chip>
            </template>
        </v-data-table>

        <p class="text-h6 mt-3">{{ $t('Invites') }}
            <v-btn size="small" class="float-right" prepend-icon="$create" color="create">
                {{ $t('New') }}
                <model-edit-dialog model="InviteLink" @delete="deleteInviteLink" @create="item  => spaceInviteLinks.push(item)" class="mt-2"></model-edit-dialog>
            </v-btn>
        </p>
        <v-divider class="mb-3"></v-divider>

        <v-data-table :items="spaceInviteLinks" :headers="inviteTableHeaders" density="compact" :hide-default-footer="spaceInviteLinks.length < 10">
             <template #item.reusable="{item}">
                <v-icon icon="fa-solid fa-check" color="success" v-if="item.reusable"></v-icon>
                <v-icon icon="fa-solid fa-times" color="error" v-if="!item.reusable"></v-icon>
            </template>

            <template #item.edit="{item}">
                <btn-copy size="small" :copy-value="inviteLinkUrl(item)" class="me-1"></btn-copy>
                <v-btn color="edit" size="small">
                    <v-icon icon="$edit"></v-icon>
                    <model-edit-dialog model="InviteLink" :item="item" @delete="deleteInviteLink(item)" class="mt-2"></model-edit-dialog>
                </v-btn>
            </template>
        </v-data-table>
    </v-form>
</template>


<script setup lang="ts">


import {onMounted, ref} from "vue";
import {ApiApi, InviteLink, UserSpace} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";

const {t} = useI18n()

const spaceUserSpaces = ref([] as UserSpace[])
const spaceInviteLinks = ref([] as InviteLink[])

const userTableHeaders = [
    {title: t('Username'), key: 'user.username'},
    {title: t('Role'), key: 'groups'},
    {title: t('Edit'), key: 'edit', align: 'end'},
]

const inviteTableHeaders = [
    {title: 'ID', key: 'id'},
    {title: t('Email'), key: 'email'},
    {title: t('Role'), key: 'group.name'},
    {title: t('Reusable'), key: 'reusable'},
    {title: t('Edit'), key: 'edit', align: 'end'},
]

onMounted(() => {
    const api = new ApiApi()

    api.apiUserSpaceList().then(r => {
        spaceUserSpaces.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    api.apiInviteLinkList({unused: true}).then(r => {
        spaceInviteLinks.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

/**
 * delete userspace from client list (database handled by editor)
 * @param userSpace UserSpace object that was deleted
 */
function deleteUserSpace(userSpace: UserSpace) {
    spaceUserSpaces.value.splice(spaceUserSpaces.value.indexOf(userSpace) - 1, 1)
}

/**
 * delete invite link from client list (database handled by editor)
 * @param inviteLink InviteLink object that was deleted
 */
function deleteInviteLink(inviteLink: InviteLink) {
    spaceInviteLinks.value.splice(spaceInviteLinks.value.indexOf(inviteLink) - 1, 1)
}

/**
 * returns url for invite link
 * @param inviteLink InviteLink object to create url for
 */
function inviteLinkUrl(inviteLink: InviteLink) {
    return useDjangoUrls().getDjangoUrl(`/invite/${inviteLink.uuid}`)
}

</script>

<style scoped>

</style>