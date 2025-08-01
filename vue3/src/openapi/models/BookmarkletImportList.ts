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
 * @interface BookmarkletImportList
 */
export interface BookmarkletImportList {
    /**
     * 
     * @type {number}
     * @memberof BookmarkletImportList
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof BookmarkletImportList
     */
    url?: string;
    /**
     * 
     * @type {number}
     * @memberof BookmarkletImportList
     */
    readonly createdBy: number;
    /**
     * 
     * @type {Date}
     * @memberof BookmarkletImportList
     */
    readonly createdAt: Date;
}

/**
 * Check if a given object implements the BookmarkletImportList interface.
 */
export function instanceOfBookmarkletImportList(value: object): value is BookmarkletImportList {
    if (!('createdBy' in value) || value['createdBy'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    return true;
}

export function BookmarkletImportListFromJSON(json: any): BookmarkletImportList {
    return BookmarkletImportListFromJSONTyped(json, false);
}

export function BookmarkletImportListFromJSONTyped(json: any, ignoreDiscriminator: boolean): BookmarkletImportList {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'url': json['url'] == null ? undefined : json['url'],
        'createdBy': json['created_by'],
        'createdAt': (new Date(json['created_at'])),
    };
}

export function BookmarkletImportListToJSON(value?: Omit<BookmarkletImportList, 'createdBy'|'createdAt'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'url': value['url'],
    };
}

