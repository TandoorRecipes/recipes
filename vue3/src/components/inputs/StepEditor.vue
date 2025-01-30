<template>

    <!--TODO  name, time, recipe, file(s), ingredients, quick add ingredients -->

    <v-card variant="outlined">
        <template #title>
            <v-card-title>
                <v-chip color="primary">{{ $t('Step') }} {{ props.stepIndex + 1 }}</v-chip>
                {{ step.name }}
            </v-card-title>
        </template>
        <template v-slot:append>
            <v-btn size="small" variant="plain" icon>
                <v-icon icon="fas fa-sliders-h"></v-icon>
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showName = true" v-if="!showName && (step.name == null || step.name == '')">{{
                                $t('Name')
                            }}
                        </v-list-item>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showTime = true" v-if="!showTime && step.time == 0">{{ $t('Time') }}</v-list-item>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showFile = true" v-if="!showFile &&  step.file == null">{{ $t('File') }}</v-list-item>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showRecipe = true" v-if="!showRecipe && step.stepRecipe == null">{{ $t('Recipe') }}</v-list-item>

                        <v-list-item prepend-icon="$delete" @click="emit('delete')">{{ $t('Delete') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
        </template>

        <v-card-text>
            <v-text-field
                v-model="step.name"
                :label="$t('Name')"
                v-if="showName || (step.name != null && step.name != '')"
            ></v-text-field>

            <v-row>
                <v-col cols="12" md="6" v-if="showTime || step.time != 0">
                    <v-number-input :label="$t('Time')" v-model="step.time" :min="0" :step="5" control-variant="split"></v-number-input>
                </v-col>
                <v-col cols="12" md="6" v-if="showRecipe || step.stepRecipe != null">
                    <model-select model="Recipe" v-model="step.stepRecipe" append-to-body></model-select>
                </v-col>
                <v-col cols="12" md="6" v-if="showFile || step.file != null">
                    <model-select model="UserFile" v-model="step.file" append-to-body></model-select>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col cols="12">
                    <v-label>{{ $t('Ingredients') }}</v-label>
                    <div v-if="!mobile">
                        <vue-draggable v-model="step.ingredients" handle=".drag-handle" :on-sort="sortIngredients" empty-insert-threshold="25" group="ingredients">
                            <v-row v-for="(ingredient, index) in step.ingredients" dense>
                                <v-col cols="2" v-if="!ingredient.isHeader">
                                    <v-text-field :id="`id_input_amount_${step.id}_${index}`" :label="$t('Amount')" type="number" v-model="ingredient.amount" density="compact"
                                                  hide-details>

                                        <template #prepend>
                                            <v-icon icon="$dragHandle" class="drag-handle cursor-grab"></v-icon>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="3" v-if="!ingredient.isHeader">
                                    <model-select model="Unit" v-model="ingredient.unit" density="compact" allow-create hide-details></model-select>
                                </v-col>
                                <v-col cols="3" v-if="!ingredient.isHeader">
                                    <model-select model="Food" v-model="ingredient.food" density="compact" allow-create hide-details></model-select>
                                </v-col>
                                <v-col :cols="(ingredient.isHeader) ? 11 : 3" @keydown.tab="event => handleIngredientNoteTab(event, index)">
                                    <v-text-field :label="(ingredient.isHeader) ? $t('Headline') : $t('Note')" v-model="ingredient.note" density="compact" hide-details>
                                        <template #prepend v-if="ingredient.isHeader">
                                            <v-icon icon="$dragHandle" class="drag-handle cursor-grab"></v-icon>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-btn variant="plain" icon>
                                        <v-icon icon="$settings"></v-icon>
                                        <v-menu activator="parent">
                                            <v-list>
                                                <v-list-item @click="step.ingredients.splice(index, 1)" prepend-icon="$delete">{{ $t('Delete') }}</v-list-item>
                                                <v-list-item link>
                                                    <v-switch v-model="step.ingredients[index].isHeader" :label="$t('Headline')" hide-details></v-switch>
                                                </v-list-item>
                                                <v-list-item @click="editingIngredientIndex = index; dialogIngredientSorter = true" prepend-icon="fa-solid fa-sort">{{
                                                        $t('Move')
                                                    }}
                                                </v-list-item>

                                            </v-list>
                                        </v-menu>
                                    </v-btn>

                                </v-col>
                            </v-row>
                        </vue-draggable>
                    </div>

                    <v-list v-if="mobile">
                        <vue-draggable v-model="step.ingredients" handle=".drag-handle" :on-sort="sortIngredients" group="ingredients" empty-insert-threshold="25">
                            <v-list-item v-for="(ingredient, index) in step.ingredients" border @click="editingIngredientIndex = index; dialogIngredientEditor = true">
                                <ingredient-string :ingredient="ingredient"></ingredient-string>
                                <template #append>
                                    <v-icon icon="$dragHandle" class="drag-handle"></v-icon>
                                </template>
                            </v-list-item>

                        </vue-draggable>
                    </v-list>

                    <v-btn-group density="compact" class="mt-1">
                        <v-btn color="success" @click="insertAndFocusIngredient()" prepend-icon="$add">{{ $t('Add') }}</v-btn>
                        <v-btn color="warning" @click="dialogIngredientParser = true">
                            <v-icon icon="$add"></v-icon>
                            <v-icon icon="$add"></v-icon>
                        </v-btn>
                    </v-btn-group>
                </v-col>
                <v-col cols="12">
                    <v-label>{{ $t('Instructions') }}</v-label>
                    <v-alert @click="dialogMarkdownEditor = true" class="mt-2 cursor-pointer" min-height="52px">
                        <template v-if="step.instruction != '' && step.instruction != null">
                            {{ step.instruction }}
                        </template>
                        <template v-else>
                            <i> {{ $t('InstructionsEditHelp') }} </i>
                        </template>
                    </v-alert>
                </v-col>
            </v-row>


        </v-card-text>
    </v-card>

    <v-dialog
        v-model="dialogMarkdownEditor"
        :max-width="(mobile) ? '100vw': '75vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Instructions')" v-model="dialogMarkdownEditor"></v-closable-card-title>
            <step-markdown-editor class="h-100" v-model="step"></step-markdown-editor>
            <v-card-actions v-if="!mobile">
                <v-btn @click="dialogMarkdownEditor = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialogIngredientParser"
        :max-width="(mobile) ? '100vw': '75vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Ingredients')" v-model="dialogIngredientParser"></v-closable-card-title>
            <v-card-text>
                <v-textarea v-model="ingredientTextInput" :placeholder="$t('paste_ingredients_placeholder')"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="parseAndInsertIngredients()" color="save">{{ $t('Add') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialogIngredientSorter"
        :max-width="(mobile) ? '100vw': '25vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Move')" v-model="dialogIngredientSorter"
                                   :sub-title="ingredientToString(step.ingredients[editingIngredientIndex])"></v-closable-card-title>
            <v-card-text>
                <v-btn block :disabled="editingIngredientIndex== 0" @click="moveIngredient(editingIngredientIndex, props.stepIndex, 0)">{{ $t('First') }}</v-btn>
                <v-btn block :disabled="editingIngredientIndex == 0" class="mt-1" @click="moveIngredient(editingIngredientIndex, props.stepIndex, editingIngredientIndex - 1)">{{
                        $t('Up')
                    }}
                </v-btn>
                <v-btn block :disabled="editingIngredientIndex + 1 == step.ingredients.length" class="mt-1"
                       @click="moveIngredient(editingIngredientIndex, props.stepIndex, editingIngredientIndex + 1)"> {{ $t('Down') }}
                </v-btn>
                <v-btn block :disabled="editingIngredientIndex + 1 == step.ingredients.length" class="mt-1"
                       @click="moveIngredient(editingIngredientIndex, props.stepIndex, step.ingredients.length - 1)">{{ $t('Last') }}
                </v-btn>
                {{ $t('Step') }}
                <v-btn block v-for="(s,i) in recipe.steps" :disabled="i == props.stepIndex" class="mt-1"
                       @click="moveIngredient(editingIngredientIndex, i, recipe.steps[i].ingredients.length)">{{ i + 1 }} {{ s.name }}
                </v-btn>
            </v-card-text>
            <v-card-actions>

            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="dialogIngredientEditor">
        <v-card v-if="editingIngredientIndex >= 0">
            <v-closable-card-title :title="$t('Ingredient Editor')" v-model="dialogIngredientEditor"></v-closable-card-title>
            <v-card-text>
                <v-form>
                    <v-number-input v-model="step.ingredients[editingIngredientIndex].amount" inset control-variant="stacked" autofocus :label="$t('Amount')"
                                    :min="0" v-if="!step.ingredients[editingIngredientIndex].isHeader"></v-number-input>
                    <model-select model="Unit" v-model="step.ingredients[editingIngredientIndex].unit" :label="$t('Unit')" v-if="!step.ingredients[editingIngredientIndex].isHeader"
                                  allow-create></model-select>
                    <model-select model="Food" v-model="step.ingredients[editingIngredientIndex].food" :label="$t('Food')" v-if="!step.ingredients[editingIngredientIndex].isHeader"
                                  allow-create></model-select>
                    <v-text-field :label="(step.ingredients[editingIngredientIndex].isHeader) ?$t('Headline')  : $t('Note')"
                                  v-model="step.ingredients[editingIngredientIndex].note"></v-text-field>

                    <v-checkbox
                        v-model="step.ingredients[editingIngredientIndex].isHeader"
                        :label="$t('Headline')"
                        :hint="$t('HeaderWarning')"
                        persistent-hint
                        @update:modelValue="step.ingredients[editingIngredientIndex].unit = null; step.ingredients[editingIngredientIndex].food = null; step.ingredients[editingIngredientIndex].amount = 0"
                    ></v-checkbox>
                </v-form>
                <v-btn color="info" class="mt-2" @click="dialogIngredientEditor = false; dialogIngredientSorter = true" prepend-icon="fa-solid fa-sort">{{ $t('Move') }}</v-btn>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialogIngredientEditor = false; deleteIngredientAtIndex(editingIngredientIndex); editingIngredientIndex = -1" color="delete" prepend-icon="$delete">
                    {{ $t('Delete') }}
                </v-btn>
                <v-btn @click="dialogIngredientEditor = false" color="save" prepend-icon="$save">{{ $t('Save') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import {ApiApi, Ingredient, ParsedIngredient, Recipe, Step, Unit} from "@/openapi";
import StepMarkdownEditor from "@/components/inputs/StepMarkdownEditor.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useDisplay} from "vuetify";
import {VueDraggable} from "vue-draggable-plus";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import IngredientString from "@/components/display/IngredientString.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {ingredientToString} from "@/utils/model_utils";

const emit = defineEmits(['delete'])

const step = defineModel<Step>({required: true})
const recipe = defineModel<Recipe>('recipe', {required: true})
const props = defineProps({
    stepIndex: {type: Number, required: true},
})

const {mobile} = useDisplay()

const showName = ref(false)
const showTime = ref(false)
const showRecipe = ref(false)
const showFile = ref(false)

const dialogMarkdownEditor = ref(false)
const dialogIngredientEditor = ref(false)
const dialogIngredientParser = ref(false)
const dialogIngredientSorter = ref(false)

const editingIngredientIndex = ref(0)
const ingredientTextInput = ref("")

const defaultUnit = ref<null | Unit>(null)

onMounted(() => {
    let api = new ApiApi()

    if (useUserPreferenceStore().userSettings.defaultUnit) {
        api.apiUnitList({query: useUserPreferenceStore().userSettings.defaultUnit}).then(r => {
            r.results.forEach(u => {
                if (u.name == useUserPreferenceStore().userSettings.defaultUnit) {
                    defaultUnit.value = u
                }
            })
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }
})

/**
 * move the ingredient at the given index of this step to the step and index at that step given in the target
 * @param sourceIngredientIndex index of the ingredient to move
 * @param targetStepIndex index of the step to place ingredient into
 * @param targetIngredientIndex place in the target steps ingredient list to insert into
 */
function moveIngredient(sourceIngredientIndex: number, targetStepIndex: number, targetIngredientIndex: number,) {
    let ingredient = step.value.ingredients[sourceIngredientIndex]
    step.value.ingredients.splice(sourceIngredientIndex, 1)
    recipe.value.steps[targetStepIndex].ingredients.splice(targetIngredientIndex, 0, ingredient)

    // close dialog if moved to a new step, update index if its in the same step
    if (targetStepIndex != props.stepIndex) {
        dialogIngredientSorter.value = false
    } else {
        editingIngredientIndex.value = targetIngredientIndex
    }
}

/**
 * sort function called by draggable when ingredient table is sorted
 */
function sortIngredients() {
    step.value.ingredients.forEach((value, index) => {
        value.order = index
    })
}

/**
 * parse ingredients from text input and add them as ingredients
 */
function parseAndInsertIngredients() {
    let api = new ApiApi()
    let promises: Promise<ParsedIngredient>[] = []
    let ingredientList = ingredientTextInput.value.split(/\r?\n/)
    ingredientList.forEach(ingredientString => {
        if (ingredientString.trim() != "") {
            promises.push(api.apiIngredientFromStringCreate({ingredientString: {text: ingredientString}}))
        }
    })
    Promise.allSettled(promises).then(r => {
        r.forEach(i => {
            step.value.ingredients.push({
                amount: i.amount,
                food: i.food,
                unit: i.unit,
                note: i.note
            } as Ingredient)
        })
        ingredientTextInput.value = ""
        dialogIngredientParser.value = false
    })
}

/**
 * handle tab presses on the note field of the last ingredient to insert a new ingredient
 * @param event key event
 * @param index index tab was pressed at
 */
function handleIngredientNoteTab(event: KeyboardEvent, index: number) {
    if (step.value.ingredients.length == (index + 1) && !event.shiftKey && !event.altKey && !event.ctrlKey) {
        event.preventDefault()
        insertAndFocusIngredient()
    }
}

/**
 * insert a new ingredient and focus its first input
 */
function insertAndFocusIngredient() {
    let ingredient = {} as Ingredient

    if (defaultUnit.value != null) {
        ingredient.unit = defaultUnit.value
    }

    step.value.ingredients.push(ingredient)
    nextTick(() => {
        if (mobile.value) {
            editingIngredientIndex.value = step.value.ingredients.length - 1
            dialogIngredientEditor.value = true
        } else {
            document.getElementById(`id_input_amount_${step.value.id}_${step.value.ingredients.length - 1}`).select()
        }
    })
}

/**
 * delete ingredient from step at given index
 * @param index
 */
function deleteIngredientAtIndex(index: number) {
    step.value.ingredients.splice(index, 1)
}

</script>


<style scoped>

</style>