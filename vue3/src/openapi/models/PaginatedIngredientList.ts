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
import type { Ingredient } from './Ingredient';
import {
    IngredientFromJSON,
    IngredientFromJSONTyped,
    IngredientToJSON,
} from './Ingredient';

/**
 * 
 * @export
 * @interface PaginatedIngredientList
 */
export interface PaginatedIngredientList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedIngredientList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedIngredientList
     */
    next?: string;
    /**
     * 
     * @type {string}
     * @memberof PaginatedIngredientList
     */
    previous?: string;
    /**
     * 
     * @type {Array<Ingredient>}
     * @memberof PaginatedIngredientList
     */
    results: Array<Ingredient>;
    /**
     * 
     * @type {Date}
     * @memberof PaginatedIngredientList
     */
    timestamp?: Date;
}

/**
 * Check if a given object implements the PaginatedIngredientList interface.
 */
export function instanceOfPaginatedIngredientList(value: object): value is PaginatedIngredientList {
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedIngredientListFromJSON(json: any): PaginatedIngredientList {
    return PaginatedIngredientListFromJSONTyped(json, false);
}

export function PaginatedIngredientListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedIngredientList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(IngredientFromJSON)),
        'timestamp': json['timestamp'] == null ? undefined : (new Date(json['timestamp'])),
    };
}

export function PaginatedIngredientListToJSON(value?: PaginatedIngredientList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(IngredientToJSON)),
        'timestamp': value['timestamp'] == null ? undefined : ((value['timestamp']).toISOString()),
    };
}

