import {getCookie} from "@/utils/cookie";
import {Recipe, RecipeFromJSON, RecipeImageFromJSON, UserFileFromJSON} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

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
            return  RecipeImageFromJSON(r)
        })

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {

    })

}