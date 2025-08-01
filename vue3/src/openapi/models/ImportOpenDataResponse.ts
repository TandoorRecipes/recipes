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
import type { ImportOpenDataResponseDetail } from './ImportOpenDataResponseDetail';
import {
    ImportOpenDataResponseDetailFromJSON,
    ImportOpenDataResponseDetailFromJSONTyped,
    ImportOpenDataResponseDetailToJSON,
} from './ImportOpenDataResponseDetail';

/**
 * 
 * @export
 * @interface ImportOpenDataResponse
 */
export interface ImportOpenDataResponse {
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    food?: ImportOpenDataResponseDetail;
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    unit?: ImportOpenDataResponseDetail;
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    category?: ImportOpenDataResponseDetail;
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    property?: ImportOpenDataResponseDetail;
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    store?: ImportOpenDataResponseDetail;
    /**
     * 
     * @type {ImportOpenDataResponseDetail}
     * @memberof ImportOpenDataResponse
     */
    conversion?: ImportOpenDataResponseDetail;
}

/**
 * Check if a given object implements the ImportOpenDataResponse interface.
 */
export function instanceOfImportOpenDataResponse(value: object): value is ImportOpenDataResponse {
    return true;
}

export function ImportOpenDataResponseFromJSON(json: any): ImportOpenDataResponse {
    return ImportOpenDataResponseFromJSONTyped(json, false);
}

export function ImportOpenDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ImportOpenDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'food': json['food'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['food']),
        'unit': json['unit'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['unit']),
        'category': json['category'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['category']),
        'property': json['property'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['property']),
        'store': json['store'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['store']),
        'conversion': json['conversion'] == null ? undefined : ImportOpenDataResponseDetailFromJSON(json['conversion']),
    };
}

export function ImportOpenDataResponseToJSON(value?: ImportOpenDataResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'food': ImportOpenDataResponseDetailToJSON(value['food']),
        'unit': ImportOpenDataResponseDetailToJSON(value['unit']),
        'category': ImportOpenDataResponseDetailToJSON(value['category']),
        'property': ImportOpenDataResponseDetailToJSON(value['property']),
        'store': ImportOpenDataResponseDetailToJSON(value['store']),
        'conversion': ImportOpenDataResponseDetailToJSON(value['conversion']),
    };
}

