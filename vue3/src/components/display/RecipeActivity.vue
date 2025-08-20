<template>

    <v-card class="mt-1" v-if="cookLogs.length > 0">
        <v-card-title>{{ $t('Activity') }}</v-card-title>
        <v-card-text>
            <v-list>
                <v-list-item v-for="c in cookLogs.sort((a,b) =>  a.createdAt! > b.createdAt! ? 1 : -1)" :key="c.id">
                    <template #prepend>
                        <v-avatar color="primary">V</v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">{{ c.createdBy.displayName }}
                        <v-rating density="comfortable" size="x-small" color="tandoor" class="float-right" v-model="c.rating" readonly v-if="c.rating != undefined"></v-rating>
                    </v-list-item-title>

                    {{ c.comment }}

                    <p v-if="c.servings != null && c.servings > 0">
                        {{ c.servings }}
                        <span v-if="recipe.servingsText != ''">{{ recipe.servingsText }}</span>
                        <span v-else-if="c.servings == 1">{{ $t('Serving') }}</span>
                        <span v-else>{{ $t('Servings') }}</span>
                    </p>

                    <p class="text-disabled">
                        {{ DateTime.fromJSDate(c.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                    </p>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>

    <v-card class="mt-1 d-print-none" v-if="useUserPreferenceStore().isAuthenticated">
        <v-card-text>
            <v-textarea :label="$t('Comment')" rows="2" v-model="newCookLog.comment"></v-textarea>
            <v-row de>
                <v-col cols="12" md="4">
                    <v-label>{{$t('Rating')}}</v-label><br/>
                    <v-rating v-model="newCookLog.rating" clearable hover density="compact"></v-rating>
                </v-col>
                <v-col cols="12" md="4">

                    <v-number-input :label="$t('Servings')" v-model="newCookLog.servings" :precision="2"></v-number-input>
                </v-col>
                <v-col cols="12" md="4">
                    <v-date-input :label="$t('Date')" v-model="newCookLog.createdAt"></v-date-input>

                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn color="create" prepend-icon="$create" @click="saveCookLog()">{{ $t('Create') }}</v-btn>
        </v-card-actions>
    </v-card>


</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, CookLog, Recipe} from "@/openapi";
import {DateTime} from "luxon";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
})

const newCookLog = ref({} as CookLog);

const cookLogs = ref([] as CookLog[])

onMounted(() => {
    refreshActivity()
    resetForm()
})

/**
 * load cook logs from database for given recipe
 */
function refreshActivity() {
    const api = new ApiApi()
    api.apiCookLogList({recipe: props.recipe.id}).then(r => {
        // TODO pagination
        if (r.results) {
            cookLogs.value = r.results
        }
    })
}

/**
 * reset new cook log from with proper defaults
 */
function resetForm() {
    newCookLog.value.servings = props.recipe.servings
    newCookLog.value.createdAt = new Date()
    newCookLog.value.recipe = props.recipe.id!
}

/**
 * create new cook log in database
 */
function saveCookLog() {
    const api = new ApiApi()

    api.apiCookLogCreate({cookLog: newCookLog.value}).then(r => {
        cookLogs.value.push(r)
        resetForm()
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>