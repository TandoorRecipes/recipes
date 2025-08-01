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
 * @interface ViewLog
 */
export interface ViewLog {
    /**
     * 
     * @type {number}
     * @memberof ViewLog
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof ViewLog
     */
    recipe: number;
    /**
     * 
     * @type {number}
     * @memberof ViewLog
     */
    readonly createdBy: number;
    /**
     * 
     * @type {Date}
     * @memberof ViewLog
     */
    readonly createdAt: Date;
}

/**
 * Check if a given object implements the ViewLog interface.
 */
export function instanceOfViewLog(value: object): value is ViewLog {
    if (!('recipe' in value) || value['recipe'] === undefined) return false;
    if (!('createdBy' in value) || value['createdBy'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    return true;
}

export function ViewLogFromJSON(json: any): ViewLog {
    return ViewLogFromJSONTyped(json, false);
}

export function ViewLogFromJSONTyped(json: any, ignoreDiscriminator: boolean): ViewLog {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'recipe': json['recipe'],
        'createdBy': json['created_by'],
        'createdAt': (new Date(json['created_at'])),
    };
}

export function ViewLogToJSON(value?: Omit<ViewLog, 'createdBy'|'createdAt'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'recipe': value['recipe'],
    };
}

