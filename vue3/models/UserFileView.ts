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
 * @interface UserFileView
 */
export interface UserFileView {
    /**
     * 
     * @type {number}
     * @memberof UserFileView
     */
    readonly id: number;
    /**
     * 
     * @type {string}
     * @memberof UserFileView
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof UserFileView
     */
    readonly fileDownload: string;
    /**
     * 
     * @type {string}
     * @memberof UserFileView
     */
    readonly preview: string;
}

/**
 * Check if a given object implements the UserFileView interface.
 */
export function instanceOfUserFileView(value: object): boolean {
    if (!('id' in value)) return false;
    if (!('name' in value)) return false;
    if (!('fileDownload' in value)) return false;
    if (!('preview' in value)) return false;
    return true;
}

export function UserFileViewFromJSON(json: any): UserFileView {
    return UserFileViewFromJSONTyped(json, false);
}

export function UserFileViewFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserFileView {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'fileDownload': json['file_download'],
        'preview': json['preview'],
    };
}

export function UserFileViewToJSON(value?: Omit<UserFileView, 'id'|'file_download'|'preview'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
    };
}
