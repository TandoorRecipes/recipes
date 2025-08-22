<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('merge_title', {type: $t(genericModel.model.localizationKey)})"
                :sub-title="sourceNames"
                :icon="genericModel.model.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>
                {{ $t('merge_selection', {source: sourceNames, type: $t(genericModel.model.localizationKey)}) }}
                <model-select :model="props.model" v-model="target" allow-create></model-select>

                <v-row>
                    <v-col>
                        <v-list>
                            <v-list-item border v-for="item in sourceItems">
                                {{ genericModel.getLabel(item) }}

                                <template #append>
                                    <v-icon icon="fa-solid fa-xmark" color="error" variant="tonal" v-if="failedItems.includes(item)"></v-icon>
                                    <v-icon icon="fa-solid fa-check" color="success" variant="tonal" v-else-if="updatedItems.includes(item)"></v-icon>
                                    <v-icon icon="fa-solid  fa-circle-notch fa-spin" variant="tonal" color="info" v-else-if="loading"></v-icon>
                                </template>
                            </v-list-item>

                            <v-list-item class="text-center">
                                <v-icon icon="fa-solid fa-arrow-down" class="mt-4 mb-4"></v-icon>
                            </v-list-item>

                            <v-list-item class="text-center" border>
                                <span v-if="!target">?</span>
                                <span v-else>{{ genericModel.getLabel(target) }}</span>
                            </v-list-item>
                        </v-list>
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
import {computed, PropType, ref, watch} from "vue";
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString} from "@/types/Models";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ApiApi, Automation} from "@/openapi";

const emit = defineEmits(['change'])

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    source: {type: Array as PropType<Array<EditorSupportedTypes>>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)
const automate = ref(false)

const genericModel = getGenericModelFromString(props.model, t)
const target = ref<null | EditorSupportedTypes>(null)

const sourceItems = ref<EditorSupportedTypes[]>([])
const failedItems = ref<EditorSupportedTypes[]>([])
const updatedItems = ref<EditorSupportedTypes[]>([])

watch(dialog, (newValue, oldValue) => {
    if (!oldValue && newValue) {
        sourceItems.value = JSON.parse(JSON.stringify(props.source))
    }
})

/**
 * generate comma seperated list of item names that act as the source
 */
const sourceNames = computed(() => {
    if (sourceItems.value) {
        return sourceItems.value.map(i => genericModel.getLabel(i)).join(', ')
    }
    return ''
})

/**
 * merge source into selected target
 */
function mergeModel() {
    let api = new ApiApi()
    let promises: Promise<any>[] = []

    if (target.value != null) {
        loading.value = true

        sourceItems.value.forEach(sourceItem => {
            promises.push(genericModel.merge(sourceItem, target.value).then(r => {

                updatedItems.value.push(sourceItem)

                if (automate.value && target.value != null && Object.hasOwn(sourceItem, 'name') && Object.hasOwn(sourceItem, 'name')) {
                    let automation = {
                        name: `${t('Merge')} ${sourceItem.name} -> ${target.value.name}`.substring(0, 128),
                        param1: sourceItem.name,
                        param2: target.value.name,
                        type: genericModel.model.mergeAutomation
                    } as Automation
                    promises.push(api.apiAutomationCreate({automation: automation}).catch(err => {
                        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                    }))
                }
            }).catch(err => {
                updatedItems.value.push(sourceItem)
            }))
        })

        Promise.allSettled(promises).then(() => {
            loading.value = false
            emit('change')
        })

    }

}

</script>


<style scoped>

</style>