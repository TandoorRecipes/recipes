<template>
    <model-editor-base
        :loading="loading || fileApiLoading"
        :dialog="dialog"
        @save="saveRecipe"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-card-text class="pa-0">
            <v-tabs v-model="tab" :disabled="loading || fileApiLoading" grow>
                <v-tab value="recipe">{{ $t('Recipe') }}</v-tab>
                <v-tab value="steps">{{ $t('Steps') }}</v-tab>
                <v-tab value="properties">{{ $t('Properties') }}</v-tab>
                <v-tab value="settings">{{ $t('Miscellaneous') }}</v-tab>
            </v-tabs>
        </v-card-text>
        <v-card-text v-if="!isSpaceAtRecipeLimit(useUserPreferenceStore().activeSpace)">
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="recipe">

                    <v-form :disabled="loading || fileApiLoading">
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-textarea :label="$t('Description')" v-model="editingObj.description" clearable counter="512" maxlength="512" rows="2" auto-grow></v-textarea>

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-file-upload v-model="file"
                                               :title="(mobile) ? $t('Select_File') : $t('DragToUpload')"
                                               :browse-text="$t('Select_File')"
                                               :divider-text="$t('or')"
                                               :density="(mobile) ? 'compact' : 'comfortable'"
                                >
                                </v-file-upload>
                            </v-col>
                            <v-col cols="12" md="6" v-if="editingObj.image">
                                <v-img style="max-height: 180px" cover class="mb-2" :src="editingObj.image">
                                    <v-btn color="delete" class="float-right mt-2 mr-2" prepend-icon="$delete" v-if="editingObj.image" @click="deleteImage()">{{
                                            $t('Delete')
                                        }}
                                    </v-btn>
                                </v-img>
                            </v-col>
                        </v-row>

                        <v-label>{{ $t('Keywords') }}</v-label>
                        <model-select mode="tags" v-model="editingObj.keywords" model="Keyword" allow-create></model-select>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-number-input :label="$t('WaitingTime')" v-model="editingObj.waitingTime" :step="5"></v-number-input>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-number-input :label="$t('WorkingTime')" v-model="editingObj.workingTime" :step="5"></v-number-input>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-number-input :label="$t('Servings')" v-model="editingObj.servings"></v-number-input>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('ServingsText')" v-model="editingObj.servingsText"></v-text-field>
                            </v-col>
                        </v-row>

                        <!--                        <closable-help-alert :text="$t('RecipeStepsHelp')" :action-text="$t('Steps')" @click="tab='steps'"></closable-help-alert>-->
                        <v-btn @click="tab='steps'" class="float-right" variant="tonal" append-icon="fa-solid fa-arrow-right">{{ $t('Steps') }}</v-btn>
                    </v-form>

                </v-tabs-window-item>
                <v-tabs-window-item value="steps">
                    <v-form :disabled="loading || fileApiLoading">
                        <v-row v-for="(s,i ) in editingObj.steps" :key="s.id">
                            <v-col>
                                <step-editor v-model="editingObj.steps[i]" v-model:recipe="editingObj" :step-index="i" @delete="deleteStepAtIndex(i)"></step-editor>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-center">
                                <v-btn-group density="compact" divided border>
                                    <v-btn color="success" prepend-icon="fa-solid fa-plus" @click="addStep()">{{ $t('Add_Step') }}</v-btn>
                                    <v-btn color="warning" @click="dialogStepManager = true" :disabled="editingObj.steps.length < 2">
                                        <v-icon icon="fa-solid fa-arrow-down-1-9"></v-icon>
                                    </v-btn>

                                    <v-btn prepend-icon="fa-solid fa-maximize" @click="handleSplitAllSteps" :disabled="editingObj.steps.length < 1"><span
                                        v-if="!mobile">{{ $t('Split') }}</span></v-btn>
                                    <v-btn prepend-icon="fa-solid fa-minimize" @click="handleMergeAllSteps" :disabled="editingObj.steps.length < 2"><span
                                        v-if="!mobile">{{ $t('Merge') }}</span></v-btn>
                                </v-btn-group>


                            </v-col>
                        </v-row>

                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="properties">
                    <v-form :disabled="loading || fileApiLoading">
                        <closable-help-alert :text="$t('PropertiesFoodHelp')"></closable-help-alert>
                        <properties-editor v-model="editingObj.properties" :amount-for="$t('Serving')"></properties-editor>
                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="settings">
                    <v-form :disabled="loading || fileApiLoading">
                        <v-checkbox :label="$t('show_ingredient_overview')"
                                    v-model="editingObj.showIngredientOverview"></v-checkbox>

                        <v-text-field :label="$t('Imported_From')" v-model="editingObj.sourceUrl"></v-text-field>
                        <v-checkbox :label="$t('Private_Recipe')" persistent-hint :hint="$t('Private_Recipe_Help')" v-model="editingObj._private"></v-checkbox>
                        <model-select mode="tags" model="User" :label="$t('Share')" persistent-hint v-model="editingObj.shared"
                                      append-to-body v-if="editingObj._private"></model-select>

                        <div class="mt-2" v-if="editingObj.filePath">
                            {{ $t('ExternalRecipe') }}
                            <v-text-field readonly v-model="editingObj.filePath"></v-text-field>

                            <v-btn prepend-icon="$delete" color="error" :loading="loading">{{ $t('delete_title', {type: $t('ExternalRecipe')}) }}
                                <delete-confirm-dialog :object-name="editingObj.filePath" :model-name="$t('ExternalRecipe')" @delete="deleteExternalFile()"></delete-confirm-dialog>
                            </v-btn>
                        </div>

                    </v-form>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
        <v-card-text v-if="isSpaceAtRecipeLimit(useUserPreferenceStore().activeSpace)">
            <v-alert color="warning" icon="fa-solid fa-triangle-exclamation">
                {{ $t('SpaceLimitReached') }}
                <v-btn color="success" variant="flat" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
            </v-alert>
        </v-card-text>
    </model-editor-base>

    <v-dialog max-width="600px" v-model="dialogStepManager">
        <v-card>
            <v-card-title>{{ $t('Steps') }}</v-card-title>
            <v-list>
                <vue-draggable handle=".drag-handle" v-model="editingObj.steps" :on-sort="sortSteps">
                    <v-list-item v-for="(s,i) in editingObj.steps" :key="s.id">
                        <v-chip color="primary">{{ i + 1 }}</v-chip>
                        {{ s.name }}
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

