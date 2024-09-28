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
                <v-text-field v-model="editingObj.name" :label="$t('Name')"></v-text-field>

                <v-text-field
                    max-width="200px"
                    v-model="editingObj.time"
                    :active="timePickerMenu"
                    :focus="timePickerMenu"
                    :label="$t('Time')"
                    prepend-icon="fa-solid fa-clock"
                    readonly>
                    <v-menu
                        v-model="timePickerMenu"
                        :close-on-content-click="false"
                        activator="parent"
                        transition="scale-transition">
                        <v-time-picker v-if="timePickerMenu" format="24hr" v-model="editingObj.time"></v-time-picker>
                    </v-menu>
                </v-text-field>

                <v-color-picker v-model="editingObj.color" mode="hex" :modes="['hex']" show-swatches
                                :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>
            </v-form>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {MealType} from "@/openapi";
import {VTimePicker} from 'vuetify/labs/VTimePicker'; // TODO remove once out of labs
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";


const props = defineProps({
    item: {type: {} as PropType<MealType>, required: false, default: null},
    itemId: {type: Number, required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<MealType>('MealType', emit)

// object specific data (for selects/display)
const timePickerMenu = ref(false)


onMounted(() => {
    if (!setupState(props.item, props.itemId)) {
        // functions to populate defaults
    }
})

</script>

<style scoped>

</style>