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
import type { RecipeOverview } from './RecipeOverview';
import {
    RecipeOverviewFromJSON,
    RecipeOverviewFromJSONTyped,
    RecipeOverviewToJSON,
} from './RecipeOverview';
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * Adds nested create feature
 * @export
 * @interface MealPlan
 */
export interface MealPlan {
    /**
     * 
     * @type {number}
     * @memberof MealPlan
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof MealPlan
     */
    title?: string;
    /**
     * 
     * @type {RecipeOverview}
     * @memberof MealPlan
     */
    recipe?: RecipeOverview;
    /**
     * 
     * @type {number}
     * @memberof MealPlan
     */
    servings: number;
    /**
     * 
     * @type {string}
     * @memberof MealPlan
     */
    note?: string;
    /**
     * 
     * @type {string}
     * @memberof MealPlan
     */
    readonly noteMarkdown: string;
    /**
     * 
     * @type {Date}
     * @memberof MealPlan
     */
    fromDate: Date;
    /**
     * 
     * @type {Date}
     * @memberof MealPlan
     */
    toDate?: Date;
    /**
     * 
     * @type {MealType}
     * @memberof MealPlan
     */
    mealType: MealType;
    /**
     * 
     * @type {number}
     * @memberof MealPlan
     */
    readonly createdBy: number;
    /**
     * 
     * @type {Array<User>}
     * @memberof MealPlan
     */
    shared?: Array<User>;
    /**
     * 
     * @type {string}
     * @memberof MealPlan
     */
    readonly recipeName: string;
    /**
     * 
     * @type {string}
     * @memberof MealPlan
     */
    readonly mealTypeName: string;
    /**
     * 
     * @type {boolean}
     * @memberof MealPlan
     */
    readonly shopping: boolean;
}

/**
 * Check if a given object implements the MealPlan interface.
 */
export function instanceOfMealPlan(value: object): boolean {
    if (!('servings' in value)) return false;
    if (!('noteMarkdown' in value)) return false;
    if (!('fromDate' in value)) return false;
    if (!('mealType' in value)) return false;
    if (!('createdBy' in value)) return false;
    if (!('recipeName' in value)) return false;
    if (!('mealTypeName' in value)) return false;
    if (!('shopping' in value)) return false;
    return true;
}

export function MealPlanFromJSON(json: any): MealPlan {
    return MealPlanFromJSONTyped(json, false);
}

export function MealPlanFromJSONTyped(json: any, ignoreDiscriminator: boolean): MealPlan {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'title': json['title'] == null ? undefined : json['title'],
        'recipe': json['recipe'] == null ? undefined : RecipeOverviewFromJSON(json['recipe']),
        'servings': json['servings'],
        'note': json['note'] == null ? undefined : json['note'],
        'noteMarkdown': json['note_markdown'],
        'fromDate': (new Date(json['from_date'])),
        'toDate': json['to_date'] == null ? undefined : (new Date(json['to_date'])),
        'mealType': MealTypeFromJSON(json['meal_type']),
        'createdBy': json['created_by'],
        'shared': json['shared'] == null ? undefined : ((json['shared'] as Array<any>).map(UserFromJSON)),
        'recipeName': json['recipe_name'],
        'mealTypeName': json['meal_type_name'],
        'shopping': json['shopping'],
    };
}

export function MealPlanToJSON(value?: MealPlan | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'title': value['title'],
        'recipe': RecipeOverviewToJSON(value['recipe']),
        'servings': value['servings'],
        'note': value['note'],
        'from_date': ((value['fromDate']).toISOString().substring(0,10)),
        'to_date': value['toDate'] == null ? undefined : ((value['toDate']).toISOString().substring(0,10)),
        'meal_type': MealTypeToJSON(value['mealType']),
        'shared': value['shared'] == null ? undefined : ((value['shared'] as Array<any>).map(UserToJSON)),
    };
}

