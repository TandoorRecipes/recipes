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
 * @interface PatchedUser
 */
export interface PatchedUser {
    /**
     * 
     * @type {number}
     * @memberof PatchedUser
     */
    id?: number;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     * @type {string}
     * @memberof PatchedUser
     */
    readonly username?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUser
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUser
     */
    lastName?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUser
     */
    readonly displayName?: string;
    /**
     * Designates whether the user can log into this admin site.
     * @type {boolean}
     * @memberof PatchedUser
     */
    isStaff?: boolean;
    /**
     * Designates that this user has all permissions without explicitly assigning them.
     * @type {boolean}
     * @memberof PatchedUser
     */
    isSuperuser?: boolean;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     * @type {boolean}
     * @memberof PatchedUser
     */
    isActive?: boolean;
}

/**
 * Check if a given object implements the PatchedUser interface.
 */
export function instanceOfPatchedUser(value: object): value is PatchedUser {
    return true;
}

export function PatchedUserFromJSON(json: any): PatchedUser {
    return PatchedUserFromJSONTyped(json, false);
}

export function PatchedUserFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedUser {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'username': json['username'] == null ? undefined : json['username'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
        'displayName': json['display_name'] == null ? undefined : json['display_name'],
        'isStaff': json['is_staff'] == null ? undefined : json['is_staff'],
        'isSuperuser': json['is_superuser'] == null ? undefined : json['is_superuser'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
    };
}

export function PatchedUserToJSON(json: any): PatchedUser {
    return PatchedUserToJSONTyped(json, false);
}

export function PatchedUserToJSONTyped(value?: Omit<PatchedUser, 'username'|'display_name'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'first_name': value['firstName'],
        'last_name': value['lastName'],
        'is_staff': value['isStaff'],
        'is_superuser': value['isSuperuser'],
        'is_active': value['isActive'],
    };
}

