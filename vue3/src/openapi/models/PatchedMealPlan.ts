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

import { mapValues } from '../runtime';
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
import type { RecipeOverview } from './RecipeOverview';
import {
    RecipeOverviewFromJSON,
    RecipeOverviewFromJSONTyped,
    RecipeOverviewToJSON,
} from './RecipeOverview';

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
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedMealPlan
     */
    title?: string;
    /**
     * 
     * @type {RecipeOverview}
     * @memberof PatchedMealPlan
     */
    recipe?: RecipeOverview;
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
    shared?: Array<User>;
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
    /**
     * 
     * @type {boolean}
     * @memberof PatchedMealPlan
     */
    addshopping?: boolean;
}

/**
 * Check if a given object implements the PatchedMealPlan interface.
 */
export function instanceOfPatchedMealPlan(value: object): value is PatchedMealPlan {
    return true;
}

export function PatchedMealPlanFromJSON(json: any): PatchedMealPlan {
    return PatchedMealPlanFromJSONTyped(json, false);
}

export function PatchedMealPlanFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedMealPlan {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'title': json['title'] == null ? undefined : json['title'],
        'recipe': json['recipe'] == null ? undefined : RecipeOverviewFromJSON(json['recipe']),
        'servings': json['servings'] == null ? undefined : json['servings'],
        'note': json['note'] == null ? undefined : json['note'],
        'noteMarkdown': json['note_markdown'] == null ? undefined : json['note_markdown'],
        'fromDate': json['from_date'] == null ? undefined : (new Date(json['from_date'])),
        'toDate': json['to_date'] == null ? undefined : (new Date(json['to_date'])),
        'mealType': json['meal_type'] == null ? undefined : MealTypeFromJSON(json['meal_type']),
        'createdBy': json['created_by'] == null ? undefined : json['created_by'],
        'shared': json['shared'] == null ? undefined : ((json['shared'] as Array<any>).map(UserFromJSON)),
        'recipeName': json['recipe_name'] == null ? undefined : json['recipe_name'],
        'mealTypeName': json['meal_type_name'] == null ? undefined : json['meal_type_name'],
        'shopping': json['shopping'] == null ? undefined : json['shopping'],
        'addshopping': json['addshopping'] == null ? undefined : json['addshopping'],
    };
}

export function PatchedMealPlanToJSON(value?: Omit<PatchedMealPlan, 'noteMarkdown'|'createdBy'|'recipeName'|'mealTypeName'|'shopping'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'title': value['title'],
        'recipe': RecipeOverviewToJSON(value['recipe']),
        'servings': value['servings'],
        'note': value['note'],
        'from_date': value['fromDate'] == null ? undefined : ((value['fromDate']).toISOString()),
        'to_date': value['toDate'] == null ? undefined : ((value['toDate']).toISOString()),
        'meal_type': MealTypeToJSON(value['mealType']),
        'shared': value['shared'] == null ? undefined : ((value['shared'] as Array<any>).map(UserToJSON)),
        'addshopping': value['addshopping'],
    };
}

