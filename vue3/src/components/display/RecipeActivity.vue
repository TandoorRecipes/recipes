<template>
    <v-card class="mt-1 d-print-none" v-if="useUserPreferenceStore().isAuthenticated" :loading="loading">
        <v-card-text>
            <v-textarea :label="$t('Comment')" rows="2" v-model="newCookLog.comment"></v-textarea>
            <v-row dense>
                <v-col cols="12" md="4">
                    <v-label>{{ $t('Rating') }}</v-label>
                    <br/>
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

    <v-card class="mt-1" v-if="cookLogs.length > 0" :loading="loading">
        <v-card-title>{{ $t('Activity') }}</v-card-title>
        <v-card-text>
            <v-list>
                <v-list-item class="border-t-sm" v-for="c in cookLogs" :key="c.id" :link="c.createdBy.id == useUserPreferenceStore().userSettings?.user.id">
                    <template #prepend>
                        <v-avatar color="primary">{{ c.createdBy.displayName.charAt(0) }}</v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">
                        {{ c.createdBy.displayName }}

                    </v-list-item-title>
                    <v-list-item-subtitle>{{ c.comment }}</v-list-item-subtitle>

                    <v-list-item-subtitle class="font-italic mt-1" v-if="c.servings != null && c.servings > 0">

                        {{ c.servings }}
                        <span v-if="recipe.servingsText != ''">{{ recipe.servingsText }}</span>
                        <span v-else-if="c.servings == 1">{{ $t('Serving') }}</span>
                        <span v-else>{{ $t('Servings') }}</span>

                    </v-list-item-subtitle>

                    <template #append>
                        <v-list-item-action class="flex-column align-end">
                            <v-rating density="comfortable" size="x-small" color="tandoor" v-model="c.rating" half-increments readonly
                                      v-if="c.rating != undefined"></v-rating>
                            <v-spacer></v-spacer>
                            <v-tooltip location="top" :text="DateTime.fromJSDate(c.createdAt).toLocaleString(DateTime.DATETIME_MED)" v-if="c.createdAt != undefined">
                                <template v-slot:activator="{ props }">
                                    <span v-bind="props">{{ DateTime.fromJSDate(c.createdAt).toRelative({style: 'narrow'}) }}</span>
                                </template>
                            </v-tooltip>

                        </v-list-item-action>
                    </template>
                    <model-edit-dialog model="CookLog" :item="c" v-if="c.createdBy.id == useUserPreferenceStore().userSettings?.user.id" @save="recLoadCookLog(props.recipe.id)" @delete="recLoadCookLog(props.recipe.id)"></model-edit-dialog>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>


</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, CookLog, Recipe} from "@/openapi";
import {DateTime} from "luxon";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
})

const newCookLog = ref({} as CookLog);

const cookLogs = ref([] as CookLog[])
const loading = ref(false)

onMounted(() => {
    recLoadCookLog(props.recipe.id)
    resetForm()
})

/**
 * recursively load cook logs from database for given recipe
 */
function recLoadCookLog(recipeId: number, page: number = 1) {
    const api = new ApiApi()
    loading.value = true
    if(page == 1){
        cookLogs.value = []
    }
    api.apiCookLogList({recipe: props.recipe.id, page: page}).then(r => {
        if (r.results) {
            cookLogs.value = cookLogs.value.concat(r.results)
            if (r.next) {
                recLoadCookLog(recipeId, page + 1)
            } else {
                cookLogs.value = cookLogs.value.sort((a, b) => a.createdAt! > b.createdAt! ? 1 : -1)
                loading.value = false
            }
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