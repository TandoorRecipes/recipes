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
                <v-text-field :label="$t('Plural')" v-model="editingObj.pluralName"></v-text-field>
                <v-textarea :label="$t('Description')" v-model="editingObj.description"></v-textarea>
                <v-select :label="$t('BaseUnit')" :hint="$t('BaseUnitHelp')" :items="BASE_UNITS" v-model="editingObj.baseUnit"></v-select>
                <v-text-field :label="$t('Open_Data_Slug')" :hint="$t('open_data_help_text')" persistent-hint v-model="editingObj.openDataSlug" disabled></v-text-field>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType} from "vue";
import {Unit} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<Unit>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Unit>, required: false, default: {} as Unit},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<Unit>('Unit', emit)

// object specific data (for selects/display)

const BASE_UNITS = [
    {value: "g", title: t("g")},
    {value: "kg", title: t("kg")},
    {value: "ounce", title: t("ounce")},
    {value: "pound", title: t("pound")},
    {value: "ml", title: t("ml")},
    {value: "l", title: t("l")},
    {value: "fluid_ounce", title: t("fluid_ounce")},
    {value: "us_cup", title: t("us_cup")},
    {value: "pint", title: t("pint")},
    {value: "quart", title: t("quart")},
    {value: "gallon", title: t("gallon")},
    {value: "tbsp", title: t("tbsp")},
    {value: "tsp", title: t("tsp")},
    {value: "imperial_fluid_ounce", title: t("imperial_fluid_ounce")},
    {value: "imperial_pint", title: t("imperial_pint")},
    {value: "imperial_quart", title: t("imperial_quart")},
    {value: "imperial_gallon", title: t("imperial_gallon")},
    {value: "imperial_tbsp", title: t("imperial_tbsp")},
    {value: "imperial_tsp", title: t("imperial_tsp")},
]

onMounted(() => {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
})

</script>

<style scoped>

</style>