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
 * @interface PatchedAccessToken
 */
export interface PatchedAccessToken {
    /**
     * 
     * @type {number}
     * @memberof PatchedAccessToken
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedAccessToken
     */
    readonly token?: string;
    /**
     * 
     * @type {Date}
     * @memberof PatchedAccessToken
     */
    expires?: Date;
    /**
     * 
     * @type {string}
     * @memberof PatchedAccessToken
     */
    scope?: string;
    /**
     * 
     * @type {Date}
     * @memberof PatchedAccessToken
     */
    readonly created?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PatchedAccessToken
     */
    readonly updated?: Date;
}

/**
 * Check if a given object implements the PatchedAccessToken interface.
 */
export function instanceOfPatchedAccessToken(value: object): boolean {
    return true;
}

export function PatchedAccessTokenFromJSON(json: any): PatchedAccessToken {
    return PatchedAccessTokenFromJSONTyped(json, false);
}

export function PatchedAccessTokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedAccessToken {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'token': json['token'] == null ? undefined : json['token'],
        'expires': json['expires'] == null ? undefined : (new Date(json['expires'])),
        'scope': json['scope'] == null ? undefined : json['scope'],
        'created': json['created'] == null ? undefined : (new Date(json['created'])),
        'updated': json['updated'] == null ? undefined : (new Date(json['updated'])),
    };
}

export function PatchedAccessTokenToJSON(value?: PatchedAccessToken | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'expires': value['expires'] == null ? undefined : ((value['expires']).toISOString()),
        'scope': value['scope'],
    };
}

