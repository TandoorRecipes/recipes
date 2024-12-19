<template>
    <v-container>
        <v-row>
            <v-col>

                <v-stepper v-model="stepper">
                    <template v-slot:default="{ prev, next }">
                        <v-stepper-header>
                            <v-stepper-item :title="$t('Import')" value="1"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Image')" value="2"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Keywords')" value="3"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Steps')" value="4"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Save')" value="5"></v-stepper-item>
                        </v-stepper-header>

                        <v-stepper-window>
                            <v-stepper-window-item value="1">
                                <v-card :loading="loading">
                                    <v-card-text>
                                        <v-text-field :label="$t('Website') + ' (https://...)'" v-model="importUrl">
                                            <template #append>
                                                <v-btn color="primary" icon="fa-solid fa-cloud-arrow-down fa-fw" @click="loadRecipeFromUrl()"></v-btn>
                                            </template>
                                        </v-text-field>

                                        <!-- <v-textarea :placeholder="$t('paste_json')"></v-textarea> -->

                                        <v-alert variant="tonal" v-if="importResponse.duplicates && importResponse.duplicates.length > 0">
                                            <v-alert-title>{{ $t('Duplicate') }}</v-alert-title>
                                            {{ $t('DuplicateFoundInfo') }}
                                            <v-chip-group>
                                                <v-chip :to="{name: 'view_recipe', params: {id: r.id}}" v-for="r in importResponse.duplicates" :key="r.id"> {{ r.name }}</v-chip>
                                            </v-chip-group>
                                            <v-btn color="primary" class="float-right" @click="stepper = '2'">{{ $t('Continue') }}</v-btn>
                                        </v-alert>
                                    </v-card-text>
                                </v-card>
                            </v-stepper-window-item>
                            <v-stepper-window-item value="2">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <h2 class="text-h5">{{ $t('Selected') }}</h2>
                                        <v-img max-height="30vh" :src="importResponse.recipe.imageUrl"></v-img>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <h2 class="text-h5">{{ $t('Available') }}</h2>
                                        <v-row dense>
                                            <v-col cols="4" v-for="i in importResponse.images">
                                                <v-img max-height="10vh" cover aspect-ratio="1" :src="i" @click="importResponse.recipe.imageUrl = i"></v-img>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>

                            </v-stepper-window-item>
                            <v-stepper-window-item value="3">
                                <v-row>
                                    <v-col class="text-center">
                                        <v-btn-group border divided>
                                            <v-btn prepend-icon="fa-solid fa-square-check" @click="setAllKeywordsImportStatus(true)">{{ $t('SelectAll') }}</v-btn>
                                            <v-btn prepend-icon="fa-solid fa-square-minus" @click="setAllKeywordsImportStatus(false)">{{ $t('SelectNone') }}</v-btn>
                                        </v-btn-group>
                                    </v-col>
                                </v-row>

                                <v-list>
                                    <v-list-item border v-for="k in importResponse.recipe.keywords" :key="k" :class="{'bg-success': k.importKeyword}"
                                                 @click="k.importKeyword = !k.importKeyword">
                                        {{ k.label }}
                                        <template #append>
                                            <v-checkbox-btn :model-value="k.importKeyword"></v-checkbox-btn>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-stepper-window-item>
                            <v-stepper-window-item value="4">
                                <v-row>
                                    <v-col class="text-center">
                                        <v-btn-group border divided>
                                            <v-btn prepend-icon="fa-solid fa-shuffle" @click="autoSortIngredients()">{{ $t('Auto_Sort') }}</v-btn>
                                            <v-btn prepend-icon="fa-solid fa-maximize" @click="splitAllSteps('\n')">{{ $t('Split') }}</v-btn>
                                            <v-btn prepend-icon="fa-solid fa-minimize" @click="mergeAllSteps()">{{ $t('Merge') }}</v-btn>
                                        </v-btn-group>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-list>
                                            <v-list-item v-for="(s,i) in importResponse.recipe.steps" :key="i">
                                                <v-list-item-title>
                                                    <v-chip color="primary">#{{ i + 1 }}</v-chip>
                                                    <v-btn variant="plain" size="small" class="float-right">
                                                        <v-icon icon="$settings"></v-icon>
                                                        <v-menu activator="parent">
                                                            <v-list>
                                                                <v-list-item prepend-icon="$delete" @click="deleteStep(s)">{{ $t('Delete') }}</v-list-item>
                                                                <v-list-item prepend-icon="fa-solid fa-maximize" @click="splitStep(s, '\n')">{{ $t('Split') }}</v-list-item>
                                                            </v-list>
                                                        </v-menu>
                                                    </v-btn>
                                                </v-list-item-title>
                                                <v-row>
                                                    <v-col>
                                                        <v-list>
                                                            <vue-draggable v-model="s.ingredients" group="ingredients" drag-class="drag-handle">
                                                                <v-list-item v-for="i in s.ingredients" border>
                                                                    <v-icon size="small" class="drag-handle cursor-grab" icon="$dragHandle"></v-icon>
                                                                    {{ i.amount }} {{ i.unit.name }} {{ i.food.name }}
                                                                    <template #append>
                                                                        <v-btn size="small" color="edit" @click="editingIngredient = i; dialog=true">
                                                                            <v-icon icon="$edit"></v-icon>
                                                                        </v-btn>
                                                                    </template>
                                                                </v-list-item>
                                                            </vue-draggable>
                                                        </v-list>
                                                    </v-col>
                                                    <v-col>
                                                        <v-textarea class="mt-2" v-model="s.instruction"></v-textarea>
                                                    </v-col>
                                                </v-row>

                                            </v-list-item>
                                        </v-list>
                                    </v-col>
                                </v-row>

                                <v-dialog max-width="450px" v-model="dialog">
                                    <v-card>
                                        <v-closable-card-title v-model="dialog" :title="$t('Ingredient Editor')"></v-closable-card-title>
                                        <v-card-text>
                                            <v-text-field :label="$t('Original_Text')" v-model="editingIngredient.originalText" disabled></v-text-field>
                                            <v-text-field :label="$t('Amount')" v-model="editingIngredient.amount"></v-text-field>
                                            <v-text-field :label="$t('Unit')" v-model="editingIngredient.unit.name"></v-text-field>
                                            <v-text-field :label="$t('Food')" v-model="editingIngredient.food.name"></v-text-field>
                                            <v-text-field :label="$t('Note')" v-model="editingIngredient.note"></v-text-field>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn class="float-right" color="save" @click="dialog = false">{{ $t('Save') }}</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                            </v-stepper-window-item>
                            <v-stepper-window-item value="5">
                                <v-card :loading="loading">
                                    <v-card-title>{{ importResponse.recipe.name }}</v-card-title>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-img v-if="importResponse.recipe.imageUrl" :src="importResponse.recipe.imageUrl"></v-img>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field :label="$t('Name')" v-model="importResponse.recipe.name"></v-text-field>
                                            <v-number-input :label="$t('Servings')" v-model="importResponse.recipe.servings"></v-number-input>
                                            <v-text-field :label="$t('ServingsText')" v-model="importResponse.recipe.servingsText"></v-text-field>
                                            <v-textarea :label="$t('Description')" v-model="importResponse.recipe.description" clearable></v-textarea>

                                            <v-btn class="mt-5" size="large" @click="createRecipeFromImport()" color="success" :loading="loading">{{ $t('Import') }}</v-btn>
                                        </v-col>
                                    </v-row>

                                </v-card>
                            </v-stepper-window-item>
                        </v-stepper-window>

                        <v-stepper-actions @click:next="next"
                                           @click:prev="prev"
                                           :next-text="$t('Next')"
                                           :prev-text="$t('Back')"
                                           :disabled="Object.keys(importResponse).length == 0">
                        </v-stepper-actions>
                    </template>

                </v-stepper>


            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>

