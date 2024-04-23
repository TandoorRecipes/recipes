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

import { exists, mapValues } from '../runtime';
import type { SupermarketCategory } from './SupermarketCategory';
import {
    SupermarketCategoryFromJSON,
    SupermarketCategoryFromJSONTyped,
    SupermarketCategoryToJSON,
} from './SupermarketCategory';

/**
 * Adds nested create feature
 * @export
 * @interface PatchedSupermarketCategoryRelation
 */
export interface PatchedSupermarketCategoryRelation {
    /**
     * 
     * @type {number}
     * @memberof PatchedSupermarketCategoryRelation
     */
    readonly id?: number;
    /**
     * 
     * @type {SupermarketCategory}
     * @memberof PatchedSupermarketCategoryRelation
     */
    category?: SupermarketCategory;
    /**
     * 
     * @type {number}
     * @memberof PatchedSupermarketCategoryRelation
     */
    supermarket?: number;
    /**
     * 
     * @type {number}
     * @memberof PatchedSupermarketCategoryRelation
     */
    order?: number;
}

/**
 * Check if a given object implements the PatchedSupermarketCategoryRelation interface.
 */
export function instanceOfPatchedSupermarketCategoryRelation(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PatchedSupermarketCategoryRelationFromJSON(json: any): PatchedSupermarketCategoryRelation {
    return PatchedSupermarketCategoryRelationFromJSONTyped(json, false);
}

export function PatchedSupermarketCategoryRelationFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedSupermarketCategoryRelation {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'category': !exists(json, 'category') ? undefined : SupermarketCategoryFromJSON(json['category']),
        'supermarket': !exists(json, 'supermarket') ? undefined : json['supermarket'],
        'order': !exists(json, 'order') ? undefined : json['order'],
    };
}

export function PatchedSupermarketCategoryRelationToJSON(value?: PatchedSupermarketCategoryRelation | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'category': SupermarketCategoryToJSON(value.category),
        'supermarket': value.supermarket,
        'order': value.order,
    };
}
