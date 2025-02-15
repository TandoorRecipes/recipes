import {Ingredient, Recipe} from "@/openapi";

/**
 * returns a string representing an ingredient
 * @param ingredient
 */
export function ingredientToString(ingredient: Ingredient) {
    let content = []

    if (ingredient == undefined) {
        return ''
    }

    if (ingredient.amount != 0) {
        content.push(ingredient.amount)
    }
    if (ingredient.unit) {
        content.push(ingredient.unit.name)
    }
    if (ingredient.food) {
        content.push(ingredient.food.name)
    }
    if (ingredient.note) {
        content.push(`(${ingredient.note})`)
    }
    return content.join(' ')
}


/**
 * returns a list of all ingredients used by the given recipe
 * @param recipe recipe to return ingredients for
 * @param t useI18N object to use for translation
 * @param options options object for list generation
 *                showStepHeaders - add steps as a header ingredient if it's configured on the step
 */
export function getRecipeIngredients(recipe: Recipe, t: any, options: { showStepHeaders: boolean } = {showStepHeaders: false}) {
    let ingredients = [] as Ingredient[]
    recipe.steps.forEach((step, index) => {
        if (step.showAsHeader && options.showStepHeaders && recipe.steps.length > 1 && (step.ingredients.length > 0 || step.name != '')) {
            ingredients.push({
                amount: 0,
                unit: null,
                food: null,
                note: (step.name !== '') ? step.name : t('Step') + ' ' + (index + 1),
                isHeader: true
            } as Ingredient)
        }
        ingredients = ingredients.concat(step.ingredients)
    })
    return ingredients
}