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
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
    UserToJSONTyped,
} from './User';
import type { ShoppingListRecipe } from './ShoppingListRecipe';
import {
    ShoppingListRecipeFromJSON,
    ShoppingListRecipeFromJSONTyped,
    ShoppingListRecipeToJSON,
    ShoppingListRecipeToJSONTyped,
} from './ShoppingListRecipe';
import type { Unit } from './Unit';
import {
    UnitFromJSON,
    UnitFromJSONTyped,
    UnitToJSON,
    UnitToJSONTyped,
} from './Unit';
import type { Food } from './Food';
import {
    FoodFromJSON,
    FoodFromJSONTyped,
    FoodToJSON,
    FoodToJSONTyped,
} from './Food';

/**
 * Adds nested create feature
 * @export
 * @interface ShoppingListEntry
 */
export interface ShoppingListEntry {
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntry
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntry
     */
    listRecipe?: number | null;
    /**
     * 
     * @type {Food}
     * @memberof ShoppingListEntry
     */
    food: Food | null;
    /**
     * 
     * @type {Unit}
     * @memberof ShoppingListEntry
     */
    unit?: Unit | null;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntry
     */
    amount: number;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntry
     */
    order?: number;
    /**
     * 
     * @type {boolean}
     * @memberof ShoppingListEntry
     */
    checked?: boolean;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntry
     */
    ingredient?: number | null;
    /**
     * 
     * @type {ShoppingListRecipe}
     * @memberof ShoppingListEntry
     */
    readonly listRecipeData: ShoppingListRecipe;
    /**
     * 
     * @type {User}
     * @memberof ShoppingListEntry
     */
    readonly createdBy: User;
    /**
     * 
     * @type {Date}
     * @memberof ShoppingListEntry
     */
    readonly createdAt: Date;
    /**
     * 
     * @type {Date}
     * @memberof ShoppingListEntry
     */
    readonly updatedAt: Date;
    /**
     * 
     * @type {Date}
     * @memberof ShoppingListEntry
     */
    completedAt?: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof ShoppingListEntry
     */
    delayUntil?: Date | null;
    /**
     * If a mealplan id is given try to find existing or create new ShoppingListRecipe with that meal plan and link entry to it
     * @type {number}
     * @memberof ShoppingListEntry
     */
    mealplanId?: number;
}

/**
 * Check if a given object implements the ShoppingListEntry interface.
 */
export function instanceOfShoppingListEntry(value: object): value is ShoppingListEntry {
    if (!('food' in value) || value['food'] === undefined) return false;
    if (!('amount' in value) || value['amount'] === undefined) return false;
    if (!('listRecipeData' in value) || value['listRecipeData'] === undefined) return false;
    if (!('createdBy' in value) || value['createdBy'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    if (!('updatedAt' in value) || value['updatedAt'] === undefined) return false;
    return true;
}

export function ShoppingListEntryFromJSON(json: any): ShoppingListEntry {
    return ShoppingListEntryFromJSONTyped(json, false);
}

export function ShoppingListEntryFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShoppingListEntry {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'listRecipe': json['list_recipe'] == null ? undefined : json['list_recipe'],
        'food': FoodFromJSON(json['food']),
        'unit': json['unit'] == null ? undefined : UnitFromJSON(json['unit']),
        'amount': json['amount'],
        'order': json['order'] == null ? undefined : json['order'],
        'checked': json['checked'] == null ? undefined : json['checked'],
        'ingredient': json['ingredient'] == null ? undefined : json['ingredient'],
        'listRecipeData': ShoppingListRecipeFromJSON(json['list_recipe_data']),
        'createdBy': UserFromJSON(json['created_by']),
        'createdAt': (new Date(json['created_at'])),
        'updatedAt': (new Date(json['updated_at'])),
        'completedAt': json['completed_at'] == null ? undefined : (new Date(json['completed_at'])),
        'delayUntil': json['delay_until'] == null ? undefined : (new Date(json['delay_until'])),
        'mealplanId': json['mealplan_id'] == null ? undefined : json['mealplan_id'],
    };
}

export function ShoppingListEntryToJSON(json: any): ShoppingListEntry {
    return ShoppingListEntryToJSONTyped(json, false);
}

export function ShoppingListEntryToJSONTyped(value?: Omit<ShoppingListEntry, 'list_recipe_data'|'created_by'|'created_at'|'updated_at'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'list_recipe': value['listRecipe'],
        'food': FoodToJSON(value['food']),
        'unit': UnitToJSON(value['unit']),
        'amount': value['amount'],
        'order': value['order'],
        'checked': value['checked'],
        'ingredient': value['ingredient'],
        'completed_at': value['completedAt'] == null ? undefined : ((value['completedAt'] as any).toISOString()),
        'delay_until': value['delayUntil'] == null ? undefined : ((value['delayUntil'] as any).toISOString()),
        'mealplan_id': value['mealplanId'],
    };
}

