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
import type { OpenDataCategory } from './OpenDataCategory';
import {
    OpenDataCategoryFromJSON,
    OpenDataCategoryFromJSONTyped,
    OpenDataCategoryToJSON,
} from './OpenDataCategory';

/**
 * Adds nested create feature
 * @export
 * @interface OpenDataStoreCategory
 */
export interface OpenDataStoreCategory {
    /**
     * 
     * @type {number}
     * @memberof OpenDataStoreCategory
     */
    id?: number;
    /**
     * 
     * @type {OpenDataCategory}
     * @memberof OpenDataStoreCategory
     */
    category: OpenDataCategory;
    /**
     * 
     * @type {number}
     * @memberof OpenDataStoreCategory
     */
    store: number;
    /**
     * 
     * @type {number}
     * @memberof OpenDataStoreCategory
     */
    order?: number;
}

/**
 * Check if a given object implements the OpenDataStoreCategory interface.
 */
export function instanceOfOpenDataStoreCategory(value: object): value is OpenDataStoreCategory {
    if (!('category' in value) || value['category'] === undefined) return false;
    if (!('store' in value) || value['store'] === undefined) return false;
    return true;
}

export function OpenDataStoreCategoryFromJSON(json: any): OpenDataStoreCategory {
    return OpenDataStoreCategoryFromJSONTyped(json, false);
}

export function OpenDataStoreCategoryFromJSONTyped(json: any, ignoreDiscriminator: boolean): OpenDataStoreCategory {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'category': OpenDataCategoryFromJSON(json['category']),
        'store': json['store'],
        'order': json['order'] == null ? undefined : json['order'],
    };
}

export function OpenDataStoreCategoryToJSON(value?: OpenDataStoreCategory | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'category': OpenDataCategoryToJSON(value['category']),
        'store': value['store'],
        'order': value['order'],
    };
}

