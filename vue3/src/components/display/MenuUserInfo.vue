<template>
    <v-list-item class="mb-2">
        <template #prepend>
            <v-avatar color="primary">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}</v-avatar>
        </template>
        <v-list-item-title>{{ useUserPreferenceStore().userSettings.user.displayName }}</v-list-item-title>
        <v-list-item-subtitle>
            <i :class="TSpace.icon"></i>
            {{ useUserPreferenceStore().activeSpace.name }}
        </v-list-item-subtitle>
        <v-list-item-subtitle
            :to="{name: 'ModelListPage', params: {model: 'household'}}"
            v-if="useUserPreferenceStore().activeUserSpace != null && useUserPreferenceStore().activeUserSpace.household != null">
            <i :class="THousehold.icon"></i>
            {{ useUserPreferenceStore().activeUserSpace.household.name }}
        </v-list-item-subtitle>
        <v-list-item-subtitle class="cursor-pointer" @click="router.push({name: 'ModelListPage', params: {model: 'UserSpace'}})"
                              v-else>
            <i :class="THousehold.icon"></i>
            {{ $t('NoHousehold') }}
        </v-list-item-subtitle>
    </v-list-item>
</template>

<script setup lang="ts">

import {THousehold, TSpace} from "@/types/Models.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useRouter} from "vue-router";

let router = useRouter()
</script>

<style scoped>

</style>