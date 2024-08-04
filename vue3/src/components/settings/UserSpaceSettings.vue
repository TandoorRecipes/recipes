<template>


    <v-row>
        <v-col cols="12"></v-col>
    </v-row>

    <v-row>
        <v-col cols="3" v-for="us in userSpaces">
            <v-card>
                <v-card-title>{{us.space}}</v-card-title>
            </v-card>
        </v-col>
    </v-row>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, UserSpace} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const userSpaces = ref([] as UserSpace[])

onMounted(() => {
    const api = new ApiApi()

    api.apiUserSpaceList().then(r => {
        userSpaces.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})
</script>

<style scoped>

</style>