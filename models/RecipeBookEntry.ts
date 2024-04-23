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
import type { RecipeBook } from './RecipeBook';
import {
    RecipeBookFromJSON,
    RecipeBookFromJSONTyped,
    RecipeBookToJSON,
} from './RecipeBook';
import type { RecipeOverview } from './RecipeOverview';
import {
    RecipeOverviewFromJSON,
    RecipeOverviewFromJSONTyped,
    RecipeOverviewToJSON,
} from './RecipeOverview';

/**
 * 
 * @export
 * @interface RecipeBookEntry
 */
export interface RecipeBookEntry {
    /**
     * 
     * @type {number}
     * @memberof RecipeBookEntry
     */
    readonly id: number;
    /**
     * 
     * @type {number}
     * @memberof RecipeBookEntry
     */
    book: number;
    /**
     * 
     * @type {RecipeBook}
     * @memberof RecipeBookEntry
     */
    readonly bookContent: RecipeBook;
    /**
     * 
     * @type {number}
     * @memberof RecipeBookEntry
     */
    recipe: number;
    /**
     * 
     * @type {RecipeOverview}
     * @memberof RecipeBookEntry
     */
    readonly recipeContent: RecipeOverview;
}

/**
 * Check if a given object implements the RecipeBookEntry interface.
 */
export function instanceOfRecipeBookEntry(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "book" in value;
    isInstance = isInstance && "bookContent" in value;
    isInstance = isInstance && "recipe" in value;
    isInstance = isInstance && "recipeContent" in value;

    return isInstance;
}

export function RecipeBookEntryFromJSON(json: any): RecipeBookEntry {
    return RecipeBookEntryFromJSONTyped(json, false);
}

export function RecipeBookEntryFromJSONTyped(json: any, ignoreDiscriminator: boolean): RecipeBookEntry {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'book': json['book'],
        'bookContent': RecipeBookFromJSON(json['book_content']),
        'recipe': json['recipe'],
        'recipeContent': RecipeOverviewFromJSON(json['recipe_content']),
    };
}

export function RecipeBookEntryToJSON(value?: RecipeBookEntry | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'book': value.book,
        'recipe': value.recipe,
    };
}
