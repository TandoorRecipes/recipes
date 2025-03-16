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
import type { SourceImportDuplicate } from './SourceImportDuplicate';
import {
    SourceImportDuplicateFromJSON,
    SourceImportDuplicateFromJSONTyped,
    SourceImportDuplicateToJSON,
} from './SourceImportDuplicate';
import type { SourceImportRecipe } from './SourceImportRecipe';
import {
    SourceImportRecipeFromJSON,
    SourceImportRecipeFromJSONTyped,
    SourceImportRecipeToJSON,
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
     * @type {Array<string>}
     * @memberof RecipeFromSourceResponse
     */
    images?: Array<string>;
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
     * @type {Array<SourceImportDuplicate>}
     * @memberof RecipeFromSourceResponse
     */
    duplicates?: Array<SourceImportDuplicate>;
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
        'duplicates': json['duplicates'] == null ? undefined : ((json['duplicates'] as Array<any>).map(SourceImportDuplicateFromJSON)),
    };
}

export function RecipeFromSourceResponseToJSON(value?: RecipeFromSourceResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'recipe': SourceImportRecipeToJSON(value['recipe']),
        'images': value['images'],
        'error': value['error'],
        'msg': value['msg'],
        'duplicates': value['duplicates'] == null ? undefined : ((value['duplicates'] as Array<any>).map(SourceImportDuplicateToJSON)),
    };
}

