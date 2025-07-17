<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form :disabled="loading">
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="Token" v-model="editingObj.token" disabled></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <btn-copy :copy-value="editingObj.token" class="me-1"></btn-copy>
                    </v-col>
                </v-row>

                <v-text-field label="Scope" v-model="editingObj.scope"></v-text-field>
                <v-date-input :label="$t('Valid Until')" v-model="editingObj.expires"></v-date-input>
            </v-form>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {onMounted, PropType, watch} from "vue";
import {AccessToken, ApiApi} from "@/openapi";

import {DateTime} from "luxon";
import BtnCopy from "@/components/buttons/BtnCopy.vue";

import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";

const props = defineProps({
    item: {type: {} as PropType<AccessToken>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<AccessToken>, required: false, default: {} as AccessToken},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<AccessToken>('AccessToken', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.expires = DateTime.now().plus({year: 1}).toJSDate()
            editingObj.value.scope = 'read write'
        },
        itemDefaults: props.itemDefaults
    })
}

</script>

<style scoped>

</style>