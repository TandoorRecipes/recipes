<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('merge_title', {type: $t(genericModel.model.localizationKey)})"
                :sub-title="genericModel.getLabel(props.source)"
                :icon="genericModel.model.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>
                {{ $t('merge_selection', {source: genericModel.getLabel(props.source), type: $t(genericModel.model.localizationKey)}) }}
                <model-select :model="props.model" v-model="target" allow-create></model-select>

                <v-row>
                    <v-col class="text-center">
                        <v-card color="warning" variant="tonal">
                            <v-card-title>{{ genericModel.getLabel(props.source) }}</v-card-title>
                        </v-card>
                        <v-icon icon="fa-solid fa-arrow-down" class="mt-4 mb-4"></v-icon>
                        <v-card color="success" variant="tonal">
                            <v-card-title v-if="!target">?</v-card-title>
                            <v-card-title v-else>{{ genericModel.getLabel(target) }}</v-card-title>
                        </v-card>
                    </v-col>
                </v-row>

                <v-checkbox :label="$t('Automate')" v-model="automate" :hint="$t('MergeAutomateHelp')" persistent-hint v-if="genericModel.model.mergeAutomation"></v-checkbox>

            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="loading" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning" @click="mergeModel()" :loading="loading" :disabled="!target">{{ $t('Merge') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {PropType, ref} from "vue";
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString} from "@/types/Models";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ApiApi, Automation} from "@/openapi";

const emit = defineEmits(['change'])

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    source: {type: {} as PropType<EditorSupportedTypes>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)
const automate = ref(false)

const genericModel = getGenericModelFromString(props.model, t)
const target = ref<null | EditorSupportedTypes>(null)

/**
 * merge source into selected target
 */
function mergeModel() {
    let api = new ApiApi()

    if (target.value != null) {
        loading.value = true

        genericModel.merge(props.source, target.value).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            emit('change', target.value)

            if (automate.value && target.value != null && Object.hasOwn(props.source, 'name') && Object.hasOwn(target.value, 'name')) {
                let automation = {
                    name: `${t('Merge') } ${props.source.name} -> ${target.value.name}`.substring(0,128),
                    param1: props.source.name,
                    param2: target.value.name,
                    type: genericModel.model.mergeAutomation
                } as Automation
                api.apiAutomationCreate({automation: automation}).catch(err => {
                    useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                }).finally(() => {
                    loading.value = false
                    dialog.value = false
                })
            }
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            if (!automate.value) {
                loading.value = false
                dialog.value = false
            }
        })
    }

}

</script>


<style scoped>

</style>