import {nextTick, ref} from "vue";
import {ApiApi, RecipeFromSourceResponse, type SourceImportIngredient, SourceImportStep} from "@/openapi";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import {useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {VueDraggable} from "vue-draggable-plus";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import KeywordsBar from "@/components/display/KeywordsBar.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput'

const router = useRouter()

const stepper = ref("1")
const dialog = ref(false)
const loading = ref(false)
const importUrl = ref("")

const importResponse = ref({} as RecipeFromSourceResponse)
const editingIngredient = ref({} as SourceImportIngredient)

/**
 * call server to load recipe from a given URl
 */
function loadRecipeFromUrl() {
    let api = new ApiApi()
    loading.value = true
    api.apiRecipeFromSourceCreate({recipeFromSource: {url: importUrl.value}}).then(r => {
        importResponse.value = r
        if (r.duplicates.length == 0) {
            // automatically continue only if no duplicates were found
            stepper.value = "2"
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * create recipe in database
 */
function createRecipeFromImport() {
    let api = new ApiApi()

    if (importResponse.value.recipe) {
        loading.value = true
        importResponse.value.recipe.keywords = importResponse.value.recipe.keywords.filter(k => k.importKeyword)

        api.apiRecipeCreate({recipe: importResponse.value.recipe}).then(r => {
            api.apiRecipeImageUpdate({id: r.id, imageUrl: importResponse.value.recipe?.imageUrl}).then(rI => {
                router.push({name: 'view_recipe', params: {id: r.id}})
            }).finally(() => {
                loading.value = false
            })
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }
}

/**
 * deletes the given step from the local recipe
 * @param step step to delete
 */
function deleteStep(step: SourceImportStep) {
    if (importResponse.value.recipe) {
        importResponse.value.recipe.steps.splice(importResponse.value.recipe.steps.findIndex(x => x === step), 1)
    }
}

/**
 * utility function used by splitAllSteps and splitStep to split a single step object into multiple step objects
 * @param step step to split
 * @param split_character character to use as a delimiter between steps
 */
function splitStepObject(step: SourceImportStep, split_character: string) {
    let steps: SourceImportStep[] = []
    step.instruction.split(split_character).forEach(part => {
        if (part.trim() !== '') {
            steps.push({instruction: part, ingredients: [], showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients!})
        }
    })
    steps[0].ingredients = step.ingredients // put all ingredients from the original step in the ingredients of the first step of the split step list
    return steps
}

/**
 * Splits all steps of a given recipe_json at the split character (e.g. \n or \n\n)
 * @param split_character character to split steps at
 */
function splitAllSteps(split_character: string) {
    let steps: SourceImportStep[] = []
    if (importResponse.value.recipe) {
        importResponse.value.recipe.steps.forEach(step => {
            steps = steps.concat(splitStepObject(step, split_character))
        })
        importResponse.value.recipe.steps = steps
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }

}

/**
 * Splits the given step at the split character (e.g. \n or \n\n)
 * @param step step to split
 * @param split_character character to use as a delimiter between steps
 */
function splitStep(step: SourceImportStep, split_character: string) {
    if (importResponse.value.recipe) {
        let old_index = importResponse.value.recipe.steps.findIndex(x => x === step)
        let new_steps = splitStepObject(step, split_character)
        importResponse.value.recipe.steps.splice(old_index, 1, ...new_steps)
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }
}

/**
 * Merge all steps of a given recipe_json into one
 */
function mergeAllSteps() {
    let step = {instruction: '', ingredients: [], showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients!} as SourceImportStep
    if (importResponse.value.recipe) {
        importResponse.value.recipe.steps.forEach(s => {
            step.instruction += s.instruction + '\n'
            step.ingredients = step.ingredients.concat(s.ingredients)
        })
        importResponse.value.recipe.steps = [step]
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }
}

/**
 * Merge two steps (the given and next one)
 */
function mergeStep(step: SourceImportStep) {
    if (importResponse.value.recipe) {
        let step_index = importResponse.value.recipe.steps.findIndex(x => x === step)
        let removed_steps = importResponse.value.recipe.steps.splice(step_index, 2)

        importResponse.value.recipe.steps.splice(step_index, 0, {
            instruction: removed_steps.flatMap(x => x.instruction).join('\n'),
            ingredients: removed_steps.flatMap(x => x.ingredients),
            showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients!
        })
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }

}

/**
 * automatically assign ingredients to steps based on text matching
 */
function autoSortIngredients() {
    if (importResponse.value.recipe) {
        let ingredients = importResponse.value.recipe.steps.flatMap(s => s.ingredients)
        importResponse.value.recipe.steps.forEach(s => s.ingredients = [])

        ingredients.forEach(i => {
            let found = false
            importResponse.value.recipe!.steps.forEach(s => {
                if (s.instruction.includes(i.food.name.trim()) && !found) {
                    found = true
                    s.ingredients.push(i)
                }
            })
            if (!found) {
                importResponse.value.recipe!.steps[0].ingredients.push(i)
            }
            // TODO implement a new "second try" algorithm if no exact match was found
            /*

             if (!found) {
                let best_match = {rating: 0, step: importResponse.value.recipe.steps[0]}
                importResponse.value.recipe.steps.forEach(s => {

                    let match = stringSimilarity.findBestMatch(i.food.name.trim(), s.instruction.split(' '))

                    if (match.bestMatch.rating > best_match.rating) {
                        best_match = {rating: match.bestMatch.rating, step: s}
                    }
                })
                best_match.step.ingredients.push(i)
                found = true
            }
             */
        })
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }
}

/**
 * set the import status for all keywords to the given status
 * @param status if keyword should be imported or not
 */
function setAllKeywordsImportStatus(status: boolean) {
    importResponse.value.recipe?.keywords.forEach(keyword => {
        keyword.importKeyword = status
    })
}

</script>

<style scoped>

</style>