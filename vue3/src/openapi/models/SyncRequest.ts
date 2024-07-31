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
 * @interface SyncRequest
 */
export interface SyncRequest {
    /**
     * 
     * @type {number}
     * @memberof SyncRequest
     */
    storage: number;
    /**
     * 
     * @type {string}
     * @memberof SyncRequest
     */
    path?: string;
    /**
     * 
     * @type {boolean}
     * @memberof SyncRequest
     */
    active?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof SyncRequest
     */
    lastChecked?: Date;
    /**
     * 
     * @type {number}
     * @memberof SyncRequest
     */
    id?: number;
}

/**
 * Check if a given object implements the SyncRequest interface.
 */
export function instanceOfSyncRequest(value: object): boolean {
    if (!('storage' in value)) return false;
    return true;
}

export function SyncRequestFromJSON(json: any): SyncRequest {
    return SyncRequestFromJSONTyped(json, false);
}

export function SyncRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): SyncRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'storage': json['storage'],
        'path': json['path'] == null ? undefined : json['path'],
        'active': json['active'] == null ? undefined : json['active'],
        'lastChecked': json['last_checked'] == null ? undefined : (new Date(json['last_checked'])),
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function SyncRequestToJSON(value?: SyncRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'storage': value['storage'],
        'path': value['path'],
        'active': value['active'],
        'last_checked': value['lastChecked'] == null ? undefined : ((value['lastChecked'] as any).toISOString()),
        'id': value['id'],
    };
}
