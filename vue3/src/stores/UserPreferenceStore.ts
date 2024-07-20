import {acceptHMRUpdate, defineStore} from 'pinia'
import {useStorage} from "@vueuse/core";
import {ErrorMessageType, Message, useMessageStore} from "@/stores/MessageStore";
import {ApiApi, UserPreference} from "@/openapi";
import {ref} from "vue";

const DEVICE_SETTINGS_KEY = 'TANDOOR_DEVICE_SETTINGS'
const USER_PREFERENCE_KEY = 'TANDOOR_USER_PREFERENCE'

class DeviceSettings {

    shopping_show_checked_entries = false
    shopping_show_delayed_entries = false
    shopping_show_selected_supermarket_only = false
    shopping_selected_grouping = 'food.supermarket_category.name'
    shopping_selected_supermarket = null
    shopping_item_info_created_by = false
    shopping_item_info_mealplan = false
    shopping_item_info_recipe = true

}

export const useUserPreferenceStore = defineStore('user_preference_store', () => {
    /**
     * settings only saved on device to allow per device customization
     */
    let deviceSettings = useStorage(DEVICE_SETTINGS_KEY, {} as DeviceSettings)
    /**
     * database user settings, cache in local storage in case application is started offline
     */
    let userSettings = useStorage(USER_PREFERENCE_KEY, {} as UserPreference)

    /**
     * retrieve user settings from DB
     */
    function loadUserSettings() {
        console.log('loading user settings from DB')
        let api = new ApiApi()
        api.apiUserPreferenceList().then(r => {
            if (r.length == 1) {
                userSettings.value = r[0]
            } else {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, r)
            }
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    // always load user settings on first initialization of store
    loadUserSettings()

    return {deviceSettings, userSettings, loadUserSettings}
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserPreferenceStore, import.meta.hot))
}