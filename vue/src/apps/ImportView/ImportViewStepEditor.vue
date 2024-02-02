<template>
    <div v-if="recipe_json !== undefined" class="mt-2 mt-md-0">
        <h5>Steps</h5>
        <div class="row">
            <div class="col col-md-12 text-center">
                <b-button @click="autoSortIngredients()" variant="secondary" v-b-tooltip.hover v-if="recipe_json.steps.length > 1"
                          :title="$t('Auto_Sort_Help')"><i class="fas fa-random"></i> {{ $t('Auto_Sort') }}
                </b-button>
                <b-button @click="splitAllSteps('\n')" variant="secondary" class="ml-1" v-b-tooltip.hover
                          :title="$t('Split_All_Steps')"><i
                    class="fas fa-expand-arrows-alt"></i> {{ $t('All') }}
                </b-button>
                <b-button @click="mergeAllSteps()" variant="primary" class="ml-1" v-b-tooltip.hover
                          :title="$t('Combine_All_Steps')"><i
                    class="fas fa-compress-arrows-alt"></i> {{ $t('All') }}
                </b-button>
            </div>
        </div>
        <div class="row mt-2" v-for="(s, index) in recipe_json.steps"
             v-bind:key="index">
            <div class="col col-md-4 d-none d-md-block">
                <draggable :list="s.ingredients" group="ingredients"
                           :empty-insert-threshold="10">
                    <b-list-group-item v-for="i in s.ingredients"
                                       v-bind:key="i.original_text"><i
                        class="fas fa-arrows-alt mr-2"></i>
                        <b-badge variant="light">{{ i.amount.toFixed(2) }}</b-badge>
                        <b-badge variant="secondary" v-if="i.unit">{{ i.unit.name }}</b-badge>
                        <b-badge variant="info" v-if="i.food">{{ i.food.name }}</b-badge>
                        <i>{{ i.original_text }}</i>
                        <b-button @click="prepareIngredientEditModal(s,i)" v-b-modal.ingredient_edit_modal class="float-right btn-sm"><i class="fas fa-pencil-alt"></i></b-button>
                    </b-list-group-item>
                </draggable>
            </div>
            <div class="col col-md-8 col-12">
                <b-input-group>
                    <b-textarea
                        style="white-space: pre-wrap" v-model="s.instruction"
                        max-rows="10"></b-textarea>
                    <b-input-group-append>
                        <b-button variant="secondary" @click="splitStep(s,'\n')"><i
                            class="fas fa-expand-arrows-alt"></i></b-button>
                        <b-button variant="danger"
                                  @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s),1)">
                            <i class="fas fa-trash-alt"></i>
                        </b-button>

                    </b-input-group-append>
                </b-input-group>

                <div class="text-center mt-1">
                    <b-button @click="mergeStep(s)" variant="primary"
                              v-if="index + 1 < recipe_json.steps.length"><i
                        class="fas fa-compress-arrows-alt"></i>
                    </b-button>

                    <b-button variant="success"
                              @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s) +1,0,{ingredients:[], instruction: ''})">
                        <i class="fas fa-plus"></i>
                    </b-button>

                </div>
            </div>

            <b-modal id="ingredient_edit_modal" ref="ingredient_edit_modal" :title="$t('Edit')" @hidden="destroyIngredientEditModal">
                <div v-if="current_edit_ingredient !== null">
                    <b-form-group v-bind:label="$t('Original_Text')" class="mb-3">
                        <b-form-input v-model="current_edit_ingredient.original_text" type="text" disabled></b-form-input>
                    </b-form-group>

                    <b-form-group v-bind:label="$t('Amount')" class="mb-3">
                        <b-form-input v-model.number="current_edit_ingredient.amount" type="number"></b-form-input>
                    </b-form-group>

                    <b-form-group v-bind:label="$t('Unit')" class="mb-3" v-if="current_edit_ingredient.unit !== null">
                        <b-form-input v-model="current_edit_ingredient.unit.name" type="text"></b-form-input>
                    </b-form-group>

                    <b-form-group v-bind:label="$t('Food')" class="mb-3">
                        <b-form-input v-model="current_edit_ingredient.food.name" type="text"></b-form-input>
                    </b-form-group>
                    <b-form-group v-bind:label="$t('Note')" class="mb-3">
                        <b-form-input v-model="current_edit_ingredient.note" type="text"></b-form-input>
                    </b-form-group>
                </div>

                <template v-slot:modal-footer>
                    <div class="row w-100">

                        <div class="col-auto justify-content-end">
                            <b-button class="mx-1" @click="destroyIngredientEditModal()">{{ $t('Ok') }}</b-button>
                            <b-button class="mx-1" @click="removeIngredient(current_edit_step,current_edit_ingredient);destroyIngredientEditModal()" variant="danger">{{ $t('Delete') }}</b-button>
                        </div>
                    </div>
                </template>
            </b-modal>
        </div>
    </div>
</template>

<script>


import draggable from "vuedraggable";
import stringSimilarity from "string-similarity"
import {getUserPreference} from "@/utils/utils"

