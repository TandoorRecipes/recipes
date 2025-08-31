import {MessageType, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {Step} from "@/openapi";

interface StepLike {
        instruction?: string;
        ingredients?: Array<any>;
        showIngredientsTable?: boolean;
}

/**
 * utility function used by splitAllSteps and splitStep to split a single step object into multiple step objects
 * @param step step to split
 * @param split_character character to use as a delimiter between steps
 */
function splitStepObject<T extends StepLike>(step: T, split_character: string) {
    let steps: T[] = []
    if (step.instruction){
        step.instruction.split(split_character).forEach(part => {
            if (part.trim() !== '') {
                steps.push({instruction: part, ingredients: [], time: 0, showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients!})
            }
        })
        steps[0].ingredients = step.ingredients // put all ingredients from the original step in the ingredients of the first step of the split step list
    }
    return steps
}

/**
 * Splits all steps of a given recipe_json at the split character (e.g. \n or \n\n)
 * @param split_character character to split steps at
 */
export function splitAllSteps<T extends StepLike>(orig_steps: T[], split_character: string) {
    let steps: T[] = []
    if (orig_steps) {
        orig_steps.forEach(step => {
            steps = steps.concat(splitStepObject(step, split_character))
        })
        orig_steps.splice(0, orig_steps.length, ...steps) // replace all steps with the split steps
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }

}

/**
 * Splits the given step at the split character (e.g. \n or \n\n)
 * @param step step to split
 * @param split_character character to use as a delimiter between steps
 */
export function splitStep<T extends StepLike>(steps: T[], step: T, split_character: string) {
    if (steps){
        let old_index = steps.findIndex(x => x === step)
        let new_steps = splitStepObject(step, split_character)
        steps.splice(old_index, 1, ...new_steps)
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }
}

/**
 * Merge all steps of a given recipe_json into one
 */
export function mergeAllSteps<T extends StepLike>(steps: T[]) {
    let step = {instruction: '', ingredients: [], showIngredientsTable: useUserPreferenceStore().userSettings.showStepIngredients!} as T
    if (steps) {
        step.instruction = steps.map(s => s.instruction).join('\n')
        step.ingredients = steps.flatMap(s => s.ingredients)
        steps.splice(0, steps.length, step) // replace all steps with the merged step
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "no steps found to split")
    }
}