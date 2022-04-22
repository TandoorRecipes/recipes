/*
 * Utility functions to call bootstrap toasts
 * */
import i18n from "@/i18n"
import {frac} from "@/utils/fractions"
/*
 * Utility functions to use OpenAPIs generically
 * */
import {ApiApiFactory} from "@/utils/openapi/api.ts"
import axios from "axios"
import {BToast} from "bootstrap-vue"
// /*
// * Utility functions to use manipulate nested components
// * */
import Vue from "vue"
import {Actions, Models} from "./models"

export const ToastMixin = {
    name: "ToastMixin",
    methods: {
        makeToast: function (title, message, variant = null) {
            return makeToast(title, message, variant)
        },
    },
}

export function makeToast(title, message, variant = null) {
    let toaster = new BToast()
    toaster.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: "b-toaster-bottom-right",
        solid: true,
    })
}

export class StandardToasts {
    static SUCCESS_CREATE = "SUCCESS_CREATE"
    static SUCCESS_FETCH = "SUCCESS_FETCH"
    static SUCCESS_UPDATE = "SUCCESS_UPDATE"
    static SUCCESS_DELETE = "SUCCESS_DELETE"
    static SUCCESS_MOVE = "SUCCESS_MOVE"
    static SUCCESS_MERGE = "SUCCESS_MERGE"

    static FAIL_CREATE = "FAIL_CREATE"
    static FAIL_FETCH = "FAIL_FETCH"
    static FAIL_UPDATE = "FAIL_UPDATE"
    static FAIL_DELETE = "FAIL_DELETE"
    static FAIL_DELETE_PROTECTED = "FAIL_DELETE_PROTECTED"
    static FAIL_MOVE = "FAIL_MOVE"
    static FAIL_MERGE = "FAIL_MERGE"

