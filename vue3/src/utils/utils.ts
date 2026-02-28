import {getCookie} from "@/utils/cookie";
import {Recipe, RecipeFromJSON, RecipeImageFromJSON, UserFileFromJSON} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";

/**
 * Builds a dot-separated subtitle string from an item's column values.
 * Used by both mobile and desktop subtitle displays.
 */
export function buildSubtitleText(
    item: any,
    columns: { key: string; field?: string; title: string }[],
    t: (key: string) => string,
): string {
    const parts: string[] = []
    for (const col of columns) {
        const field = col.field ?? col.key
        const val = getNestedProperty(item, field)
        if (val == null || val === '' || val === false) continue
        if (typeof val === 'number' || typeof val === 'boolean') {
            parts.push(`${t(col.title)}: ${val}`)
        } else {
            parts.push(String(val))
        }
    }
    return parts.join(' \u00b7 ')
}

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

/**
 * routeQueryParam transformer for boolean fields converting string bools to real bools
 */
export const boolOrUndefinedTransformer = {
    get: (value: string | null | undefined) => ((value == null) ? undefined : value == 'true'),
    set: (value: boolean | null | undefined) => ((value == null) ? undefined : value.toString())
}

/**
 * routeQueryParam transformer for number fields converting string numbers to real numbers and allowing undefined for resettable parameters
 */
export const numberOrUndefinedTransformer = {
    get: (value: string | null | undefined) => ((value == null) ? undefined : Number(value)),
    set: (value: string | null | undefined) => ((value == null) ? undefined : value.toString())
}
