<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-name="$t(modelClass.model.localizationKey)"
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
import {onMounted, PropType} from "vue";
import {AccessToken} from "@/openapi";

import {DateTime} from "luxon";
import BtnCopy from "@/components/buttons/BtnCopy.vue";

import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";

const props = defineProps({
    item: {type: {} as PropType<AccessToken>, required: false, default: null},
    itemId: {type: Number, required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<AccessToken>('AccessToken', emit)


onMounted(() => {
    if (!setupState(props.item, props.itemId)) {
        // functions to populate defaults
        editingObj.value.expires = DateTime.now().plus({year: 1}).toJSDate()
        editingObj.value.scope = 'read write'
    }
})

</script>

<style scoped>

</style>