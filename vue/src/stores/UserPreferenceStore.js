import {defineStore} from 'pinia'


import {ApiApiFactory} from "@/utils/openapi/api";

const _STALE_TIME_IN_MS = 1000 * 30
const _STORE_ID = 'user_preference_store'
export const useUserPreferenceStore = defineStore(_STORE_ID, {
    state: () => ({
        data: null,
        updated_at: null,
    }),
    getters: {

    },
    actions: {
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
            return apiClient.retrieveUserPreference(localStorage.getItem('USER_ID')).then(r => {
                this.data = r.data
                this.updated_at = new Date()
                return this.data
            })
        },
    },
})