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
/**
 * 
 * @export
 * @interface ShoppingListEntrySimpleCreate
 */
export interface ShoppingListEntrySimpleCreate {
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntrySimpleCreate
     */
    amount: number;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntrySimpleCreate
     */
    unitId: number | null;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntrySimpleCreate
     */
    foodId: number | null;
    /**
     * 
     * @type {number}
     * @memberof ShoppingListEntrySimpleCreate
     */
    ingredientId: number | null;
}

/**
 * Check if a given object implements the ShoppingListEntrySimpleCreate interface.
 */
export function instanceOfShoppingListEntrySimpleCreate(value: object): value is ShoppingListEntrySimpleCreate {
    if (!('amount' in value) || value['amount'] === undefined) return false;
    if (!('unitId' in value) || value['unitId'] === undefined) return false;
    if (!('foodId' in value) || value['foodId'] === undefined) return false;
    if (!('ingredientId' in value) || value['ingredientId'] === undefined) return false;
    return true;
}

export function ShoppingListEntrySimpleCreateFromJSON(json: any): ShoppingListEntrySimpleCreate {
    return ShoppingListEntrySimpleCreateFromJSONTyped(json, false);
}

export function ShoppingListEntrySimpleCreateFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShoppingListEntrySimpleCreate {
    if (json == null) {
        return json;
    }
    return {
        
        'amount': json['amount'],
        'unitId': json['unit_id'],
        'foodId': json['food_id'],
        'ingredientId': json['ingredient_id'],
    };
}

export function ShoppingListEntrySimpleCreateToJSON(json: any): ShoppingListEntrySimpleCreate {
    return ShoppingListEntrySimpleCreateToJSONTyped(json, false);
}

export function ShoppingListEntrySimpleCreateToJSONTyped(value?: ShoppingListEntrySimpleCreate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'amount': value['amount'],
        'unit_id': value['unitId'],
        'food_id': value['foodId'],
        'ingredient_id': value['ingredientId'],
    };
}

