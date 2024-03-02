/* tslint:disable */
/* eslint-disable */
/**
 * 
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface PatchedShoppingListRecipe
 */
export interface PatchedShoppingListRecipe {
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListRecipe
     */
    readonly id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedShoppingListRecipe
     */
    readonly recipeName?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedShoppingListRecipe
     */
    readonly name?: string;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListRecipe
     */
    recipe?: number | null;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListRecipe
     */
    mealplan?: number | null;
    /**
     * 
     * @type {string}
     * @memberof PatchedShoppingListRecipe
     */
    servings?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedShoppingListRecipe
     */
    readonly mealplanNote?: string;
    /**
     * 
     * @type {Date}
     * @memberof PatchedShoppingListRecipe
     */
    readonly mealplanFromDate?: Date;
    /**
     * 
     * @type {string}
     * @memberof PatchedShoppingListRecipe
     */
    readonly mealplanType?: string;
}

/**
 * Check if a given object implements the PatchedShoppingListRecipe interface.
 */
export function instanceOfPatchedShoppingListRecipe(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PatchedShoppingListRecipeFromJSON(json: any): PatchedShoppingListRecipe {
    return PatchedShoppingListRecipeFromJSONTyped(json, false);
}

export function PatchedShoppingListRecipeFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedShoppingListRecipe {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'recipeName': !exists(json, 'recipe_name') ? undefined : json['recipe_name'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'recipe': !exists(json, 'recipe') ? undefined : json['recipe'],
        'mealplan': !exists(json, 'mealplan') ? undefined : json['mealplan'],
        'servings': !exists(json, 'servings') ? undefined : json['servings'],
        'mealplanNote': !exists(json, 'mealplan_note') ? undefined : json['mealplan_note'],
        'mealplanFromDate': !exists(json, 'mealplan_from_date') ? undefined : (new Date(json['mealplan_from_date'])),
        'mealplanType': !exists(json, 'mealplan_type') ? undefined : json['mealplan_type'],
    };
}

export function PatchedShoppingListRecipeToJSON(value?: PatchedShoppingListRecipe | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'recipe': value.recipe,
        'mealplan': value.mealplan,
        'servings': value.servings,
    };
}
