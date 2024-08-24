<template>
    <v-form>
        <p class="text-h6">{{ useUserPreferenceStore().activeSpace.name }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-row v-if="space.name != undefined">
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title><i class="fa-solid fa-book"></i> {{ $t('Recipes') }}</v-card-title>
                    <v-card-text>{{ $n(space.recipeCount) }} / {{ space.maxRecipes == 0 ? '∞' : $n(space.maxRecipes) }}</v-card-text>
                    <v-progress-linear color="success" height="10" :model-value="(space.recipeCount / space.maxRecipes) * 100"></v-progress-linear>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card>

                    <v-card-title><i class="fa-solid fa-users"></i> {{ $t('Users') }}</v-card-title>
                    <v-card-text>{{ $n(space.userCount) }} / {{ space.maxUsers == 0 ? '∞' : $n(space.maxUsers) }}</v-card-text>
                    <v-progress-linear color="success" height="10" :model-value="(space.userCount / space.maxUsers) * 100"></v-progress-linear>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title><i class="fa-solid fa-file"></i> {{ $t('Files') }}</v-card-title>
                    <v-card-text v-if="space.maxFileStorageMb > -1">{{ $n(Math.round(space.fileSizeMb)) }} / {{ space.maxFileStorageMb == 0 ? '∞' : $n(space.maxFileStorageMb) }} MB</v-card-text>
                    <v-card-text v-if="space.maxFileStorageMb == -1">{{ $t('file_upload_disabled') }}</v-card-text>
                    <v-progress-linear v-if="space.maxFileStorageMb > -1" color="success" height="10" :model-value="(space.fileSizeMb / space.maxFileStorageMb) * 100" ></v-progress-linear>
                </v-card>
            </v-col>
        </v-row>
        <v-divider class="mt-3 mb-3"></v-divider>
        <user-file-field v-model="space.image" :label="$t('Image')"></user-file-field>
        <user-file-field v-model="space.logoColor32" :label="$t('Logo') + ' 32x32px'"></user-file-field>
        <user-file-field v-model="space.logoColor128"></user-file-field>

        <v-text-field></v-text-field>
        <v-text-field></v-text-field>

        <v-btn class="mt-3" color="success" @click="updateSpace()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
    </v-form>
</template>


<script setup lang="ts">

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {onMounted, ref} from "vue";
import {ApiApi, Space} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import UserFileField from "@/components/inputs/UserFileField.vue";

const space = ref({} as Space)

onMounted(() => {
    let api = new ApiApi()
    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

function updateSpace(){
    let api = new ApiApi()
    api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>