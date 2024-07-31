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
 * @interface UserFileViewRequest
 */
export interface UserFileViewRequest {
    /**
     * 
     * @type {string}
     * @memberof UserFileViewRequest
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof UserFileViewRequest
     */
    id?: number;
}

/**
 * Check if a given object implements the UserFileViewRequest interface.
 */
export function instanceOfUserFileViewRequest(value: object): boolean {
    if (!('name' in value)) return false;
    return true;
}

export function UserFileViewRequestFromJSON(json: any): UserFileViewRequest {
    return UserFileViewRequestFromJSONTyped(json, false);
}

export function UserFileViewRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserFileViewRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function UserFileViewRequestToJSON(value?: UserFileViewRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'id': value['id'],
    };
}
