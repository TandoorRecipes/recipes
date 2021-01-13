import axios from "axios";
import {djangoGettext as _, makeToast} from "@/utils/utils";
import {resolveDjangoUrl} from "@/utils/utils";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export function apiLoadRecipe(recipe_id) {
    return axios.get(resolveDjangoUrl('api:recipe-detail', recipe_id)).then((response) => {
        return response.data
    }).catch((err) => {
        console.log(err.response)
        makeToast('Error', 'There was an error loading a resource!', 'danger')
    })
}


export function apiLogCooking(cook_log) {
    return axios.post(resolveDjangoUrl('api:cooklog-list',), cook_log).then((response) => {
        console.log(response)
        makeToast('Saved', 'Cook Log entry saved!', 'success')
    }).catch((err) => {
        handleError(err, 'There was an error creating a resource!', 'danger')
    })
}

function handleError(error, message) {
    if ('response' in error) {
        console.log(error.response)
        let title = (('statusText' in error.response) ? error.response.statusText : _('Error'))
        message += '\n\n' + JSON.stringify(error.response.data);
        makeToast(title, message, 'danger')
    } else {
        makeToast('Error', message, 'danger')
        console.log(error)
    }
}