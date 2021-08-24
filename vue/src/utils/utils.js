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
    if (params == null) {
        return window.Urls[url]()
    } else if (typeof(params) != "object") {
        return window.Urls[url](params)
    } else if (typeof(params) == "object") {
        if (params.length === 1) {
            return window.Urls[url](params)
        } else if (params.length === 2) {
            return window.Urls[url](params[0],params[1])
        } else if (params.length === 3) {
            return window.Urls[url](params[0],params[1],params[2])
        }
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
        let fraction = frac((amount * factor), 10, true)

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

/*
* Utility functions to use OpenAPIs generically
* */
import {ApiApiFactory} from "@/utils/openapi/api.ts";  // TODO: is it possible to only import inside the Mixin?

import axios from "axios";
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
export const ApiMixin = {
  data() {
    return {
      api_settings: {
        // TODO consider moving this to an API type dictionary that contains api types with details on the function call name, suffix, etc
        'suffix': { // if OpenApiGenerator adds a suffix to model name in function calls
            'list': 's'
        },
        // model specific settings, when not provided will use defaults instead
        'food': { // must be lowercase
            // *REQUIRED* name is name of the model used for translations and looking up APIFactory
            'name': 'Food', 
            // *OPTIONAL: parameters will be built model -> model_type -> default
            'model_type': 'tree',  
            // *OPTIONAL* model specific params for api, if not present will attempt modeltype_create then default_create
            // an array will create a dict of name:value pairs
            'create': [['name', 'description', 'recipe', 'ignore_shopping', 'supermarket_category']],   // required: unordered array of fields that can be set during create
            // *OPTIONAL* model specific params for api, includes ordered list of parameters
            //            and an unordered array that will be converted to a dictionary and passed as the 2nd param
            'partialUpdate': ['id',  // required: ordered array of list params to patch existing object
                ['name', 'description', 'recipe', 'ignore_shopping', 'supermarket_category']  // must include ordered array of field names that can be updated
            ],
            //  *OPTIONAL*  provide model specific typing
            // 'typing': {},
        },
        'keyword': {},
        'unit': {},
        'recipe': {
            'name': 'Recipe',
            'list': ['query', 'keywords', 'foods', 'books', 'keywordsOr', 'foodsOr', 'booksOr', 'internal', 'random', '_new', 'page', 'pageSize', 'options'],
            'typing': {
                'list': {
                    'foods': 'string',
                    'keywords': 'string',
                    'books': 'string',
                }
            },

        },
        // collection of default attributes for model_type TREE. All settings except typing and values will be overwritten by model values
        'tree': {
            'values': {
                'root': 'getFunction()', // if default value is exactly 'getFunction()' will call getFunction(model_type, param, params)
                'tree': undefined,
            },
            'list': ['query', 'root', 'tree', 'page', 'pageSize'], // ordered array of list params for tree
            'typing': {
                'move': {
                    'source': 'string',
                    'target': 'string',
                }
            }
        },
        // collection of global defaults.  All settings except typing and values will be overwritten by model_type or model values
        'default': {
            'list': ['query', 'page', 'pageSize'], // ordered array of list params for default listApi
            'destroy': ['id'], // ordered array of list params for default deleteApi
            'retrieve': ['id'], // ordered array of list params for default retrieveApi
            'merge': ['source', 'target'], // ordered array of list params for default mergeApi
            'move': ['source', 'target'], // ordered array of list params for default moveApi
            'create': [], // ordered array of list params for default createApi
            'partialUpdate': [], // ordered array of list params for default updateApi
            'values': {
                'query': undefined,  // default values for list API
                'page': 1,
                'pageSize': 25,
            },
            'typing': {   // optional settings to force type on parameters
                'merge': {
                    'source': 'string',
                    'target': 'string',
                },
            },
        }
      }
    }
  },
  methods: {
    /**
     * constructs OpenAPI Generator function using named parameters
     * @param {string} model string to define which model API to use
     * @param {string} api string to define which of the API functions to use
     * @param {object} options dictionary to define all of the parameters necessary to use API
     */
    genericAPI: function(model, api, options) {
        model = model.toLowerCase()
        // construct settings for this model and this api - values are assigned in order (default is overwritten by api overwritten by model)
        let settings = {...this.api_settings?.default ?? {}, ...this.api_settings?.[this.api_settings?.[model]?.model_type] ?? {}, ...this.api_settings[model]};
        // values and typing are also dicts and need to be merged, 
        settings.values = {...this.api_settings?.default?.values ?? {},
                            ...this.api_settings?.[this.api_settings?.[model]?.model_type]?.values ?? {},
                            ...this.api_settings[model].values}
        settings.typing = {...this.api_settings?.default?.typing?.[api] ?? {},
                            ...this.api_settings?.[this.api_settings?.[model]?.model_type]?.typing?.[api] ?? {},
                            ...this.api_settings[model].typing?.[api]}
        let func = api + settings.name + (this.api_settings.suffix?.[api] ?? '')
        // does model params exist?
        let params = []
        let this_value = undefined
        settings[api].forEach(function (item, index) {
            
            if (Array.isArray(item)) {
                this_value = {}
                for (const [k, v] of Object.entries(options)) { // filters options dict based on valus in array, I'm sure there's a better way to do this
                    if (item.includes(k)) {
                        this_value[k] = v
                    }
                }
            } else {
                this_value = options?.[item] ?? settings.values?.[item] ?? undefined // set the value or apply default
            }
            if (this_value ==='getFunction()') {
                this_value = getFunction(item, settings?.model_type, options)
            }
            if (Object.keys(settings?.typing).includes(item)) {
                switch (settings.typing[item]) {
                    case 'string':
                        if (this_value) {this_value = String(this_value)} 
                        break;
                }
            }
            params.push(this_value)
        });

        let apiClient = new ApiApiFactory()
        return apiClient[func](...params)
    }
  }
}

/*
* Utility functions to calculate default value
* */
export function getFunction(item, model_type, params) {
    if (item==='root' && model_type==='tree') {
        if ((!params?.query ?? undefined) || params?.query?.length == 0) {
            return 0
        }
        return undefined
    }
}


// /*
// * Utility functions to use manipulate nested components
// * */
import Vue from 'vue'
export const CardMixin = {
    methods: {
        findCard: function(id, card_list){
            let card_length = card_list?.length ?? 0
            if (card_length == 0) {
              return false
            }
            let cards = card_list.filter(obj => obj.id == id)
            if (cards.length == 1) {
              return cards[0]
            } else if (cards.length == 0) {
              for (const c of card_list.filter(x => x.show_children == true)) {
                cards = this.findCard(id, c.children)
                if (cards) {
                  return cards
                }
              }
            } else {
              console.log('something terrible happened')
            }
        },
        destroyCard: function(id, card_list) {
            let card = this.findCard(id, card_list)
            let p_id = card?.parent ?? undefined
        
            if (p_id) {
                let parent = this.findCard(p_id, card_list)
                if (parent){
                    Vue.set(parent, 'numchild', parent.numchild - 1)
                    if (parent.show_children) {
                        let idx = parent.children.indexOf(parent.children.find(x => x.id === id))
                        Vue.delete(parent.children, idx)
                    }
                }
            }
            return card_list.filter(x => x.id != id)
          },
        refreshCard: function(obj, card_list){
            let target = {}
            let idx = undefined
            target = this.findCard(obj.id, card_list)
            
            if (target.parent) {
                let parent = this.findCard(target.parent, card_list)
                if (parent) {
                    if (parent.show_children){
                        idx = parent.children.indexOf(parent.children.find(x => x.id === target.id))
                        Vue.set(parent.children, idx, obj)
                    }
                }
            } else {
                idx = card_list.indexOf(card_list.find(x => x.id === target.id))
                console.log(card_list, idx, obj)
                Vue.set(card_list, idx, obj)
            }
        },
    }
}