import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {ref} from "vue";
import {getCookie} from "@/utils/cookie";
import {RecipeImageFromJSON, UserFile, UserFileFromJSON} from "@/openapi";
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

    function updateRecipeImage(recipeId: number, file: File|null){
        let formData = new FormData()
        if (file != null) {
            formData.append('image', file)
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

    return {fileApiLoading, createOrUpdateUserFile, updateRecipeImage}
}