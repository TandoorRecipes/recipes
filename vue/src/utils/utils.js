import { BToast } from 'bootstrap-vue'

export function makeToast(title, message, variant = null) {
    let toaster = new BToast()
    toaster.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        solid: true
    })
}