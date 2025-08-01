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
 * Adds nested create feature
 * @export
 * @interface RecipeImage
 */
export interface RecipeImage {
    /**
     * 
     * @type {string}
     * @memberof RecipeImage
     */
    image?: string;
    /**
     * 
     * @type {string}
     * @memberof RecipeImage
     */
    imageUrl?: string;
}

/**
 * Check if a given object implements the RecipeImage interface.
 */
export function instanceOfRecipeImage(value: object): value is RecipeImage {
    return true;
}

export function RecipeImageFromJSON(json: any): RecipeImage {
    return RecipeImageFromJSONTyped(json, false);
}

export function RecipeImageFromJSONTyped(json: any, ignoreDiscriminator: boolean): RecipeImage {
    if (json == null) {
        return json;
    }
    return {
        
        'image': json['image'] == null ? undefined : json['image'],
        'imageUrl': json['image_url'] == null ? undefined : json['image_url'],
    };
}

export function RecipeImageToJSON(value?: RecipeImage | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'image': value['image'],
        'image_url': value['imageUrl'],
    };
}

