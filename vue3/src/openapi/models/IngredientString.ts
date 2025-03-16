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
 * @interface IngredientString
 */
export interface IngredientString {
    /**
     * 
     * @type {string}
     * @memberof IngredientString
     */
    text: string;
}

/**
 * Check if a given object implements the IngredientString interface.
 */
export function instanceOfIngredientString(value: object): value is IngredientString {
    if (!('text' in value) || value['text'] === undefined) return false;
    return true;
}

export function IngredientStringFromJSON(json: any): IngredientString {
    return IngredientStringFromJSONTyped(json, false);
}

export function IngredientStringFromJSONTyped(json: any, ignoreDiscriminator: boolean): IngredientString {
    if (json == null) {
        return json;
    }
    return {
        
        'text': json['text'],
    };
}

export function IngredientStringToJSON(value?: IngredientString | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'text': value['text'],
    };
}

