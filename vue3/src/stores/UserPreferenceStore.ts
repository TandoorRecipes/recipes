import {acceptHMRUpdate, defineStore} from 'pinia'
import {useStorage} from "@vueuse/core";
import {ErrorMessageType, Message, useMessageStore} from "@/stores/MessageStore";
import {ApiApi, UserPreference} from "@/openapi";
import {ref} from "vue";

const DEVICE_SETTINGS_KEY = 'TANDOOR_DEVICE_SETTINGS'

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
    let deviceSettings = useStorage(DEVICE_SETTINGS_KEY, {} as DeviceSettings)
    let userSettings = ref({} as UserPreference)

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

    loadUserSettings()

    return {deviceSettings, userSettings}
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserPreferenceStore, import.meta.hot))
}