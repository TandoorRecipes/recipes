<template>
    <v-dialog
        v-model="dialog"
        :max-width="(mobile) ? '100vw': '25vw'"
        :fullscreen="mobile">
        <v-card>
            <v-closable-card-title :title="$t('Move')" v-model="dialog"
                                   :sub-title="ingredientToString(step.ingredients[editingIngredientIndex])"></v-closable-card-title>
            <v-card-text>
                <template v-if="step.ingredients.length > 1">
                    {{$t('Order')}}
                    <v-btn block :disabled="editingIngredientIndex== 0" @click="moveIngredient(editingIngredientIndex, props.stepIndex, 0)">{{ $t('First') }}</v-btn>
                    <v-btn block :disabled="editingIngredientIndex == 0" class="mt-1" @click="moveIngredient(editingIngredientIndex, props.stepIndex, editingIngredientIndex - 1)">
                        {{
                            $t('Up')
                        }}
                    </v-btn>
                    <v-btn block :disabled="editingIngredientIndex + 1 == step.ingredients.length" class="mt-1"
                           @click="moveIngredient(editingIngredientIndex, props.stepIndex, editingIngredientIndex + 1)"> {{ $t('Down') }}
                    </v-btn>
                    <v-btn block :disabled="editingIngredientIndex + 1 == step.ingredients.length" class="mt-1"
                           @click="moveIngredient(editingIngredientIndex, props.stepIndex, step.ingredients.length - 1)">{{ $t('Last') }}
                    </v-btn>
                </template>

                {{ $t('MoveToStep') }}
                <v-btn block v-for="(s,i) in recipe.steps" :disabled="i == props.stepIndex" class="mt-1"
                       @click="moveIngredient(editingIngredientIndex, i, recipe.steps[i].ingredients.length)">{{ i + 1 }} <span v-if="'name' in s">{{ s.name }}</span>
                </v-btn>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {Recipe, SourceImportRecipe, SourceImportStep, Step} from "@/openapi";
import {ingredientToString} from "@/utils/model_utils.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref, watch} from "vue";
import {useDisplay} from "vuetify/framework";

const dialog = defineModel<Boolean>({required: true, default: false})
const step = defineModel<Step | SourceImportStep>('step', {required: true})
const recipe = defineModel<Recipe | SourceImportRecipe>('recipe', {required: true})
const props = defineProps({
    stepIndex: {type: Number, required: true},
    ingredientIndex: {type: Number, required: true},
})

const {mobile} = useDisplay()

watch(() => props.ingredientIndex, () => {
    console.log('updated ingredient inex')
    editingIngredientIndex.value = props.ingredientIndex
})

const editingIngredientIndex = ref(0)

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
        dialog.value = false
    } else {
        editingIngredientIndex.value = targetIngredientIndex
    }
}

</script>


<style scoped>

</style>