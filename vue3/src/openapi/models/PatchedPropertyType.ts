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
 * Adds nested create feature
 * @export
 * @interface PatchedPropertyType
 */
export interface PatchedPropertyType {
    /**
     * 
     * @type {number}
     * @memberof PatchedPropertyType
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedPropertyType
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedPropertyType
     */
    unit?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedPropertyType
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof PatchedPropertyType
     */
    order?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedPropertyType
     */
    openDataSlug?: string;
    /**
     * 
     * @type {number}
     * @memberof PatchedPropertyType
     */
    fdcId?: number;
}

/**
 * Check if a given object implements the PatchedPropertyType interface.
 */
export function instanceOfPatchedPropertyType(value: object): value is PatchedPropertyType {
    return true;
}

export function PatchedPropertyTypeFromJSON(json: any): PatchedPropertyType {
    return PatchedPropertyTypeFromJSONTyped(json, false);
}

export function PatchedPropertyTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedPropertyType {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'unit': json['unit'] == null ? undefined : json['unit'],
        'description': json['description'] == null ? undefined : json['description'],
        'order': json['order'] == null ? undefined : json['order'],
        'openDataSlug': json['open_data_slug'] == null ? undefined : json['open_data_slug'],
        'fdcId': json['fdc_id'] == null ? undefined : json['fdc_id'],
    };
}

export function PatchedPropertyTypeToJSON(value?: PatchedPropertyType | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'unit': value['unit'],
        'description': value['description'],
        'order': value['order'],
        'open_data_slug': value['openDataSlug'],
        'fdc_id': value['fdcId'],
    };
}

