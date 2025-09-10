<template>
    <v-container>
        <v-card>
            <v-card-title>Welcome</v-card-title>
            <v-card-text v-if="space">
                Welcome to Tandoor

                <v-text-field v-model="space.name" :label="$t('Name')"></v-text-field>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">


import {ApiApi, Space} from "@/openapi";
import {onMounted, ref} from "vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const space = ref<undefined | Space>(undefined)

onMounted(() => {
    loadSpace()
})

function loadSpace() {
    let api = new ApiApi()

    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

function updateSpace() {
    let api = new ApiApi()
    api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
        useUserPreferenceStore().activeSpace = Object.assign({}, space.value)
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS, space.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>


</style>