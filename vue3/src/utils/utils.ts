import {getCookie} from "@/utils/cookie";
import {Recipe, RecipeFromJSON, RecipeImageFromJSON, UserFileFromJSON} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";

/**
 * Gets a nested property of an object given a dot-notation path.
 *
 * @param object The object to access the property from.
 * @param path The dot-notation path to the property.
 * @returns The value of the nested property, or `undefined` if not found.
 */
export function getNestedProperty(object: any, path: string): any {
    const pathParts = path.split('.');

    return pathParts.reduce((obj, key) => {
        if (obj && typeof obj === 'object') {
            return obj[key]
        } else {
            return undefined;
        }
    }, object);
}

//TODO just some partial code
/**
 * I currently don't know how to do this properly through the API client so this
 * helper function uploads files for now
 */
export function uploadRecipeImage(recipeId: number, file: File) {
    let formData = new FormData()
    formData.append('image', file)

    //TODO proper URL finding (sub path setups)
    // TODO maybe better use existing URL clients response functions for parsing

    fetch('/api/recipe/' + recipeId + '/image/', {
        method: 'PUT',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        body: formData
    }).then(r => {
        r.json().then(r => {
            return RecipeImageFromJSON(r)
        })

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {

    })
}

/**
 * convert a string or an array of strings into an array of numbers
 * useful for query parameter transformation
 * @param param
 */
export function toNumberArray(param: string | string[]): number[] {
    return Array.isArray(param) ? param.map(Number) : [parseInt(param)];
}

/**
 * convert a string to a bool if its either "true" or "false", return undefined otherwise
 * @param param
 */
export function stringToBool(param: string): boolean | undefined {
    if (param == "true") {
        return true
    } else if (param == "false") {
        return false
    } else {
        return undefined
    }
}

/**
 * allows binding and transforming of dates to route query parameters
 */
export const routeQueryDateTransformer = {
    get: (value: string | null | Date) => ((value == null) ? null : (new Date(value))),
    set: (value: string | null | Date) => ((value == null) ? null : (DateTime.fromJSDate(new Date(value)).toISODate()))
}