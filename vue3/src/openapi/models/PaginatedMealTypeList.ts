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

/**
 * 
 * @export
 * @interface PaginatedMealTypeList
 */
export interface PaginatedMealTypeList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedMealTypeList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedMealTypeList
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PaginatedMealTypeList
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<MealType>}
     * @memberof PaginatedMealTypeList
     */
    results: Array<MealType>;
    /**
     * 
     * @type {Date}
     * @memberof PaginatedMealTypeList
     */
    timestamp?: Date;
}

/**
 * Check if a given object implements the PaginatedMealTypeList interface.
 */
export function instanceOfPaginatedMealTypeList(value: object): value is PaginatedMealTypeList {
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedMealTypeListFromJSON(json: any): PaginatedMealTypeList {
    return PaginatedMealTypeListFromJSONTyped(json, false);
}

export function PaginatedMealTypeListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedMealTypeList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(MealTypeFromJSON)),
        'timestamp': json['timestamp'] == null ? undefined : (new Date(json['timestamp'])),
    };
}

export function PaginatedMealTypeListToJSON(value?: PaginatedMealTypeList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(MealTypeToJSON)),
        'timestamp': value['timestamp'] == null ? undefined : ((value['timestamp']).toISOString()),
    };
}
// ----------------------------------------------------------------------
// Custom model functions added by custom openapi-generator template
// ----------------------------------------------------------------------
import {ApiApi, ApiPaginatedMealTypeListListRequest, PaginatedPaginatedMealTypeListList} from "@/openapi";

/**
 * query list endpoint using the provided request parameters
 */
export function list(requestParameters: ApiPaginatedMealTypeListListRequest = {}): Promise<PaginatedPaginatedMealTypeListList> {
    const api = new ApiApi()
    return api.apiPaginatedMealTypeListList(requestParameters)
}