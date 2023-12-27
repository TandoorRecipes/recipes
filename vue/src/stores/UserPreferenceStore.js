import {defineStore} from 'pinia'


import {ApiApiFactory} from "@/utils/openapi/api";
import Vue from "vue";

const _STALE_TIME_IN_MS = 1000 * 30
const _STORE_ID = 'user_preference_store'

const _LOCAL_STORAGE_KEY = 'TANDOOR_LOCAL_SETTINGS'


export const useUserPreferenceStore = defineStore(_STORE_ID, {
    state: () => ({
        data: null,
        updated_at: null,
        currently_updating: false,

        device_settings_initialized: false,
        device_settings: {
            // shopping
            shopping_show_checked_entries: false,
            shopping_show_delayed_entries: false,
            shopping_show_selected_supermarket_only: false,
            shopping_selected_grouping: 'food.supermarket_category.name',
            shopping_selected_supermarket: null,
            shopping_item_info_created_by: false,
            shopping_item_info_mealplan: true,
            shopping_item_info_recipe: true,
        },
    }),
    getters: {
        get_device_settings: function () {
            if (!this.device_settings_initialized) {
                // stupid hack to initialize device settings variable when store loads
                this.loadDeviceSettings()
                this.device_settings_initialized = true
            }
            return this.device_settings
        }
    },
    actions: {
        // Device settings (on device settings stored in local storage)
        /**
         * Load device settings from local storage and update state device_settings
         */
        loadDeviceSettings() {
            let s = localStorage.getItem(_LOCAL_STORAGE_KEY)
            if (!(s === null || s === {})) {
                let settings = JSON.parse(s)
                for (s in settings) {
                    Vue.set(this.device_settings, s, settings[s])
                }
            }
        },
        /**
         * persist changes to device settings into local storage
         */
        updateDeviceSettings: function () {
            localStorage.setItem(_LOCAL_STORAGE_KEY, JSON.stringify(this.device_settings))
        },
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
                    return this.data
                }).catch(err => {
                    this.currently_updating = false
                })
            }
        },
    },
})