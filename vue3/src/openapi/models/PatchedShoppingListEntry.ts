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
} from './User';
import type { ShoppingListRecipe } from './ShoppingListRecipe';
import {
    ShoppingListRecipeFromJSON,
    ShoppingListRecipeFromJSONTyped,
    ShoppingListRecipeToJSON,
} from './ShoppingListRecipe';
import type { Unit } from './Unit';
import {
    UnitFromJSON,
    UnitFromJSONTyped,
    UnitToJSON,
} from './Unit';
import type { Food } from './Food';
import {
    FoodFromJSON,
    FoodFromJSONTyped,
    FoodToJSON,
} from './Food';

/**
 * Adds nested create feature
 * @export
 * @interface PatchedShoppingListEntry
 */
export interface PatchedShoppingListEntry {
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    listRecipe?: number;
    /**
     * 
     * @type {Food}
     * @memberof PatchedShoppingListEntry
     */
    food?: Food;
    /**
     * 
     * @type {Unit}
     * @memberof PatchedShoppingListEntry
     */
    unit?: Unit;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    amount?: number;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    order?: number;
    /**
     * 
     * @type {boolean}
     * @memberof PatchedShoppingListEntry
     */
    checked?: boolean;
    /**
     * 
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    ingredient?: number;
    /**
     * 
     * @type {ShoppingListRecipe}
     * @memberof PatchedShoppingListEntry
     */
    readonly listRecipeData?: ShoppingListRecipe;
    /**
     * 
     * @type {User}
     * @memberof PatchedShoppingListEntry
     */
    readonly createdBy?: User;
    /**
     * 
     * @type {Date}
     * @memberof PatchedShoppingListEntry
     */
    readonly createdAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PatchedShoppingListEntry
     */
    readonly updatedAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PatchedShoppingListEntry
     */
    completedAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PatchedShoppingListEntry
     */
    delayUntil?: Date;
    /**
     * If a mealplan id is given try to find existing or create new ShoppingListRecipe with that meal plan and link entry to it
     * @type {number}
     * @memberof PatchedShoppingListEntry
     */
    mealplanId?: number;
}

/**
 * Check if a given object implements the PatchedShoppingListEntry interface.
 */
export function instanceOfPatchedShoppingListEntry(value: object): value is PatchedShoppingListEntry {
    return true;
}

export function PatchedShoppingListEntryFromJSON(json: any): PatchedShoppingListEntry {
    return PatchedShoppingListEntryFromJSONTyped(json, false);
}

export function PatchedShoppingListEntryFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedShoppingListEntry {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'listRecipe': json['list_recipe'] == null ? undefined : json['list_recipe'],
        'food': json['food'] == null ? undefined : FoodFromJSON(json['food']),
        'unit': json['unit'] == null ? undefined : UnitFromJSON(json['unit']),
        'amount': json['amount'] == null ? undefined : json['amount'],
        'order': json['order'] == null ? undefined : json['order'],
        'checked': json['checked'] == null ? undefined : json['checked'],
        'ingredient': json['ingredient'] == null ? undefined : json['ingredient'],
        'listRecipeData': json['list_recipe_data'] == null ? undefined : ShoppingListRecipeFromJSON(json['list_recipe_data']),
        'createdBy': json['created_by'] == null ? undefined : UserFromJSON(json['created_by']),
        'createdAt': json['created_at'] == null ? undefined : (new Date(json['created_at'])),
        'updatedAt': json['updated_at'] == null ? undefined : (new Date(json['updated_at'])),
        'completedAt': json['completed_at'] == null ? undefined : (new Date(json['completed_at'])),
        'delayUntil': json['delay_until'] == null ? undefined : (new Date(json['delay_until'])),
        'mealplanId': json['mealplan_id'] == null ? undefined : json['mealplan_id'],
    };
}

export function PatchedShoppingListEntryToJSON(value?: Omit<PatchedShoppingListEntry, 'listRecipeData'|'createdBy'|'createdAt'|'updatedAt'> | null): any {
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

