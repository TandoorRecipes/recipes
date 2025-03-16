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
import type { SupermarketCategoryRelation } from './SupermarketCategoryRelation';
import {
    SupermarketCategoryRelationFromJSON,
    SupermarketCategoryRelationFromJSONTyped,
    SupermarketCategoryRelationToJSON,
} from './SupermarketCategoryRelation';

/**
 * 
 * @export
 * @interface PaginatedSupermarketCategoryRelationList
 */
export interface PaginatedSupermarketCategoryRelationList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedSupermarketCategoryRelationList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedSupermarketCategoryRelationList
     */
    next?: string;
    /**
     * 
     * @type {string}
     * @memberof PaginatedSupermarketCategoryRelationList
     */
    previous?: string;
    /**
     * 
     * @type {Array<SupermarketCategoryRelation>}
     * @memberof PaginatedSupermarketCategoryRelationList
     */
    results: Array<SupermarketCategoryRelation>;
    /**
     * 
     * @type {Date}
     * @memberof PaginatedSupermarketCategoryRelationList
     */
    timestamp?: Date;
}

/**
 * Check if a given object implements the PaginatedSupermarketCategoryRelationList interface.
 */
export function instanceOfPaginatedSupermarketCategoryRelationList(value: object): value is PaginatedSupermarketCategoryRelationList {
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedSupermarketCategoryRelationListFromJSON(json: any): PaginatedSupermarketCategoryRelationList {
    return PaginatedSupermarketCategoryRelationListFromJSONTyped(json, false);
}

export function PaginatedSupermarketCategoryRelationListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedSupermarketCategoryRelationList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(SupermarketCategoryRelationFromJSON)),
        'timestamp': json['timestamp'] == null ? undefined : (new Date(json['timestamp'])),
    };
}

export function PaginatedSupermarketCategoryRelationListToJSON(value?: PaginatedSupermarketCategoryRelationList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(SupermarketCategoryRelationToJSON)),
        'timestamp': value['timestamp'] == null ? undefined : ((value['timestamp']).toISOString()),
    };
}

