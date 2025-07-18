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
                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <v-select :label="$t('Type')" :items="AUTOMATION_TYPES" v-model="editingObj.type"></v-select>

                <v-text-field :label="$t('Parameter') + ' 1'" v-model="editingObj.param1"></v-text-field>
                <v-text-field :label="$t('Parameter') + ' 2'" v-model="editingObj.param2"></v-text-field>
                <v-text-field :label="$t('Parameter') + ' 3'" v-model="editingObj.param3"></v-text-field>

                <v-textarea :label="$t('Description')" v-model="editingObj.description"></v-textarea>
                <v-number-input :label="$t('Order')" :step="10" v-model="editingObj.order" :hint="$t('OrderInformation')" control-variant="stacked"></v-number-input>
                <v-checkbox :label="$t('Disabled')" v-model="editingObj.disabled"></v-checkbox>

                <a href="https://docs.tandoor.dev/features/automation/" target="_blank">{{ $t('Learn_More') }}</a>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {Automation} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<Automation>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Automation>, required: false, default: {} as Automation},
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
    modelClass,
    applyItemDefaults
} = useModelEditorFunctions<Automation>('Automation', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

const AUTOMATION_TYPES = [
    {value: "FOOD_ALIAS", title: t("Food_Alias")},
    {value: "UNIT_ALIAS", title: t("Unit_Alias")},
    {value: "KEYWORD_ALIAS", title: t("Keyword_Alias")},
    {value: "NAME_REPLACE", title: t("Name_Replace")},
    {value: "DESCRIPTION_REPLACE", title: t("Description_Replace")},
    {value: "INSTRUCTION_REPLACE", title: t("Instruction_Replace")},
    {value: "FOOD_REPLACE", title: t("Food_Replace")},
    {value: "UNIT_REPLACE", title: t("Unit_Replace")},
    {value: "NEVER_UNIT", title: t("Never_Unit")},
    {value: "TRANSPOSE_WORDS", title: t("Transpose_Words")}
]

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.order = 0

            applyItemDefaults(props.itemDefaults)
        },
        itemDefaults: props.itemDefaults
    })
}

</script>

<style scoped>

</style>