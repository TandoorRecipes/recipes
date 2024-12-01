<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-tabs v-model="tab" :disabled="loading" grow>
            <v-tab value="recipe">{{ $t('Recipe') }}</v-tab>
            <v-tab value="steps">{{ $t('Steps') }}</v-tab>
            <v-tab value="settings">{{ $t('Settings') }}</v-tab>

        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="recipe">
                    <v-form :disabled="loading">
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-textarea :label="$t('Description')" v-model="editingObj.description" clearable counter="512"></v-textarea>

                        <v-label>{{ $t('Keywords') }}</v-label>
                        <ModelSelect mode="tags" v-model="editingObj.keywords" model="Keyword"></ModelSelect>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('WaitingTime')" v-model="editingObj.waitingTime"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('WorkingTime')" v-model="editingObj.workingTime"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('Servings')" v-model="editingObj.servings"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('ServingsText')" v-model="editingObj.servingsText"></v-text-field>
                            </v-col>
                        </v-row>

                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="steps">
                    <v-form :disabled="loading">


                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="settings">
                    <v-form :disabled="loading">


                    </v-form>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {Recipe} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<Recipe>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<Recipe>('Recipe', emit)

// object specific data (for selects/display)
const tab = ref("recipe")

onMounted(() => {
    setupState(props.item, props.itemId)
})

</script>

<style scoped>

</style>