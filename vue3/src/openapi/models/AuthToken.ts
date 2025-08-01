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
 * @interface AuthToken
 */
export interface AuthToken {
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    username: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    readonly token: string;
}

/**
 * Check if a given object implements the AuthToken interface.
 */
export function instanceOfAuthToken(value: object): value is AuthToken {
    if (!('username' in value) || value['username'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    if (!('token' in value) || value['token'] === undefined) return false;
    return true;
}

export function AuthTokenFromJSON(json: any): AuthToken {
    return AuthTokenFromJSONTyped(json, false);
}

export function AuthTokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthToken {
    if (json == null) {
        return json;
    }
    return {
        
        'username': json['username'],
        'password': json['password'],
        'token': json['token'],
    };
}

export function AuthTokenToJSON(value?: Omit<AuthToken, 'token'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'username': value['username'],
        'password': value['password'],
    };
}

