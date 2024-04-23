/* tslint:disable */
/* eslint-disable */
/**
 * Tandoor
 * Tandoor API Docs
 *
 * The version of the OpenAPI document: 0.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { MealPlanRecipe } from './MealPlanRecipe';
import {
    MealPlanRecipeFromJSON,
    MealPlanRecipeFromJSONTyped,
    MealPlanRecipeToJSON,
} from './MealPlanRecipe';
import type { MealType } from './MealType';
import {
    MealTypeFromJSON,
    MealTypeFromJSONTyped,
    MealTypeToJSON,
} from './MealType';
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * Adds nested create feature
 * @export
 * @interface PatchedMealPlan
 */
export interface PatchedMealPlan {
    /**
     * 
     * @type {number}
     * @memberof PatchedMealPlan
     */
    readonly id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    title?: string;
    /**
     * 
     * @type {MealPlanRecipe}
     * @memberof PatchedMealPlan
     */
    recipe?: MealPlanRecipe | null;
    /**
     * 
     * @type {number}
     * @memberof PatchedMealPlan
     */
    servings?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    note?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    readonly noteMarkdown?: string;
    /**
     * 
     * @type {Date}
     * @memberof PatchedMealPlan
     */
    fromDate?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PatchedMealPlan
     */
    toDate?: Date;
    /**
     * 
     * @type {MealType}
     * @memberof PatchedMealPlan
     */
    mealType?: MealType;
    /**
     * 
     * @type {number}
     * @memberof PatchedMealPlan
     */
    readonly createdBy?: number;
    /**
     * 
     * @type {Array<User>}
     * @memberof PatchedMealPlan
     */
    shared?: Array<User> | null;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    readonly recipeName?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    readonly mealTypeName?: string;
    /**
     * 
     * @type {boolean}
     * @memberof PatchedMealPlan
     */
    readonly shopping?: boolean;
}

/**
 * Check if a given object implements the PatchedMealPlan interface.
 */
export function instanceOfPatchedMealPlan(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PatchedMealPlanFromJSON(json: any): PatchedMealPlan {
    return PatchedMealPlanFromJSONTyped(json, false);
}

export function PatchedMealPlanFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedMealPlan {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'title': !exists(json, 'title') ? undefined : json['title'],
        'recipe': !exists(json, 'recipe') ? undefined : MealPlanRecipeFromJSON(json['recipe']),
        'servings': !exists(json, 'servings') ? undefined : json['servings'],
        'note': !exists(json, 'note') ? undefined : json['note'],
        'noteMarkdown': !exists(json, 'note_markdown') ? undefined : json['note_markdown'],
        'fromDate': !exists(json, 'from_date') ? undefined : (new Date(json['from_date'])),
        'toDate': !exists(json, 'to_date') ? undefined : (new Date(json['to_date'])),
        'mealType': !exists(json, 'meal_type') ? undefined : MealTypeFromJSON(json['meal_type']),
        'createdBy': !exists(json, 'created_by') ? undefined : json['created_by'],
        'shared': !exists(json, 'shared') ? undefined : (json['shared'] === null ? null : (json['shared'] as Array<any>).map(UserFromJSON)),
        'recipeName': !exists(json, 'recipe_name') ? undefined : json['recipe_name'],
        'mealTypeName': !exists(json, 'meal_type_name') ? undefined : json['meal_type_name'],
        'shopping': !exists(json, 'shopping') ? undefined : json['shopping'],
    };
}

export function PatchedMealPlanToJSON(value?: PatchedMealPlan | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'title': value.title,
        'recipe': MealPlanRecipeToJSON(value.recipe),
        'servings': value.servings,
        'note': value.note,
        'from_date': value.fromDate === undefined ? undefined : (value.fromDate.toISOString().substr(0,10)),
        'to_date': value.toDate === undefined ? undefined : (value.toDate.toISOString().substr(0,10)),
        'meal_type': MealTypeToJSON(value.mealType),
        'shared': value.shared === undefined ? undefined : (value.shared === null ? null : (value.shared as Array<any>).map(UserToJSON)),
    };
}
