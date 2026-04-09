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
                <v-text-field :label="$t('Name')" v-model="editingObj.name" />

                <v-select
                    :label="$t('Type')"
                    v-model="(editingObj as any).type"
                    :items="filterTypes"
                    item-title="label"
                    item-value="value"
                />

                <model-select
                    model="User"
                    v-model="editingObj.shared"
                    :label="$t('Shared')"
                    mode="tags"
                />
            </v-form>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">
import {computed, onMounted, PropType, watch} from "vue"
import {CustomFilter} from "@/openapi"
import {useI18n} from "vue-i18n"
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions"
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue"
import ModelSelect from "@/components/inputs/ModelSelect.vue"

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<CustomFilter>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<CustomFilter>, required: false, default: {} as CustomFilter},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<CustomFilter>('CustomFilter', emit)

const filterTypes = computed(() => [
    {value: 'RECIPE', label: t('Recipe')},
    {value: 'FOOD', label: t('Food')},
    {value: 'KEYWORD', label: t('Keyword')},
])

watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

onMounted(() => {
    initializeEditor()
})

function initializeEditor() {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}
</script>

<style scoped></style>
