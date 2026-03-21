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
        :object-name="editingObjName()"
        :editing-object="editingObj">
        <v-card-text>
            <v-form :disabled="loading">

                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>

                <v-checkbox v-model="joinAfterSave" v-if="!isUpdate() || editingObj.id != useUserPreferenceStore().activeUserSpace?.household?.id" :label="$t('Join')"></v-checkbox>

                <p>
                    {{ $t('AssignHouseholdHelp') }}
                </p>
                <database-model-col model="UserSpace"></database-model-col>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Household} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import DatabaseModelCol from "@/components/display/DatabaseModelCol.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {tr} from "vuetify/locale";

const props = defineProps({
    item: {type: {} as PropType<Household>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Household>, required: false, default: {} as Household},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {
    setupState,
    deleteObject,
    saveObject,
    isUpdate,
    editingObjName,
    loading,
    editingObj,
    editingObjChanged,
    modelClass
} = useModelEditorFunctions<Household>('Household', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

let joinAfterSave = ref(false)

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults, onAfterSave: onAfterSave},)
}

function onAfterSave() {
    let userSpace = useUserPreferenceStore().activeUserSpace
    console.log("onAfterSave", userSpace, joinAfterSave.value)
    if (joinAfterSave.value && userSpace) {
        let api = new ApiApi()

        loading.value = true
        userSpace.household = editingObj.value
        api.apiUserSpaceUpdate({id: userSpace.id!, userSpace: userSpace}).then(r => {
             useUserPreferenceStore().activeUserSpace = r
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