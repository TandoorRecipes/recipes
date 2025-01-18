import {Ingredient} from "@/openapi";

/**
 * returns a string representing an ingredient
 * @param ingredient
 */
export function ingredientToString(ingredient: Ingredient) {
    let content = []
    if(ingredient.amount != 0){
        content.push(ingredient.amount)
    }
    if(ingredient.unit){
        content.push(ingredient.unit.name)
    }
    if(ingredient.food){
        content.push(ingredient.food.name)
    }
    if(ingredient.note){
        content.push(`(${ingredient.note})`)
    }
    return content.join(' ')
}