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

import { exists, mapValues } from '../runtime';
import type { BookmarkletImportList } from './BookmarkletImportList';
import {
    BookmarkletImportListFromJSON,
    BookmarkletImportListFromJSONTyped,
    BookmarkletImportListToJSON,
} from './BookmarkletImportList';

/**
 * 
 * @export
 * @interface PaginatedBookmarkletImportListList
 */
export interface PaginatedBookmarkletImportListList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedBookmarkletImportListList
     */
    count?: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedBookmarkletImportListList
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PaginatedBookmarkletImportListList
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<BookmarkletImportList>}
     * @memberof PaginatedBookmarkletImportListList
     */
    results?: Array<BookmarkletImportList>;
}

/**
 * Check if a given object implements the PaginatedBookmarkletImportListList interface.
 */
export function instanceOfPaginatedBookmarkletImportListList(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PaginatedBookmarkletImportListListFromJSON(json: any): PaginatedBookmarkletImportListList {
    return PaginatedBookmarkletImportListListFromJSONTyped(json, false);
}

export function PaginatedBookmarkletImportListListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedBookmarkletImportListList {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'count': !exists(json, 'count') ? undefined : json['count'],
        'next': !exists(json, 'next') ? undefined : json['next'],
        'previous': !exists(json, 'previous') ? undefined : json['previous'],
        'results': !exists(json, 'results') ? undefined : ((json['results'] as Array<any>).map(BookmarkletImportListFromJSON)),
    };
}

export function PaginatedBookmarkletImportListListToJSON(value?: PaginatedBookmarkletImportListList | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'count': value.count,
        'next': value.next,
        'previous': value.previous,
        'results': value.results === undefined ? undefined : ((value.results as Array<any>).map(BookmarkletImportListToJSON)),
    };
}
