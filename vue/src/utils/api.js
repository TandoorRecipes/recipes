import axios from "axios";
import {makeToast} from "@/utils/utils";
import {resolveDjangoUrl} from "@/utils/utils";

export function apiLoadRecipe(recipe_id) {
    return axios.get(resolveDjangoUrl('api:recipe-detail', recipe_id)).then((response) => {
        return response.data
    }).catch((err) => {
        console.log(err)
        makeToast('Error', 'There was an error loading a resource!', 'danger')
    })
}
