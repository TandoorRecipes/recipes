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
import type { ShoppingListRecipe } from './ShoppingListRecipe';
import {
    ShoppingListRecipeFromJSON,
    ShoppingListRecipeFromJSONTyped,
    ShoppingListRecipeToJSON,
} from './ShoppingListRecipe';

/**
 * 
 * @export
 * @interface PaginatedShoppingListRecipeList
 */
export interface PaginatedShoppingListRecipeList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedShoppingListRecipeList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedShoppingListRecipeList
     */
    next?: string;
    /**
     * 
     * @type {string}
     * @memberof PaginatedShoppingListRecipeList
     */
    previous?: string;
    /**
     * 
     * @type {Array<ShoppingListRecipe>}
     * @memberof PaginatedShoppingListRecipeList
     */
    results: Array<ShoppingListRecipe>;
    /**
     * 
     * @type {Date}
     * @memberof PaginatedShoppingListRecipeList
     */
    timestamp?: Date;
}

/**
 * Check if a given object implements the PaginatedShoppingListRecipeList interface.
 */
export function instanceOfPaginatedShoppingListRecipeList(value: object): value is PaginatedShoppingListRecipeList {
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedShoppingListRecipeListFromJSON(json: any): PaginatedShoppingListRecipeList {
    return PaginatedShoppingListRecipeListFromJSONTyped(json, false);
}

export function PaginatedShoppingListRecipeListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedShoppingListRecipeList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(ShoppingListRecipeFromJSON)),
        'timestamp': json['timestamp'] == null ? undefined : (new Date(json['timestamp'])),
    };
}

export function PaginatedShoppingListRecipeListToJSON(value?: PaginatedShoppingListRecipeList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(ShoppingListRecipeToJSON)),
        'timestamp': value['timestamp'] == null ? undefined : ((value['timestamp']).toISOString()),
    };
}

