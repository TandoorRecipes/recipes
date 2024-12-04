<template>

    <!--TODO  name, time, recipe, file(s), ingredients, quick add ingredients -->

    <v-card variant="outlined">
        <template #title>
            <v-card-title>
                <v-chip color="primary">{{ props.stepIndex + 1 }}</v-chip>
                {{ step.name }}
            </v-card-title>
        </template>
        <template v-slot:append>
            <v-btn size="small" variant="plain" icon>
                <v-icon icon="fas fa-sliders-h"></v-icon>
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showTime = true" v-if="!showTime && step.time == 0">{{ $t('Time') }}</v-list-item>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showFile = true" v-if="!showFile &&  step.file == null">{{ $t('File') }}</v-list-item>
                        <v-list-item prepend-icon="fas fa-plus-circle" @click="showRecipe = true" v-if="!showRecipe && step.stepRecipe == null">{{ $t('Recipe') }}</v-list-item>

                        <v-list-item prepend-icon="$delete">{{ $t('Delete') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
            <v-icon icon="$dragHandle" class="drag-handle cursor-move"></v-icon>
        </template>

        <v-card-text>
            <v-text-field
                v-model="step.name"
                label="Step Name"
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

                    <vue-draggable v-model="step.ingredients" handle=".drag-handle" :on-sort="sortIngredients">
                        <v-row v-for="(ingredient, index) in step.ingredients" dense>
                            <v-col cols="2">
                                <v-number-input :id="`id_input_amount_${step.id}_${index}`" :label="$t('Amount')" v-model="ingredient.amount" inset control-variant="stacked"
                                                :min="0"></v-number-input>
                            </v-col>
                            <v-col cols="3">
                                <model-select model="Unit" v-model="ingredient.unit"></model-select>
                            </v-col>
                            <v-col cols="3">
                                <model-select model="Food" v-model="ingredient.food"></model-select>
                            </v-col>
                            <v-col cols="3" @keydown.tab="event => handleIngredientNoteTab(event, index)">
                                <v-text-field :label="$t('Note')" v-model="ingredient.note"></v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn variant="plain" icon>
                                    <v-icon icon="$settings"></v-icon>
                                    <v-menu activator="parent">
                                        <v-list>
                                            <v-list-item @click="step.ingredients.splice(index, 1)" prepend-icon="$delete">{{ $t('Delete') }}</v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-btn>
                                <v-icon icon="$dragHandle" class="drag-handle"></v-icon>
                            </v-col>
                        </v-row>
                    </vue-draggable>
                    <v-btn color="primary" @click="insertAndFocusIngredient()">{{ $t('Add') }}</v-btn>
                    <v-btn color="secondary" @click="dialogIngredientParser = true">{{ $t('AddMany') }}</v-btn>
                </v-col>
                <v-col cols="12">
                    <v-label>{{ $t('Instructions') }}</v-label>
                    <v-alert @click="dialogMarkdownEdit = true" class="mt-2 cursor-text" min-height="52px">
                        {{ step.instruction }}
                    </v-alert>
                </v-col>
            </v-row>


        </v-card-text>
    </v-card>

    <v-dialog
        v-model="dialogMarkdownEdit"
        :max-width="(mobile) ? '100vw': '75vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Instructions')"></v-closable-card-title>
            <step-markdown-editor class="h-100" v-model="step"></step-markdown-editor>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialogIngredientParser"
        :max-width="(mobile) ? '100vw': '75vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Ingredients')"></v-closable-card-title>
            <v-card-text>
                <v-textarea v-model="ingredientTextInput"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="parseAndInsertIngredients()" color="save">{{ $t('Add') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {nextTick, ref} from 'vue'
import {ApiApi, Food, Ingredient, ParsedIngredient, Step} from "@/openapi";
import StepMarkdownEditor from "@/components/inputs/StepMarkdownEditor.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useDisplay} from "vuetify";
import {VueDraggable} from "vue-draggable-plus";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

const step = defineModel<Step>({required: true})

const props = defineProps({
    stepIndex: {type: Number, required: true},
})

const {mobile} = useDisplay()

const showTime = ref(false)
const showRecipe = ref(false)
const showFile = ref(false)

const dialogMarkdownEdit = ref(false)
const dialogIngredientParser = ref(false)

const ingredientTextInput = ref("")

/**
 * sort function called by draggable when ingredient table is sorted
 */
function sortIngredients() {
    step.value.ingredients.forEach((value, index) => {
        value.order = index
    })
}

/**
 *
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
                amount: i.value.amount,
                food: i.value.food,
                unit: i.value.unit,
                note: i.value.note
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
    step.value.ingredients.push({} as Ingredient)
    nextTick(() => {
        document.getElementById(`id_input_amount_${step.value.id}_${step.value.ingredients.length - 1}`).select()
    })
}
</script>


<style scoped>

</style>