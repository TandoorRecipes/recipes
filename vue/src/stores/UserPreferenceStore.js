import {defineStore} from 'pinia'


import {ApiApiFactory, UserPreference} from "@/utils/openapi/api";
import Vue from "vue";
import {StandardToasts} from "@/utils/utils";

const _STALE_TIME_IN_MS = 1000 * 30
const _STORE_ID = 'user_preference_store'

const _LS_DEVICE_SETTINGS = 'TANDOOR_LOCAL_SETTINGS'
const _LS_USER_SETTINGS = 'TANDOOR_USER_SETTINGS'
const _USER_ID = localStorage.getItem('USER_ID')

export const useUserPreferenceStore = defineStore(_STORE_ID, {
    state: () => ({
        data: null,
        updated_at: null,
        currently_updating: false,

        user_settings_loaded_at: new Date(0),
        user_settings: {
            image: null,
            theme: "TANDOOR",
            nav_bg_color: "#ddbf86",
            nav_text_color: "DARK",
            nav_show_logo: true,
            default_unit: "g",
            default_page: "SEARCH",
            use_fractions: false,
            use_kj: false,
            plan_share: [],
            nav_sticky: true,
            ingredient_decimals: 2,
            comments: true,
            shopping_auto_sync: 5,
            mealplan_autoadd_shopping: false,
            food_inherit_default: [],
            default_delay: "4.0000",
            mealplan_autoinclude_related: true,
            mealplan_autoexclude_onhand: true,
            shopping_share: [],
            shopping_recent_days: 7,
            csv_delim: ",",
            csv_prefix: "",
            filter_to_supermarket: false,
            shopping_add_onhand: false,
            left_handed: false,
            show_step_ingredients: true,
            food_children_exist: false,
            locally_updated_at: new Date(0),
        },

        device_settings_initialized: false,
        device_settings_loaded_at: new Date(0),
        device_settings: {
            // shopping
            shopping_show_checked_entries: false,
            shopping_show_delayed_entries: false,
            shopping_show_selected_supermarket_only: false,
            shopping_selected_grouping: 'food.supermarket_category.name',
            shopping_selected_supermarket: null,
            shopping_item_info_created_by: false,
            shopping_item_info_mealplan: false,
            shopping_item_info_recipe: true,
        },
    }),
    getters: {},
    actions: {
        // Device settings (on device settings stored in local storage)
        /**
         * Load device settings from local storage and update state device_settings
         */
        loadDeviceSettings() {
            let s = localStorage.getItem(_LS_DEVICE_SETTINGS)
            if (s !== null) {
                let settings = JSON.parse(s)
                for (s in settings) {
                    Vue.set(this.device_settings, s, settings[s])
                }
            }
            this.device_settings_initialized = true
        },
        /**
         * persist changes to device settings into local storage
         */
        updateDeviceSettings: function () {
            localStorage.setItem(_LS_DEVICE_SETTINGS, JSON.stringify(this.device_settings))
        },
        // ---------------- new methods for user settings
        loadUserSettings: function (allow_cached_results) {
            let s = localStorage.getItem(_LS_USER_SETTINGS)
            if (s !== null) {
                let settings = JSON.parse(s)
                for (s in settings) {
                    Vue.set(this.user_settings, s, settings[s])
                }
                console.log(`loaded local user settings age ${((new Date().getTime()) - this.user_settings.locally_updated_at) / 1000} `)
            }
            if (((new Date().getTime()) - this.user_settings.locally_updated_at) > _STALE_TIME_IN_MS || !allow_cached_results) {
                console.log('refreshing user settings from API')
                let apiClient = new ApiApiFactory()
                apiClient.retrieveUserPreference(localStorage.getItem('USER_ID')).then(r => {
                    for (s in r.data) {
                        if (!(s in this.user_settings) && s !== 'user') {
                            // dont load new keys if no default exists (to prevent forgetting to add defaults)
                            console.error(`API returned UserPreference key "${s}" which has no default in UserPreferenceStore.user_settings.`)
                        } else {
                            Vue.set(this.user_settings, s, r.data[s])
                        }
                    }
                    Vue.set(this.user_settings, 'locally_updated_at', new Date().getTime())
                    localStorage.setItem(_LS_USER_SETTINGS, JSON.stringify(this.user_settings))
                }).catch(err => {
                    this.currently_updating = false
                })
            }

        },
        updateUserSettings: function () {
            let apiClient = new ApiApiFactory()
            apiClient.partialUpdateUserPreference(_USER_ID, this.user_settings).then(r => {
                this.user_settings = r.data
                Vue.set(this.user_settings, 'locally_updated_at', new Date().getTime())
                localStorage.setItem(_LS_USER_SETTINGS, JSON.stringify(this.user_settings))
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch(err => {
                this.currently_updating = false
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        // ----------------
        // User Preferences (database settings stored in user preference model)
        /**
         * gets data from the store either directly or refreshes from API if data is considered stale
         * @returns {UserPreference|*|Promise<axios.AxiosResponse<UserPreference>>}
         */
        getData: function () {
            if (this.isStaleOrEmpty) {
                return this.refreshFromAPI()
            } else {
                return this.data
            }
        },
        /**
         * get data from store. Does not use API, if store is not initialized returns null.
         * @returns {null|UserPreference|*}
         */
        getStaleData: function () {
            return this.data
        },
        /**
         * checks if update timestamp is older than configured stale time interval
         * @returns {boolean} true if data is considered stale and should be updated
         */
        isStale() {
            return this.updated_at === null || ((new Date()) - this.updated_at) > _STALE_TIME_IN_MS;
        },
        /**
         * checks if data of store is empty/not initialized
         * @returns {boolean} true if store is empty
         */
        isEmpty() {
            return this.data === null
        },
        /**
         * checks if store is empty or data is considered stale, see isStale() and isEmpty()
         * @returns {boolean}
         */
        isStaleOrEmpty() {
            return this.isStale() || this.isEmpty()
        },
        /**
         * refreshes store data if isStaleOrEmpty() is true
         * @returns {Promise<axios.AxiosResponse<UserPreference>>} returns promise with data
         */
        updateIfStaleOrEmpty() {
            if (this.isStaleOrEmpty) {
                return this.refreshFromAPI()
            }
        },
        /**
         * refreshes store data from API
         * @returns {Promise<axios.AxiosResponse<UserPreference>>} returns promise with data
         */
        refreshFromAPI() {
            let apiClient = new ApiApiFactory()
            if (!this.currently_updating) {
                this.currently_updating = true
                return apiClient.retrieveUserPreference(localStorage.getItem('USER_ID')).then(r => {
                    this.data = r.data
                    this.updated_at = new Date()
                    this.currently_updating = false

                    this.user_settings = r.data
                    this.user_settings_loaded_at = new Date()

                    return this.data
                }).catch(err => {
                    this.currently_updating = false
                })
            }
        },
    },
})