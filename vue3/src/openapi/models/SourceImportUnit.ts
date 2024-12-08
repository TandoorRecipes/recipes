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
 * @interface SourceImportUnit
 */
export interface SourceImportUnit {
    /**
     * 
     * @type {string}
     * @memberof SourceImportUnit
     */
    name: string;
}

/**
 * Check if a given object implements the SourceImportUnit interface.
 */
export function instanceOfSourceImportUnit(value: object): value is SourceImportUnit {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function SourceImportUnitFromJSON(json: any): SourceImportUnit {
    return SourceImportUnitFromJSONTyped(json, false);
}

export function SourceImportUnitFromJSONTyped(json: any, ignoreDiscriminator: boolean): SourceImportUnit {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
    };
}

export function SourceImportUnitToJSON(json: any): SourceImportUnit {
    return SourceImportUnitToJSONTyped(json, false);
}

export function SourceImportUnitToJSONTyped(value?: SourceImportUnit | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
    };
}