    static makeStandardToast(toast, err_details = undefined) { //TODO err_details render very ugly, improve this maybe by using a custom toast component (in conjunction with error logging maybe)
        switch (toast) {
            case StandardToasts.SUCCESS_CREATE:
                makeToast(i18n.tc("Success"), i18n.tc("success_creating_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.SUCCESS_FETCH:
                makeToast(i18n.tc("Success"), i18n.tc("success_fetching_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.SUCCESS_UPDATE:
                makeToast(i18n.tc("Success"), i18n.tc("success_updating_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.SUCCESS_DELETE:
                makeToast(i18n.tc("Success"), i18n.tc("success_deleting_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.SUCCESS_MOVE:
                makeToast(i18n.tc("Success"), i18n.tc("success_moving_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.SUCCESS_MERGE:
                makeToast(i18n.tc("Success"), i18n.tc("success_merging_resource") + (err_details ? "\n" + err_details : ""), "success")
                break
            case StandardToasts.FAIL_CREATE:
                makeToast(i18n.tc("Failure"), i18n.tc("err_creating_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
            case StandardToasts.FAIL_FETCH:
                makeToast(i18n.tc("Failure"), i18n.tc("err_fetching_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
            case StandardToasts.FAIL_UPDATE:
                makeToast(i18n.tc("Failure"), i18n.tc("err_updating_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
            case StandardToasts.FAIL_DELETE:
                makeToast(i18n.tc("Failure"), i18n.tc("err_deleting_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
            case StandardToasts.FAIL_DELETE_PROTECTED:
                makeToast(i18n.tc("Protected"), i18n.tc("err_deleting_protected_resource"), "danger")
                break
            case StandardToasts.FAIL_MOVE:
                makeToast(i18n.tc("Failure"), i18n.tc("err_moving_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
            case StandardToasts.FAIL_MERGE:
                makeToast(i18n.tc("Failure"), i18n.tc("err_merging_resource") + (err_details ? "\n" + err_details : ""), "danger")
                break
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
        },
    },
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
        },
    },
}

export function resolveDjangoUrl(url, params = null) {
    if (params == null) {
        return window.Urls[url]()
    } else if (typeof params != "object") {
        return window.Urls[url](params)
    } else if (typeof params == "object") {
        if (params.length === 1) {
            return window.Urls[url](params)
        } else if (params.length === 2) {
            return window.Urls[url](params[0], params[1])
        } else if (params.length === 3) {
            return window.Urls[url](params[0], params[1], params[2])
        }
    }
}

/*
 * Utility functions to use djangos static files
 * */

export const StaticMixin = {
    methods: {
        /**
         * access django static files from javascript
         * @param {string} param path to static file
         */
        resolveDjangoStatic: function (param) {
            return resolveDjangoStatic(param)
        },
    },
}

export function resolveDjangoStatic(param) {
    let url = localStorage.getItem('STATIC_URL') + param
    return url.replace('//','/') //replace // with / in case param started with / which resulted in // after the static base url
}

/*
 * other utilities
 * */
export function getUserPreference(pref = undefined) {
    let user_preference
    if (document.getElementById("user_preference")) {
        user_preference = JSON.parse(document.getElementById("user_preference").textContent)
    } else {
        return undefined
    }
    if (pref) {
        return user_preference?.[pref]
    }
    return user_preference
}

export function calculateAmount(amount, factor) {
    if (getUserPreference("use_fractions")) {
        let return_string = ""
        let fraction = frac(amount * factor, 10, true)

        if (fraction[0] === 0 && fraction[1] === 0 && fraction[2] === 1) {
            return roundDecimals(amount * factor)
        }

        if (fraction[0] > 0) {
            return_string += fraction[0]
        }

        if (fraction[1] > 0) {
            return_string += ` <sup>${fraction[1]}</sup>&frasl;<sub>${fraction[2]}</sub>`
        }

        return return_string
    } else {
        return roundDecimals(amount * factor)
    }
}

export function roundDecimals(num) {
    let decimals = getUserPreference("user_fractions") ? getUserPreference("user_fractions") : 2
    return +(Math.round(num + `e+${decimals}`) + `e-${decimals}`)
}

const KILOJOULES_PER_CALORIE = 4.18

export function calculateEnergy(amount, factor) {
    if (getUserPreference("use_kj")) {
        let joules = amount * KILOJOULES_PER_CALORIE
        return calculateAmount(joules, factor) + " kJ"
    } else {
        return calculateAmount(amount, factor) + " kcal"
    }
}

export function convertEnergyToCalories(amount) {
    if (getUserPreference("use_kj")) {
        return amount / KILOJOULES_PER_CALORIE
    } else {
        return amount
    }
}

export function energyHeading() {
    if (getUserPreference("use_kj")) {
        return "Energy"
    } else {
        return "Calories"
    }
}

axios.defaults.xsrfCookieName = "csrftoken"
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export const ApiMixin = {
    data() {
        return {
            Models: Models,
            Actions: Actions,
        }
    },
    methods: {
        genericAPI: function (model, action, options) {
            let setup = getConfig(model, action)
            if (setup?.config?.function) {
                return specialCases[setup.config.function](action, options, setup)
            }
            let func = setup.function
            let parameters = buildParams(options, setup)
            let apiClient = new ApiApiFactory()
            return apiClient[func](...parameters)
        },
        genericGetAPI: function (url, options) {
            return axios.get(resolveDjangoUrl(url), {params: options, emulateJSON: true})
        },
        genericPostAPI: function (url, form) {
            let data = new FormData()
            Object.keys(form).forEach((field) => {
                data.append(field, form[field])
            })
            return axios.post(resolveDjangoUrl(url), data)
        },
    },
}

// /*
// * local functions for ApiMixin
// * */
function formatParam(config, value, options) {
    if (config) {
        for (const [k, v] of Object.entries(config)) {
            switch (k) {
                case "type":
                    switch (v) {
                        case "string":
                            if (Array.isArray(value)) {
                                let tmpValue = []
                                value.forEach((x) => tmpValue.push(String(x)))
                                value = tmpValue
                            } else if (value !== undefined) {
                                value = String(value)
                            }
                            break
                        case "integer":
                            if (Array.isArray(value)) {
                                let tmpValue = []
                                value.forEach((x) => tmpValue.push(parseInt(x)))
                                value = tmpValue
                            } else if (value !== undefined) {
                                value = parseInt(value)
                            }
                            break
                    }
                    break
                case "function":
                    // needs wrapped in a promise and wait for the called function to complete before moving on
                    specialCases[v](value, options)
                    break
            }
        }
    }
    return value
}

function buildParams(options, setup) {
    let config = setup?.config ?? {}
    let params = setup?.params ?? []
    let parameters = []
    let this_value = undefined
    params.forEach(function (item, index) {
        if (Array.isArray(item)) {
            this_value = {}
            // if the value is an array, convert it to a dictionary of key:value
            // filtered based on OPTIONS passed
            // maybe map/reduce is better?
            for (const [k, v] of Object.entries(options)) {
                if (item.includes(k)) {
                    this_value[k] = formatParam(config?.[k], v, options)
                }
            }
        } else {
            this_value = formatParam(config?.[item], options?.[item] ?? undefined, options)
        }
        // if no value is found so far, get the default if it exists
        if (this_value === undefined) {
            this_value = getDefault(config?.[item], options)
        }
        parameters.push(this_value)
    })
    return parameters
}

function getDefault(config, options) {
    let value = undefined
    value = config?.default ?? undefined
    if (typeof value === "object") {
        let condition = false
        switch (value.function) {
            // CONDITIONAL case requires 4 keys:
            // - check: which other OPTIONS key to check against
            // - operator: what type of operation to perform
            // - true: what value to assign when true
            // - false: what value to assign when false
            case "CONDITIONAL":
                switch (value.operator) {
                    case "not_exist":
                        condition = (!options?.[value.check] ?? undefined) || options?.[value.check]?.length == 0
                        if (condition) {
                            value = value.true
                        } else {
                            value = value.false
                        }
                        break
                }
                break
        }
    }
    return value
}

export function getConfig(model, action) {
    let f = action.function
    // if not defined partialUpdate will use params from create
    if (f === "partialUpdate" && !model?.[f]?.params) {
        model[f] = {params: [...["id"], ...model.create.params]}
    }

    let config = {
        name: i18n.t(model.name),
        apiName: model.apiName,
    }
    // spread operator merges dictionaries - last item in list takes precedence
    config = {...config, ...action, ...model.model_type?.[f], ...model?.[f]}
    // nested dictionaries are not merged - so merge again on any nested keys
    config.config = {...action?.config, ...model.model_type?.[f]?.config, ...model?.[f]?.config}
    // look in partialUpdate again if necessary
    if (f === "partialUpdate" && Object.keys(config.config).length === 0) {
        config.config = {...model.model_type?.create?.config, ...model?.create?.config}
    }
    config["function"] = f + config.apiName + (config?.suffix ?? "") // parens are required to force optional chaining to evaluate before concat
    return config
}

// /*
// * functions for Generic Modal Forms
// * */
export function getForm(model, action, item1, item2) {
    let f = action.function
    let config = {...action?.form, ...model.model_type?.[f]?.form, ...model?.[f]?.form}
    // if not defined partialUpdate will use form from create
    if (f === "partialUpdate" && Object.keys(config).length == 0) {
        config = {...Actions.CREATE?.form, ...model.model_type?.["create"]?.form, ...model?.["create"]?.form}
        config["title"] = {...action?.form_title, ...model.model_type?.[f]?.form_title, ...model?.[f]?.form_title}
        // form functions should not be inherited
        if (config?.["form_function"]?.includes("Create")) {
            delete config["form_function"]
        }
    }
    let form = {fields: []}
    let value = ""
    for (const [k, v] of Object.entries(config)) {
        if (v?.function) {
            switch (v.function) {
                case "translate":
                    value = formTranslate(v, model, item1, item2)
            }
        } else {
            value = v
        }
        if (value?.form_field) {
            for (const [i, h] of Object.entries(value)) {
                // console.log("formfield", i)
            }
            value["value"] = item1?.[value?.field] ?? undefined
            value["help"] = item1?.[value?.help_text_field] ?? formTranslate(value?.help_text) ?? undefined
            value["subtitle"] = item1?.[value?.subtitle_field] ?? value?.subtitle ?? undefined
            form.fields.push({
                ...value,
                ...{
                    label: formTranslate(value?.label, model, item1, item2),
                    placeholder: formTranslate(value?.placeholder, model, item1, item2),
                },
            })
        } else {
            form[k] = value
        }
    }
    return form
}

function formTranslate(translate, model, item1, item2) {
    if (typeof translate !== "object") {
        return i18n.t(translate)
    }
    let phrase = translate.phrase
    let options = {}
    let value = undefined
    translate?.params?.forEach(function (x, index) {
        switch (x?.from) {
            case "item1":
                value = item1[x.attribute]
                break
            case "item2":
                value = item2[x.attribute]
                break
            case "model":
                value = model[x.attribute]
                break
            default:
                value = x.attribute
        }

        if (x.translate) {
            options[x.token] = i18n.t(value)
        } else {
            options[x.token] = value
        }
    })
    return i18n.t(phrase, options)
}

export const CardMixin = {
    methods: {
        findCard: function (id, card_list) {
            let card_length = card_list?.length ?? 0
            if (card_length == 0) {
                return false
            }
            let cards = card_list.filter((obj) => obj.id == id)
            if (cards.length == 1) {
                return cards[0]
            } else if (cards.length == 0) {
                for (const c of card_list.filter((x) => x.show_children == true)) {
                    cards = this.findCard(id, c.children)
                    if (cards) {
                        return cards
                    }
                }
            } else {
                console.log("something terrible happened")
            }
        },
        destroyCard: function (id, card_list) {
            let card = this.findCard(id, card_list)
            let p_id = card?.parent ?? undefined

            if (p_id) {
                let parent = this.findCard(p_id, card_list)
                if (parent) {
                    Vue.set(parent, "numchild", parent.numchild - 1)
                    if (parent.show_children) {
                        let idx = parent.children.indexOf(parent.children.find((x) => x.id === id))
                        Vue.delete(parent.children, idx)
                    }
                }
            }
            return card_list.filter((x) => x.id != id)
        },
        refreshCard: function (obj, card_list) {
            let target = {}
            let idx = undefined
            target = this.findCard(obj.id, card_list)

            if (target) {
                idx = card_list.indexOf(card_list.find((x) => x.id === target.id))
                Vue.set(card_list, idx, obj)
            }
            if (target?.parent) {
                let parent = this.findCard(target.parent, card_list)
                if (parent) {
                    if (parent.show_children) {
                        idx = parent.children.indexOf(parent.children.find((x) => x.id === target.id))
                        Vue.set(parent.children, idx, obj)
                    }
                }
            }
        },
    },
}

const specialCases = {
    // the supermarket API requires chaining promises together, instead of trying to make
    // this use case generic just treat it as a unique use case
    SupermarketWithCategories: function (action, options, setup) {
        let API = undefined
        let GenericAPI = ApiMixin.methods.genericAPI
        let params = []
        if (action.function === "partialUpdate") {
            API = GenericAPI
            params = [Models.SUPERMARKET, Actions.FETCH, {id: options.id}]
        } else if (action.function === "create") {
            API = new ApiApiFactory()[setup.function]
            params = buildParams(options, setup)
        }

        return API(...params)
            .then((result) => {
                // either get the supermarket or create the supermarket (but without the category relations)
                return result.data
            })
            .then((result) => {
                // delete, update or change all of the category/relations
                let id = result.id
                let existing_categories = result.category_to_supermarket
                let updated_categories = options.category_to_supermarket.map((x) => {
                    return {
                        ...x,
                        category: {
                            id: x?.category?.id ?? x.id,
                            name: x?.category?.name ?? x.name,
                        },
                        id: x?.category_to_supermarket__id,
                        order: x?.order ?? x?.category_to_supermarket__order,
                    }
                })

                let promises = []
                // if the 'category.name' key does not exist on the updated_categories, the categories were not updated

                // list of category relationship ids that are not part of the updated supermarket
                let removed_categories = existing_categories.filter((x) => !updated_categories.map((x) => x.category.id).includes(x.category.id))
                let added_categories = updated_categories.filter((x) => !existing_categories.map((x) => x.category.id).includes(x.category.id))
                let changed_categories = updated_categories.filter((x) => existing_categories.map((x) => x.category.id).includes(x.category.id))
                let order = Math.max(...existing_categories.map((x) => x?.order ?? 0), ...updated_categories.map((x) => x?.order ?? 0), 0) + 1

                removed_categories.forEach((x) => {
                    promises.push(GenericAPI(Models.SHOPPING_CATEGORY_RELATION, Actions.DELETE, {id: x.id}))
                })
                let item = {supermarket: id}
                added_categories.forEach((x) => {
                    item.order = x?.order ?? order
                    if (!x?.order) {
                        order = order + 1
                    }
                    item.category = {id: x.category.id, name: x.category.name}
                    promises.push(GenericAPI(Models.SHOPPING_CATEGORY_RELATION, Actions.CREATE, item))
                })
                changed_categories.forEach((x) => {
                    item.id = x?.id ?? existing_categories.find((y) => y.category.id === x.category.id).id
                    item.order = x?.order ?? order
                    if (!x?.order) {
                        order = order + 1
                    }
                    item.category = {id: x.category.id, name: x.category.name}
                    promises.push(GenericAPI(Models.SHOPPING_CATEGORY_RELATION, Actions.UPDATE, item))
                })

                return Promise.all(promises).then(() => {
                    // finally get and return the Supermarket which everything downstream is expecting
                    return GenericAPI(Models.SUPERMARKET, Actions.FETCH, {id: id})
                })
            })
    },
}

export const formFunctions = {
    FoodCreateDefault: function (form) {
        form.fields.filter((x) => x.field === "inherit_fields")[0].value = getUserPreference("food_inherit_default")
        return form
    },
}
