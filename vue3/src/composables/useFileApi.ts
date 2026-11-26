import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {ref} from "vue";
import {getCookie} from "@/utils/cookie";
import {ApiApi, RecipeFromSourceResponseFromJSON, RecipeImageFromJSON, ResponseError, UserFile} from "@/openapi";


/**
 * function to upload files to the multipart endpoints accepting file uploads
 */
export function useFileApi() {
    const {getDjangoUrl} = useDjangoUrls()

    const fileApiLoading = ref(false)

    /**
     * creates or updates an existing UserFile if an id is given
     * @param name name to set for user file
     * @param file file object to upload
     * @param id optional id to update existing user file
     */
    function createOrUpdateUserFile(name: string, file: File | null, id?: number): Promise<UserFile> {
        fileApiLoading.value = true
        const api = new ApiApi()
        const request = {name, file: file ?? undefined}
        const requestPromise = id
            ? api.apiUserFileUpdate({id, ...request})
            : api.apiUserFileCreate(request)
        return requestPromise.finally(() => {
            fileApiLoading.value = false
        })
    }

    /**
     * update a recipes image either by a given file or given url
     * @param recipeId ID of recipe to update
     * @param file file object to upload or null to delete image (if no imageUrl is given)
     * @param imageUrl url of an image to download by server
     */
    function updateRecipeImage(recipeId: number, file: File | null, imageUrl?: string) {
        let formData = new FormData()
        if (file != null) {
            formData.append('image', file)
        }
        if (imageUrl) {
            formData.append('image_url', imageUrl)
        }

        fileApiLoading.value = true
        return fetch(getDjangoUrl(`api/recipe/${recipeId}/image/`), {
            method: 'PUT',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
            if (!r.ok) {
                throw new ResponseError(r)
            }
            return r.json().then(r => {
                return RecipeImageFromJSON(r)
            })
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    /**
     * uploads the given file to the image recognition endpoint
     * @param file file object to upload
     * @param text text to import
     * @param recipeId id of a recipe to use as import base (for external recipes
     */
    function doAiImport(providerId: number, file: File | null, text: string = '', recipeId: string = '') {
        let formData = new FormData()

        if (file != null) {
            formData.append('file', file)
        } else {
            formData.append('file', '')
        }
        formData.append('text', text)
        formData.append('recipe_id', recipeId)
        formData.append('ai_provider_id', providerId)
        fileApiLoading.value = true

        return fetch(getDjangoUrl(`api/ai-import/`), {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
            return r.json().then(r => {
                return RecipeFromSourceResponseFromJSON(r)
            })
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    /**
     * uploads the given files to the app import endpoint
     * @param files array to import
     * @param app app to import
     * @param includeDuplicates if recipes that were found as duplicates should be imported as well
     * @param mealPlans if meal plans should be imported
     * @param shoppingLists if shopping lists should be imported
     * @param nutritionPerServing if nutrition information should be treated as per serving (if false its treated as per recipe)
     * @returns Promise resolving to the import ID of the app import
     */
    function doAppImport(files: File[], app: string, includeDuplicates: boolean, mealPlans: boolean = true, shoppingLists: boolean = true, nutritionPerServing: boolean = false,) {
        fileApiLoading.value = true

        let formData = new FormData()
        formData.append('type', app);
        formData.append('duplicates', includeDuplicates ? 'true' : 'false')
        formData.append('meal_plans', mealPlans ? 'true' : 'false')
        formData.append('shopping_lists', shoppingLists ? 'true' : 'false')
        formData.append('nutrition_per_serving', nutritionPerServing ? 'true' : 'false')
        files.forEach(file => {
            formData.append('files', file)
        })

        return fetch(getDjangoUrl(`api/import/`), {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
            return r.json().then(r => {
                return r.import_id
            })
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    return {fileApiLoading, createOrUpdateUserFile, updateRecipeImage, doAiImport, doAppImport}
}
