<template>
    <v-row v-if="props.space.name != undefined">
        <v-col cols="12" md="4">
            <v-card :to="{name: 'SearchPage'}">
                <v-card-title><i class="fa-solid fa-book"></i> {{ $t('Recipes') }}</v-card-title>
                <v-card-text>{{ $n(props.space.recipeCount) }} / {{ props.space.maxRecipes == 0 ? '∞' : $n(props.space.maxRecipes) }}</v-card-text>
                <v-progress-linear :color="isSpaceAboveRecipeLimit(props.space) ? 'error' : 'success'" height="10"
                                   :model-value="(props.space.recipeCount / props.space.maxRecipes) * 100"></v-progress-linear>
            </v-card>
        </v-col>
        <v-col cols="12" md="4">
            <v-card :to="{name: 'ModelListPage', params: {model: 'UserSpace'}}">

                <v-card-title><i class="fa-solid fa-users"></i> {{ $t('Users') }}</v-card-title>
                <v-card-text>{{ $n(props.space.userCount) }} / {{ props.space.maxUsers == 0 ? '∞' : $n(props.space.maxUsers) }}</v-card-text>
                <v-progress-linear :color="isSpaceAboveUserLimit(props.space) ? 'error' : 'success'" height="10"
                                   :model-value="(props.space.userCount / props.space.maxUsers) * 100"></v-progress-linear>
            </v-card>
        </v-col>
        <v-col cols="12" md="4">
            <v-card :to="{name: 'ModelListPage', params: {model: 'UserFile'}}">
                <v-card-title><i class="fa-solid fa-file"></i> {{ $t('Files') }}</v-card-title>
                <v-card-text v-if="props.space.maxFileStorageMb > -1">{{ $n(Math.round(props.space.fileSizeMb)) }} /
                    {{ props.space.maxFileStorageMb == 0 ? '∞' : $n(props.space.maxFileStorageMb) }}
                    MB
                </v-card-text>
                <v-card-text v-if="props.space.maxFileStorageMb == -1">{{ $t('file_upload_disabled') }}</v-card-text>
                <v-progress-linear v-if="props.space.maxFileStorageMb > -1" :color="isSpaceAboveStorageLimit(props.space) ? 'error' : 'success'" height="10"
                                   :model-value="(props.space.fileSizeMb / props.space.maxFileStorageMb) * 100"></v-progress-linear>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card :to="{name: 'ModelListPage', params: {model: 'AiLog'}}">
                <v-card-title><i class="fa-solid hand-holding-dollar"></i> {{ $t('MonthlyCredits') }}</v-card-title>
                <v-card-text>{{ $n(props.space.aiMonthlyCreditsUsed) }} / {{ $n(props.space.aiCreditsMonthly) }} {{ $t('Credits') }}
                </v-card-text>
                <v-progress-linear :model-value="props.space.aiMonthlyCreditsUsed" :max="props.space.aiCreditsMonthly" height="10"
                ></v-progress-linear>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card :to="{name: 'ModelListPage', params: {model: 'AiLog'}}">
                <v-card-title><i class="fa-solid hand-holding-dollar"></i> {{ $t('AiCreditsBalance') }}</v-card-title>
                <v-card-text>{{ $n(props.space.aiCreditsBalance) }} {{ $t('Credits') }}
                </v-card-text>
                <v-progress-linear height="10"
                ></v-progress-linear>
            </v-card>
        </v-col>
    </v-row>

</template>


<script setup lang="ts">

import {PropType} from "vue";
import {Space} from "@/openapi";
import {isSpaceAboveRecipeLimit, isSpaceAboveStorageLimit, isSpaceAboveUserLimit} from "@/utils/logic_utils.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    space: {type: {} as PropType<Space>, required: true},
})

</script>

<style scoped>

</style>