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
import type { Keyword } from './Keyword';
import {
    KeywordFromJSON,
    KeywordFromJSONTyped,
    KeywordToJSON,
} from './Keyword';

/**
 * 
 * @export
 * @interface PatchedImportLog
 */
export interface PatchedImportLog {
    /**
     * 
     * @type {number}
     * @memberof PatchedImportLog
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedImportLog
     */
    type?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedImportLog
     */
    msg?: string;
    /**
     * 
     * @type {boolean}
     * @memberof PatchedImportLog
     */
    running?: boolean;
    /**
     * 
     * @type {Keyword}
     * @memberof PatchedImportLog
     */
    readonly keyword?: Keyword;
    /**
     * 
     * @type {number}
     * @memberof PatchedImportLog
     */
    totalRecipes?: number;
    /**
     * 
     * @type {number}
     * @memberof PatchedImportLog
     */
    importedRecipes?: number;
    /**
     * 
     * @type {number}
     * @memberof PatchedImportLog
     */
    readonly createdBy?: number;
    /**
     * 
     * @type {Date}
     * @memberof PatchedImportLog
     */
    readonly createdAt?: Date;
}

/**
 * Check if a given object implements the PatchedImportLog interface.
 */
export function instanceOfPatchedImportLog(value: object): value is PatchedImportLog {
    return true;
}

export function PatchedImportLogFromJSON(json: any): PatchedImportLog {
    return PatchedImportLogFromJSONTyped(json, false);
}

export function PatchedImportLogFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedImportLog {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'type': json['type'] == null ? undefined : json['type'],
        'msg': json['msg'] == null ? undefined : json['msg'],
        'running': json['running'] == null ? undefined : json['running'],
        'keyword': json['keyword'] == null ? undefined : KeywordFromJSON(json['keyword']),
        'totalRecipes': json['total_recipes'] == null ? undefined : json['total_recipes'],
        'importedRecipes': json['imported_recipes'] == null ? undefined : json['imported_recipes'],
        'createdBy': json['created_by'] == null ? undefined : json['created_by'],
        'createdAt': json['created_at'] == null ? undefined : (new Date(json['created_at'])),
    };
}

export function PatchedImportLogToJSON(value?: Omit<PatchedImportLog, 'keyword'|'createdBy'|'createdAt'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'type': value['type'],
        'msg': value['msg'],
        'running': value['running'],
        'total_recipes': value['totalRecipes'],
        'imported_recipes': value['importedRecipes'],
    };
}

