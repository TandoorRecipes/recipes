<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-card-title>{{ $t('merge_title', {type: getGenericModelFromString(props.model).model.name}) }}</v-card-title>
            <!-- TODO localize model name -->
            <v-card-text>
                {{ $t('merge_selection', {source: '', type: getGenericModelFromString(props.model).model.name}) }}
                <model-select  :model="props.model" v-model="target"></model-select>
                <model-select append-to-body :model="props.model" v-model="target"></model-select>
            </v-card-text>
            <v-card-actions>
                <v-btn>{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning" @click="mergeModel()">{{ $t('Merge') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {PropType, ref} from "vue";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {ApiApi, Food} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    sourceId: {type: Number},
    activator: {type: String, default: 'parent'},
})

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const target = ref({} as Food)

function mergeModel() {
    let api = new ApiApi()
    if (target.value != null) {
        loading.value = true
        api.apiFoodMergeUpdate({id: props.sourceId!, food: {} as Food, target: target.value.id!}).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

}

</script>


<style scoped>

</style>