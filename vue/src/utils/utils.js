/*
* Utility functions to call bootstrap toasts
* */
import {BToast} from 'bootstrap-vue'

export const ToastMixin = {
    methods: {
        makeToast: function (title, message, variant = null) {
            return makeToast(title, message, variant)
        }
    }
}

export function makeToast(title, message, variant = null) {
    let toaster = new BToast()
    toaster.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        solid: true
    })
}

/*
* Utility functions to use djangos gettext
* */

export const GettextMixin = {
    methods: {
        /**
         * uses djangos javascript gettext implementation to localize text
         * @param {string} param string to translate
         */
        _: function (param) {
            return djangoGettext(param)
        }
    }
}

export function djangoGettext(param) {
    return window.gettext(param)
}

/*
* Utility function to use djangos named urls
* */

// uses https://github.com/ierror/django-js-reverse#use-the-urls-in-javascript
export const ResolveUrlMixin = {
    methods: {
        /**
         * Returns path of a django named URL
         * @param {string} url name of url
         * @param {*} params tuple of params to pass to django named url
         */
        resolveDjangoUrl: function (url, params) {
            return resolveDjangoUrl(url, params)
        }
    }
}

export function resolveDjangoUrl(url, params) {
    return window.Urls[url](params)
}

/*
* other utilities
* */

export function getUserPreference(pref) {
    return window.USER_PREF[pref]
}

import {frac} from "@/utils/fractions";

export function calculateAmount(amount, factor) {
    if (getUserPreference('user_fractions')) {
        let return_string = ''
        let fraction = frac.cont((amount * factor), 9, true)

        if (fraction[0] > 0) {
            return_string += fraction[0]
        }

        if (fraction[1] > 0) {
            return_string += ` <sup>${(fraction[1])}</sup>&frasl;<sub>${(fraction[2])}</sub>`
        }

        return return_string
    } else {
        return roundDecimals(amount * factor)
    }
}

export function roundDecimals(num) {
    let decimals = ((getUserPreference('user_fractions')) ? getUserPreference('user_fractions') : 2);
    return +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);
}
