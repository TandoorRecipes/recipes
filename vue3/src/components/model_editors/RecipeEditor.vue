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
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-textarea :label="$t('Description')" v-model="editingObj.description" clearable counter="512"></v-textarea>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-img style="max-height: 150px" :src="editingObj.image"></v-img>
                            </v-col>
                        </v-row>


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
                        <v-row v-for="(s,i ) in editingObj.steps" :key="s.id">
                            <v-col>
                                <step-editor v-model="editingObj.steps[i]" :step-index="i"></step-editor>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-center">
                                <v-btn-group density="compact">
                                    <v-btn color="success" prepend-icon="fa-solid fa-plus">{{ $t('Add_Step') }}</v-btn>
                                    <v-btn color="warning" @click="dialogStepManager = true">
                                        <v-icon icon="fa-solid fa-arrow-down-1-9"></v-icon>
                                    </v-btn>
                                </v-btn-group>
                            </v-col>
                        </v-row>

                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="settings">
                    <v-form :disabled="loading">
                        <v-checkbox :label="$t('Ingredient Overview')" :hint="$t('show_ingredient_overview')" persistent-hint
                                    v-model="editingObj.showIngredientOverview"></v-checkbox>

                        <v-text-field :label="$t('Imported_From')" v-model="editingObj.sourceUrl"></v-text-field>
                        <v-checkbox :label="$t('Private_Recipe')" :hint="$t('Private_Recipe_Help')" persistent-hint v-model="editingObj._private"></v-checkbox>
                        <ModelSelect mode="tags" model="User" :label="$t('Private_Recipe')" :hint="$t('Private_Recipe_Help')" persistent-hint v-model="editingObj.shared"
                                     append-to-body></ModelSelect>

                    </v-form>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </model-editor-base>

    <v-dialog max-width="600px" v-model="dialogStepManager">
        <v-card>
            <v-card-title>{{ $t('Steps') }}</v-card-title>
            <v-list>
                <vue-draggable handle=".drag-handle" v-model="editingObj.steps" :on-sort="sortSteps">
                    <v-list-item v-for="(s,i) in editingObj.steps" :key="s.id">
                         <v-chip color="primary">{{ i + 1 }}</v-chip> {{s.name}}
                        <template #append>
                            <v-icon class="drag-handle" icon="$dragHandle"></v-icon>
                        </template>
                    </v-list-item>
                </vue-draggable>
            </v-list>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {Recipe} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import StepEditor from "@/components/inputs/StepEditor.vue";
import {VueDraggable} from "vue-draggable-plus";

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
const dialogStepManager = ref(false)

onMounted(() => {
    setupState(props.item, props.itemId)
})

/**
 * called by draggable in step manager dialog when steps are sorted
 */
function sortSteps(){
    editingObj.value.steps.forEach((value, index) => {
        value.order = index
    })
}

</script>

<style scoped>

</style>