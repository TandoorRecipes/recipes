import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {ref} from "vue";
import {getCookie} from "@/utils/cookie";
import {RecipeFromJSON, RecipeFromSourceFromJSON, RecipeFromSourceResponseFromJSON, RecipeImageFromJSON, UserFile, UserFileFromJSON} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

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
        let formData = new FormData()
        formData.append('name', name)

        if (file != null) {
            formData.append('file', file)
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
            return r.json().then(r => {
                return UserFileFromJSON(r)
            })
        }).finally(() => {
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

        return fetch(getDjangoUrl(`api/recipe/${recipeId}/image/`), {
            method: 'PUT',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
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
     */
    function convertImageToRecipe(file: File) {
        let formData = new FormData()
        if (file != null) {
            formData.append('image', file)
        }

        return fetch(getDjangoUrl(`api/image-to-recipe/`), {
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
     * @param file array to import
     * @param app app to import
     * @param includeDuplicates if recipes that were found as duplicates should be imported as well
     */
    function doAppImport(file: File, app: string, includeDuplicates: boolean) {
        let formData = new FormData()
        formData.append('type', app);
        formData.append('duplicates', includeDuplicates ? 'true' : 'false')
        // files.forEach(file => {
        //     formData.append('files', file)
        // })
formData.append('files', file)

        return fetch(getDjangoUrl(`api/import/`), {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => {
            console.log(r)
        }).finally(() => {
            fileApiLoading.value = false
        })
    }

    return {fileApiLoading, createOrUpdateUserFile, updateRecipeImage, convertImageToRecipe, doAppImport}
}