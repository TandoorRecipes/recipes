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
import type { CustomFilter } from './CustomFilter';
import {
    CustomFilterFromJSON,
    CustomFilterFromJSONTyped,
    CustomFilterToJSON,
} from './CustomFilter';
import type { RecipeSimple } from './RecipeSimple';
import {
    RecipeSimpleFromJSON,
    RecipeSimpleFromJSONTyped,
    RecipeSimpleToJSON,
} from './RecipeSimple';

/**
 * 
 * @export
 * @interface ExportRequest
 */
export interface ExportRequest {
    /**
     * 
     * @type {string}
     * @memberof ExportRequest
     */
    type: string;
    /**
     * 
     * @type {boolean}
     * @memberof ExportRequest
     */
    all?: boolean;
    /**
     * 
     * @type {Array<RecipeSimple>}
     * @memberof ExportRequest
     */
    recipes?: Array<RecipeSimple>;
    /**
     * 
     * @type {CustomFilter}
     * @memberof ExportRequest
     */
    customFilter?: CustomFilter;
}

/**
 * Check if a given object implements the ExportRequest interface.
 */
export function instanceOfExportRequest(value: object): value is ExportRequest {
    if (!('type' in value) || value['type'] === undefined) return false;
    return true;
}

export function ExportRequestFromJSON(json: any): ExportRequest {
    return ExportRequestFromJSONTyped(json, false);
}

export function ExportRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExportRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'type': json['type'],
        'all': json['all'] == null ? undefined : json['all'],
        'recipes': json['recipes'] == null ? undefined : ((json['recipes'] as Array<any>).map(RecipeSimpleFromJSON)),
        'customFilter': json['custom_filter'] == null ? undefined : CustomFilterFromJSON(json['custom_filter']),
    };
}

export function ExportRequestToJSON(value?: ExportRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'type': value['type'],
        'all': value['all'],
        'recipes': value['recipes'] == null ? undefined : ((value['recipes'] as Array<any>).map(RecipeSimpleToJSON)),
        'custom_filter': CustomFilterToJSON(value['customFilter']),
    };
}

