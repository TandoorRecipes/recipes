import axios from "axios";
import {makeToast} from "@/utils/utils";


export function apiLoadRecipe(recipe_id) {
    return axios.get(`/api/recipe/${recipe_id}`).then((response) => {
        return response.data
    }).catch((err) => {
        console.log(err)
        makeToast('Error', 'There was an error loading a resource!', 'danger')
    })
}
