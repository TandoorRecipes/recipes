<template>
    <v-container>
<v-btn @click="test"> Test</v-btn>

    </v-container>
</template>

<script setup lang="ts">

import {ApiApi} from "@/openapi";
import {AuthenticationCurrentSessionApi, SessionsApi} from "@/authapi";

function test(){
    let sessionsApi = new SessionsApi()

    sessionsApi.allauthClientV1AuthSessionsGet({client: 'browser'}).then(r => {
        console.log(r)
    })

    let currentSessionApi = new AuthenticationCurrentSessionApi()
    currentSessionApi.allauthClientV1AuthSessionGet({client: 'browser'}).then(r => {
        console.log(r)
    })

}

</script>


<style scoped>

</style>