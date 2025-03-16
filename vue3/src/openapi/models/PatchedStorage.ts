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
import type { MethodEnum } from './MethodEnum';
import {
    MethodEnumFromJSON,
    MethodEnumFromJSONTyped,
    MethodEnumToJSON,
} from './MethodEnum';

/**
 * 
 * @export
 * @interface PatchedStorage
 */
export interface PatchedStorage {
    /**
     * 
     * @type {number}
     * @memberof PatchedStorage
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedStorage
     */
    name?: string;
    /**
     * 
     * @type {MethodEnum}
     * @memberof PatchedStorage
     */
    method?: MethodEnum;
    /**
     * 
     * @type {string}
     * @memberof PatchedStorage
     */
    username?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedStorage
     */
    password?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedStorage
     */
    token?: string;
    /**
     * 
     * @type {number}
     * @memberof PatchedStorage
     */
    readonly createdBy?: number;
}

/**
 * Check if a given object implements the PatchedStorage interface.
 */
export function instanceOfPatchedStorage(value: object): value is PatchedStorage {
    return true;
}

export function PatchedStorageFromJSON(json: any): PatchedStorage {
    return PatchedStorageFromJSONTyped(json, false);
}

export function PatchedStorageFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedStorage {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'method': json['method'] == null ? undefined : MethodEnumFromJSON(json['method']),
        'username': json['username'] == null ? undefined : json['username'],
        'password': json['password'] == null ? undefined : json['password'],
        'token': json['token'] == null ? undefined : json['token'],
        'createdBy': json['created_by'] == null ? undefined : json['created_by'],
    };
}

export function PatchedStorageToJSON(value?: Omit<PatchedStorage, 'createdBy'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'method': MethodEnumToJSON(value['method']),
        'username': value['username'],
        'password': value['password'],
        'token': value['token'],
    };
}

