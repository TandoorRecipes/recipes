import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {ref} from "vue";
import {getCookie} from "@/utils/cookie";
import {RecipeFromSourceResponseFromJSON, RecipeImage, RecipeImageFromJSON, ResponseError, UserFile, UserFileFromJSON} from "@/openapi";


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
     * @param cropData optional crop coordinates to save with the file
     */
    function createOrUpdateUserFile(name: string, file: File | null, id?: number, cropData?: Record<string, number> | null): Promise<UserFile> {
        let formData = new FormData()
        formData.append('name', name)

        if (file != null) {
            formData.append('file', file)
        }

        if (cropData) {
            formData.append('crop_data', JSON.stringify(cropData))
        }

        fileApiLoading.value = true

        let fetchUrl = getDjangoUrl('api/user-file/')
        let fetchMethod = 'POST'
        if (id) {
            fetchUrl += `${id}/`
            fetchMethod = 'PUT'
        }

        return fetch(fetchUrl, {
            method: fetchMethod,
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
            if (r.ok) {
                return r.json().then(r => {
                    return UserFileFromJSON(r)
                })
            } else {
                throw new ResponseError(r)
            }
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    /**
     * updates crop_data on an existing UserFile via JSON PATCH
     * @param id UserFile id
     * @param cropData crop coordinates to save
     */
    function updateUserFileCropData(id: number, cropData: Record<string, number>): Promise<UserFile> {
        fileApiLoading.value = true

        return fetch(getDjangoUrl(`api/user-file/${id}/`), {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({crop_data: cropData}),
        }).then(r => {
            if (r.ok) {
                return r.json().then(r => UserFileFromJSON(r))
            } else {
                throw new ResponseError(r)
            }
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    /**
     * creates a RecipeImage for a recipe
     */
    function createRecipeImage(recipeId: number, file: File, cropData?: Record<string, number> | null, isPrimary: boolean = false, order: number = 0): Promise<RecipeImage> {
        let formData = new FormData()
        formData.append('recipe', String(recipeId))
        formData.append('file', file)
        formData.append('is_primary', String(isPrimary))
        formData.append('order', String(order))
        if (cropData) {
            formData.append('crop_data', JSON.stringify(cropData))
        }
        fileApiLoading.value = true
        return fetch(getDjangoUrl('api/recipe-image/'), {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData,
        }).then(r => {
            if (r.ok) return r.json().then(j => RecipeImageFromJSON(j))
            throw new ResponseError(r)
        }).finally(() => { fileApiLoading.value = false })
    }

    /**
     * updates crop_data on an existing RecipeImage
     */
    function updateRecipeImageCropData(id: number, cropData: Record<string, number>): Promise<RecipeImage> {
        fileApiLoading.value = true
        return fetch(getDjangoUrl(`api/recipe-image/${id}/`), {
            method: 'PATCH',
            headers: {'X-CSRFToken': getCookie('csrftoken'), 'Content-Type': 'application/json'},
            body: JSON.stringify({crop_data: cropData}),
        }).then(r => {
            if (r.ok) return r.json().then(j => RecipeImageFromJSON(j))
            throw new ResponseError(r)
        }).finally(() => { fileApiLoading.value = false })
    }

    /**
     * deletes a RecipeImage
     */
    function deleteRecipeImage(id: number): Promise<void> {
        fileApiLoading.value = true
        return fetch(getDjangoUrl(`api/recipe-image/${id}/`), {
            method: 'DELETE',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
        }).then(r => {
            if (!r.ok) throw new ResponseError(r)
        }).finally(() => { fileApiLoading.value = false })
    }

    /**
     * creates a RecipeImage from a URL (server-side download)
     */
    function createRecipeImageFromUrl(recipeId: number, imageUrl: string): Promise<RecipeImage> {
        fileApiLoading.value = true
        return fetch(getDjangoUrl('api/recipe-image/from_url/'), {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken'), 'Content-Type': 'application/json'},
            body: JSON.stringify({recipe: recipeId, image_url: imageUrl}),
        }).then(r => {
            if (r.ok) return r.json().then(j => RecipeImageFromJSON(j))
            throw new ResponseError(r)
        }).finally(() => { fileApiLoading.value = false })
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

    return {fileApiLoading, createOrUpdateUserFile, updateUserFileCropData, createRecipeImage, createRecipeImageFromUrl, updateRecipeImageCropData, deleteRecipeImage, doAiImport, doAppImport}
}
