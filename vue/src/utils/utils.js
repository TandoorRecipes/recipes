/*
* Utility functions to call bootstrap toasts
* */
import {BToast} from 'bootstrap-vue'
import i18n from "@/i18n";

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

export class StandardToasts {
    static SUCCESS_CREATE = 'SUCCESS_CREATE'
    static SUCCESS_FETCH = 'SUCCESS_FETCH'
    static SUCCESS_UPDATE = 'SUCCESS_UPDATE'
    static SUCCESS_DELETE = 'SUCCESS_DELETE'

    static FAIL_CREATE = 'FAIL_CREATE'
    static FAIL_FETCH = 'FAIL_FETCH'
    static FAIL_UPDATE = 'FAIL_UPDATE'
    static FAIL_DELETE = 'FAIL_DELETE'

    static makeStandardToast(toast) {
        switch (toast) {
            case StandardToasts.SUCCESS_CREATE:
                makeToast(i18n.tc('Success'), i18n.tc('success_creating_resource'), 'success')
                break;
            case StandardToasts.SUCCESS_FETCH:
                makeToast(i18n.tc('Success'), i18n.tc('success_fetching_resource'), 'success')
                break;
            case StandardToasts.SUCCESS_UPDATE:
                makeToast(i18n.tc('Success'), i18n.tc('success_updating_resource'), 'success')
                break;
            case StandardToasts.SUCCESS_DELETE:
                makeToast(i18n.tc('Success'), i18n.tc('success_deleting_resource'), 'success')
                break;
            case StandardToasts.FAIL_CREATE:
                makeToast(i18n.tc('Failure'), i18n.tc('success_creating_resource'), 'danger')
                break;
            case StandardToasts.FAIL_FETCH:
                makeToast(i18n.tc('Failure'), i18n.tc('err_fetching_resource'), 'danger')
                break;
            case StandardToasts.FAIL_UPDATE:
                makeToast(i18n.tc('Failure'), i18n.tc('err_updating_resource'), 'danger')
                break;
            case StandardToasts.FAIL_DELETE:
                makeToast(i18n.tc('Failure'), i18n.tc('err_deleting_resource'), 'danger')
                break;

        }
    }
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
        resolveDjangoUrl: function (url, params = null) {
            return resolveDjangoUrl(url, params)
        }
    }
}

export function resolveDjangoUrl(url, params = null) {
    if (params !== null) {
        return window.Urls[url](params)
    } else {
        return window.Urls[url]()
    }
}

/*
* other utilities
* */

export function getUserPreference(pref) {
    return window.USER_PREF[pref]
}

import {frac} from "@/utils/fractions";

export function calculateAmount(amount, factor) {
    if (getUserPreference('use_fractions')) {
        let return_string = ''
        let fraction = frac((amount * factor), 9, true)

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
