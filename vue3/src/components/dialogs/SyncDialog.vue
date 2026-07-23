<template>

    <v-dialog max-width="600px" :activator="activator === 'model' ? undefined : 'parent'" v-model="dialogOpen">
        <v-card>
            <v-closable-card-title v-model="dialogOpen" :title="$t('Import')"></v-closable-card-title>
            <v-card-text>
                <div v-if="loading" class="text-center">
                    <v-progress-circular :indeterminate="true" color="success" size="x-large"></v-progress-circular>
                </div>
                <template v-if="syncLog">

                    <v-chip label v-if="syncLog.status == 'SUCCESS'" color="success">{{ $t('Success') }}</v-chip>
                    <v-chip label v-if="syncLog.status != 'SUCCESS'" color="danger">{{ $t('Error') }}</v-chip>

                    <v-textarea auto-grow max-rows="10" v-model="syncLog.msg" :hint="DateTime.fromJSDate(syncLog.createdAt).toLocaleString(DateTime.DATETIME_SHORT)" persistent-hint readonly></v-textarea>
                </template>

            </v-card-text>
            <v-card-actions>
                <v-btn @click="performSync()" color="create" :loading="loading" v-if="!syncLog">{{ $t('Import') }}</v-btn>
                <v-btn :to="{name: 'ModelListPage', params: {model: 'RecipeImport'}}" color="primary" :loading="loading" v-if="syncLog">{{ $t('View') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {type PropType, ref, computed, watch} from "vue";
import {ApiApi, Sync, SyncLog} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {DateTime} from "luxon";

const props = defineProps({
    sync: {type: {} as PropType<Sync>, required: true},
    modelValue: {type: Boolean, default: undefined},
    activator: {type: String as PropType<'parent' | 'model'>, default: 'parent'},
})
const emit = defineEmits(['update:modelValue'])

const internalDialog = ref(false)
const dialogOpen = computed({
    get: () => props.modelValue !== undefined ? props.modelValue : internalDialog.value,
    set: (val: boolean) => {
        if (props.modelValue !== undefined) emit('update:modelValue', val)
        else internalDialog.value = val
    },
})

watch(dialogOpen, (val) => {
    if (val) { syncLog.value = undefined }
})
const loading = ref(false)
const syncLog = ref<undefined | SyncLog>(undefined)

function performSync() {
    let api = new ApiApi()

    api.apiSyncQuerySyncedFolderCreate({id: props.sync.id!, sync: props.sync}).then(r => {
        syncLog.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>