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
import type { RecipeOverview } from './RecipeOverview';
import {
    RecipeOverviewFromJSON,
    RecipeOverviewFromJSONTyped,
    RecipeOverviewToJSON,
} from './RecipeOverview';

/**
 * 
 * @export
 * @interface PaginatedRecipeOverviewList
 */
export interface PaginatedRecipeOverviewList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedRecipeOverviewList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedRecipeOverviewList
     */
    next?: string;
    /**
     * 
     * @type {string}
     * @memberof PaginatedRecipeOverviewList
     */
    previous?: string;
    /**
     * 
     * @type {Array<RecipeOverview>}
     * @memberof PaginatedRecipeOverviewList
     */
    results: Array<RecipeOverview>;
}

/**
 * Check if a given object implements the PaginatedRecipeOverviewList interface.
 */
export function instanceOfPaginatedRecipeOverviewList(value: object): boolean {
    if (!('count' in value)) return false;
    if (!('results' in value)) return false;
    return true;
}

export function PaginatedRecipeOverviewListFromJSON(json: any): PaginatedRecipeOverviewList {
    return PaginatedRecipeOverviewListFromJSONTyped(json, false);
}

export function PaginatedRecipeOverviewListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedRecipeOverviewList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(RecipeOverviewFromJSON)),
    };
}

export function PaginatedRecipeOverviewListToJSON(value?: PaginatedRecipeOverviewList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(RecipeOverviewToJSON)),
    };
}
