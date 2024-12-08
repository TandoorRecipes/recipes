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
import type { SourceImportRecipe } from './SourceImportRecipe';
import {
    SourceImportRecipeFromJSON,
    SourceImportRecipeFromJSONTyped,
    SourceImportRecipeToJSON,
    SourceImportRecipeToJSONTyped,
} from './SourceImportRecipe';

/**
 * 
 * @export
 * @interface RecipeFromSourceResponse
 */
export interface RecipeFromSourceResponse {
    /**
     * 
     * @type {SourceImportRecipe}
     * @memberof RecipeFromSourceResponse
     */
    recipe?: SourceImportRecipe;
    /**
     * 
     * @type {Array<any>}
     * @memberof RecipeFromSourceResponse
     */
    images?: Array<any>;
    /**
     * 
     * @type {boolean}
     * @memberof RecipeFromSourceResponse
     */
    error?: boolean;
    /**
     * 
     * @type {string}
     * @memberof RecipeFromSourceResponse
     */
    msg?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof RecipeFromSourceResponse
     */
    duplicate?: Array<number>;
}

/**
 * Check if a given object implements the RecipeFromSourceResponse interface.
 */
export function instanceOfRecipeFromSourceResponse(value: object): value is RecipeFromSourceResponse {
    return true;
}

export function RecipeFromSourceResponseFromJSON(json: any): RecipeFromSourceResponse {
    return RecipeFromSourceResponseFromJSONTyped(json, false);
}

export function RecipeFromSourceResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): RecipeFromSourceResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'recipe': json['recipe'] == null ? undefined : SourceImportRecipeFromJSON(json['recipe']),
        'images': json['images'] == null ? undefined : json['images'],
        'error': json['error'] == null ? undefined : json['error'],
        'msg': json['msg'] == null ? undefined : json['msg'],
        'duplicate': json['duplicate'] == null ? undefined : json['duplicate'],
    };
}

export function RecipeFromSourceResponseToJSON(json: any): RecipeFromSourceResponse {
    return RecipeFromSourceResponseToJSONTyped(json, false);
}

export function RecipeFromSourceResponseToJSONTyped(value?: RecipeFromSourceResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'recipe': SourceImportRecipeToJSON(value['recipe']),
        'images': value['images'],
        'error': value['error'],
        'msg': value['msg'],
        'duplicate': value['duplicate'],
    };
}

