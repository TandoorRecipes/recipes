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
 * @interface ShareLink
 */
export interface ShareLink {
    /**
     * 
     * @type {number}
     * @memberof ShareLink
     */
    pk: number;
    /**
     * 
     * @type {string}
     * @memberof ShareLink
     */
    share: string;
    /**
     * 
     * @type {string}
     * @memberof ShareLink
     */
    link: string;
}

/**
 * Check if a given object implements the ShareLink interface.
 */
export function instanceOfShareLink(value: object): value is ShareLink {
    if (!('pk' in value) || value['pk'] === undefined) return false;
    if (!('share' in value) || value['share'] === undefined) return false;
    if (!('link' in value) || value['link'] === undefined) return false;
    return true;
}

export function ShareLinkFromJSON(json: any): ShareLink {
    return ShareLinkFromJSONTyped(json, false);
}

export function ShareLinkFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLink {
    if (json == null) {
        return json;
    }
    return {
        
        'pk': json['pk'],
        'share': json['share'],
        'link': json['link'],
    };
}

export function ShareLinkToJSON(value?: ShareLink | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'pk': value['pk'],
        'share': value['share'],
        'link': value['link'],
    };
}

