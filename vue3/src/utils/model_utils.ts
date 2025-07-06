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
        content.push(ingredientToUnitString(ingredient, 1))
    }
    if (ingredient.food) {
        content.push(ingredientToFoodString(ingredient, 1))
    }
    if (ingredient.note) {
        content.push(`(${ingredient.note})`)
    }
    return content.join(' ')
}

/**
 * returns the food string from an ingredient, pluralizing if necessary
 * @param ingredient
 * @param ingredientFactor
 * @return food string or empty string if no food is available for the given ingredient
 */
export function ingredientToFoodString(ingredient: Ingredient, ingredientFactor: number) {
    if (ingredient.food) {
        if (ingredient.food.pluralName == '' || ingredient.food.pluralName == undefined || ingredient.noAmount) {
            return ingredient.food.name
        } else {
            if (ingredient.alwaysUsePluralFood || ingredient.amount * ingredientFactor > 1) {
                return ingredient.food.pluralName
            } else {
                return ingredient.food.name
            }
        }
    } else {
        return ''
    }
}

/**
 * returns the unit name from an ingredient, pluralizing if necessary
 * @param ingredient
 * @param ingredientFactor
 * @return unit name or empty string if no food is available for the given ingredient
 */
export function ingredientToUnitString(ingredient: Ingredient, ingredientFactor: number) {
    if (ingredient.unit) {
        if (ingredient.unit.pluralName == '' || ingredient.unit.pluralName == undefined || ingredient.noAmount) {
            return ingredient.unit.name
        } else {
            if (ingredient.alwaysUsePluralUnit || ingredient.amount * ingredientFactor > 1) {
                return ingredient.unit.pluralName
            } else {
                return ingredient.unit.name
            }
        }
    } else {
        return ''
    }
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