export default {
    name: "ImportViewStepEditor",
    components: {
        draggable
    },
    props: {
        recipe: undefined
    },
    data() {
        return {
            recipe_json: undefined,
            current_edit_ingredient: null,
            current_edit_step: null,
            user_preferences: null,
        }
    },
    watch: {
        recipe_json: function () {
            this.$emit('change', this.recipe_json)
        },
    },
    mounted() {
        this.recipe_json = this.recipe
        this.user_preferences = getUserPreference();
    },
    methods: {
        /**
         * utility function used by splitAllSteps and splitStep to split a single step object into multiple step objects
         * @param step: single step
         * @param split_character: character to split steps at
         * @return array of step objects
         */
        splitStepObject: function (step, split_character) {
            let steps = []
            step.instruction.split(split_character).forEach(part => {
                if (part.trim() !== '') {
                    steps.push({'instruction': part, 'ingredients': [], 'show_ingredients_table': this.user_preferences.show_step_ingredients})
                }
            })
            steps[0].ingredients = step.ingredients // put all ingredients from the original step in the ingredients of the first step of the split step list
            return steps
        },
        /**
         * Splits all steps of a given recipe_json at the split character (e.g. \n or \n\n)
         * @param split_character: character to split steps at
         */
        splitAllSteps: function (split_character) {
            let steps = []
            this.recipe_json.steps.forEach(step => {
                steps = steps.concat(this.splitStepObject(step, split_character))
            })
            this.recipe_json.steps = steps
        },
        /**
         * Splits the given step at the split character (e.g. \n or \n\n)
         * @param step: step ingredients to split
         * @param split_character: character to split steps at
         */
        splitStep: function (step, split_character) {
            let old_index = this.recipe_json.steps.findIndex(x => x === step)
            let new_steps = this.splitStepObject(step, split_character)
            this.recipe_json.steps.splice(old_index, 1, ...new_steps)
        },
        /**
         * Merge all steps of a given recipe_json into one
         */
        mergeAllSteps: function () {
            let step = {'instruction': '', 'ingredients': []}
            this.recipe_json.steps.forEach(s => {
                step.instruction += s.instruction + '\n'
                step.ingredients = step.ingredients.concat(s.ingredients)
            })
            this.recipe_json.steps = [step]
        },
        /**
         * Merge two steps (the given and next one)
         */
        mergeStep: function (step) {
            let step_index = this.recipe_json.steps.findIndex(x => x === step)
            let removed_steps = this.recipe_json.steps.splice(step_index, 2)

            this.recipe_json.steps.splice(step_index, 0, {
                'instruction': removed_steps.flatMap(x => x.instruction).join('\n'),
                'ingredients': removed_steps.flatMap(x => x.ingredients)
            })
        },
        /**
         * automatically assign ingredients to steps based on text matching
         */
        autoSortIngredients: function () {
            let ingredients = this.recipe_json.steps.flatMap(s => s.ingredients)
            this.recipe_json.steps.forEach(s => s.ingredients = [])

            ingredients.forEach(i => {
                let found = false
                this.recipe_json.steps.forEach(s => {
                    if (s.instruction.includes(i.food.name.trim()) && !found) {
                        found = true
                        s.ingredients.push(i)
                    }
                })
                if (!found) {
                    let best_match = {rating: 0, step: this.recipe_json.steps[0]}
                    this.recipe_json.steps.forEach(s => {
                        let match = stringSimilarity.findBestMatch(i.food.name.trim(), s.instruction.split(' '))
                        if (match.bestMatch.rating > best_match.rating) {
                            best_match = {rating: match.bestMatch.rating, step: s}
                        }
                    })
                    best_match.step.ingredients.push(i)
                    found = true
                }
            })
        },
        /**
         * Prepare variable that holds currently edited ingredient for modal to manipulate it
         * add default placeholder for food/unit in case it is not present, so it can be edited as well
         * @param ingredient
         */
        prepareIngredientEditModal: function (step, ingredient) {
            if (ingredient.unit === null) {
                ingredient.unit = {
                    "name": ""
                }
            }
            if (ingredient.food === null) {
                ingredient.food = {
                    "name": ""
                }
            }
            this.current_edit_ingredient = ingredient
            this.current_edit_step = step
        },
        /**
         * can be called to remove an ingredient from the given step
         * @param step step to remove ingredient from
         * @param ingredient ingredient to remove
         */
        removeIngredient: function (step, ingredient) {
            step.ingredients = step.ingredients.filter((i) => i !== ingredient)
        },
        /**
         * cleanup method called to close modal
         * closes modal UI and cleanups variables
         */
        destroyIngredientEditModal: function () {
            this.$bvModal.hide('ingredient_edit_modal')
            if (this.current_edit_ingredient.unit !== null && this.current_edit_ingredient.unit.name === '') {
                this.current_edit_ingredient.unit = null
            }
            if (this.current_edit_ingredient.food !== null && this.current_edit_ingredient.food.name === '') {
                this.current_edit_ingredient.food = null
            }
            this.current_edit_ingredient = null
            this.current_edit_step = null
        }

    }
}
</script>

<style scoped>

</style>