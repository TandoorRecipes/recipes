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
import type { InviteLink } from './InviteLink';
import {
    InviteLinkFromJSON,
    InviteLinkFromJSONTyped,
    InviteLinkToJSON,
} from './InviteLink';

/**
 * 
 * @export
 * @interface PaginatedInviteLinkList
 */
export interface PaginatedInviteLinkList {
    /**
     * 
     * @type {number}
     * @memberof PaginatedInviteLinkList
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof PaginatedInviteLinkList
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PaginatedInviteLinkList
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<InviteLink>}
     * @memberof PaginatedInviteLinkList
     */
    results: Array<InviteLink>;
    /**
     * 
     * @type {Date}
     * @memberof PaginatedInviteLinkList
     */
    timestamp?: Date;
}

/**
 * Check if a given object implements the PaginatedInviteLinkList interface.
 */
export function instanceOfPaginatedInviteLinkList(value: object): value is PaginatedInviteLinkList {
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedInviteLinkListFromJSON(json: any): PaginatedInviteLinkList {
    return PaginatedInviteLinkListFromJSONTyped(json, false);
}

export function PaginatedInviteLinkListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedInviteLinkList {
    if (json == null) {
        return json;
    }
    return {
        
        'count': json['count'],
        'next': json['next'] == null ? undefined : json['next'],
        'previous': json['previous'] == null ? undefined : json['previous'],
        'results': ((json['results'] as Array<any>).map(InviteLinkFromJSON)),
        'timestamp': json['timestamp'] == null ? undefined : (new Date(json['timestamp'])),
    };
}

export function PaginatedInviteLinkListToJSON(value?: PaginatedInviteLinkList | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'count': value['count'],
        'next': value['next'],
        'previous': value['previous'],
        'results': ((value['results'] as Array<any>).map(InviteLinkToJSON)),
        'timestamp': value['timestamp'] == null ? undefined : ((value['timestamp']).toISOString()),
    };
}
// ----------------------------------------------------------------------
// Custom model functions added by custom openapi-generator template
// ----------------------------------------------------------------------
import {ApiApi, ApiPaginatedInviteLinkListListRequest, PaginatedPaginatedInviteLinkListList} from "@/openapi";

/**
 * query list endpoint using the provided request parameters
 */
export function list(requestParameters: ApiPaginatedInviteLinkListListRequest = {}): Promise<PaginatedPaginatedInviteLinkListList> {
    const api = new ApiApi()
    return api.apiPaginatedInviteLinkListList(requestParameters)
}