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
 * @interface SourceImportKeyword
 */
export interface SourceImportKeyword {
    /**
     * 
     * @type {number}
     * @memberof SourceImportKeyword
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof SourceImportKeyword
     */
    label: string;
    /**
     * 
     * @type {string}
     * @memberof SourceImportKeyword
     */
    name: string;
    /**
     * 
     * @type {boolean}
     * @memberof SourceImportKeyword
     */
    importKeyword: boolean;
}

/**
 * Check if a given object implements the SourceImportKeyword interface.
 */
export function instanceOfSourceImportKeyword(value: object): value is SourceImportKeyword {
    if (!('label' in value) || value['label'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('importKeyword' in value) || value['importKeyword'] === undefined) return false;
    return true;
}

export function SourceImportKeywordFromJSON(json: any): SourceImportKeyword {
    return SourceImportKeywordFromJSONTyped(json, false);
}

export function SourceImportKeywordFromJSONTyped(json: any, ignoreDiscriminator: boolean): SourceImportKeyword {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'label': json['label'],
        'name': json['name'],
        'importKeyword': json['import_keyword'],
    };
}

export function SourceImportKeywordToJSON(value?: SourceImportKeyword | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'label': value['label'],
        'name': value['name'],
        'import_keyword': value['importKeyword'],
    };
}

