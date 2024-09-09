<template>
    <v-form>
        <p class="text-h6">{{ $t('API') }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-alert color="error" variant="tonal">
            The API is made for developers to interact with the application.
            It is possible to break things using the API so be careful and create a backup first.
            The API definition can and will change in the future, make sure to read the changelog to spot changes early
            on.
        </v-alert>

        Authentication works by proving the word <code>Bearer</code> followed by an API Token as a request Authorization
        header as shown below. <br/>
        <code>Authorization: Bearer TOKEN</code> -or-<br/>
        <code>curl -X GET http://your.domain.com/api/recipes/ -H 'Authorization:
            Bearer TOKEN'</code>

        <br/>
        <br/>
        You can have multiple tokens and each token can have its own scope. Currently there is <code>read</code>, <code>write</code>
        and <code>bookmarklet</code>.
        Read and write do what the name says, the bookmarklet scope is only used for the bookmarklet to limit access to
        it.

        <v-alert color="warning" variant="tonal">Make sure to save your token after creation as they cannot be viewed afterwards. </v-alert>

        <v-list>
            <v-list-item v-for="at in accessTokenList">
                <v-list-item-title>{{at.token}}</v-list-item-title>
                <v-list-item-subtitle>Scope {{at.scope}} Expires {{DateTime.fromJSDate(at.expires).toLocaleString(DateTime.DATE_FULL)}}</v-list-item-subtitle>
                <template #append>
<!--                    <v-btn icon="$edit" color="edit"></v-btn>-->
<!--                    <v-btn icon="$delete" color="delete"></v-btn>-->
                </template>
            </v-list-item>
        </v-list>



    </v-form>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {AccessToken, ApiApi} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";

const accessTokenList = ref([] as AccessToken[])
const accessToken = ref({} as AccessToken)

onMounted(() => {
    loadAccessTokens()
})

function loadAccessTokens(){
    const api = new ApiApi()
    api.apiAccessTokenList().then(r => {
        accessTokenList.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

</script>

<style scoped>

</style>