import {onMounted, PropType, ref, shallowRef, watch} from "vue";
import {ApiApi, Ingredient, Recipe, Step} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import StepEditor from "@/components/inputs/StepEditor.vue";
import {VueDraggable} from "vue-draggable-plus";
import PropertiesEditor from "@/components/inputs/PropertiesEditor.vue";
import {useFileApi} from "@/composables/useFileApi";
import {VFileUpload} from 'vuetify/labs/VFileUpload'
import ClosableHelpAlert from "@/components/display/ClosableHelpAlert.vue";
import {useDisplay} from "vuetify";
import {isSpaceAtRecipeLimit} from "@/utils/logic_utils";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {mergeAllSteps, splitAllSteps} from "@/utils/step_utils.ts";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";


const props = defineProps({
    item: {type: {} as PropType<Recipe>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Recipe>, required: false, default: {} as Recipe},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<Recipe>('Recipe', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)
const {mobile} = useDisplay()

const tab = ref("recipe")
const dialogStepManager = ref(false)

const {fileApiLoading, updateRecipeImage} = useFileApi()
const file = shallowRef<File | null>(null)

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.steps = [] as Step[]
            editingObj.value.internal = true //TODO make database default after v2
        },
        itemDefaults: props.itemDefaults,
    })
}

/**
 * save recipe via normal saveMethod and update image afterward if it was changed
 */
function saveRecipe() {
    saveObject().then(() => {
        if (file.value != null && editingObj.value.id) {
            updateRecipeImage(editingObj.value.id, file.value).then(r => {
                file.value = null
                setupState(props.item, props.itemId)
            })
        }
    })
}

/**
 * remove image if delete was manually triggered
 */
function deleteImage() {
    updateRecipeImage(editingObj.value.id!, null).then(r => {
        setupState(props.item, props.itemId)
    })
}

/**
 * add a new step to the recipe
 */
function addStep() {
    editingObj.value.steps.push({
        ingredients: [] as Ingredient[],
        time: 0,
        showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients
    } as Step)
}

/**
 * called by draggable in step manager dialog when steps are sorted
 */
function sortSteps() {
    editingObj.value.steps.forEach((value, index) => {
        value.order = index
    })
}

/**
 * delete a step at the given index of the steps array of the editingObject
 * @param index index to delete at
 */
function deleteStepAtIndex(index: number) {
    editingObj.value.steps.splice(index, 1)
}

function handleMergeAllSteps(): void {
    if (editingObj.value.steps) {
        mergeAllSteps(editingObj.value.steps)
    }
}

function handleSplitAllSteps(): void {
    if (editingObj.value.steps) {
        splitAllSteps(editingObj.value.steps, '\n')
    }
}

/**
 * deletes the external file for the recipe
 */
function deleteExternalFile() {
    let api = new ApiApi()
    loading.value = true
    api.apiRecipeDeleteExternalPartialUpdate({id: editingObj.value.id!, patchedRecipe: editingObj.value}).then(r => {
        editingObj.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>