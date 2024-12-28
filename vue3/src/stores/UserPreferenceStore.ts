import {acceptHMRUpdate, defineStore} from 'pinia'
import {useStorage} from "@vueuse/core";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {ApiApi, ServerSettings, Space, Supermarket, UserPreference} from "@/openapi";
import {ShoppingGroupingOptions} from "@/types/Shopping";

const DEVICE_SETTINGS_KEY = 'TANDOOR_DEVICE_SETTINGS'
const USER_PREFERENCE_KEY = 'TANDOOR_USER_PREFERENCE'
const SERVER_SETTINGS_KEY = 'TANDOOR_SERVER_SETTINGS'
const ACTIVE_SPACE_KEY = 'TANDOOR_ACTIVE_SPACE'

class DeviceSettings {
    shopping_show_checked_entries = false
    shopping_show_delayed_entries = false
    shopping_show_selected_supermarket_only = false
    shopping_selected_grouping = ShoppingGroupingOptions.CATEGORY
    shopping_selected_supermarket: Supermarket|null = null
    shopping_item_info_created_by = false
    shopping_item_info_mealplan = true
    shopping_item_info_recipe = true
    shopping_show_debug = false

    mealplan_displayPeriod = 'week'
    mealplan_displayPeriodCount = 3
    mealplan_startingDayOfWeek = 1
    mealplan_displayWeekNumbers = true

    general_tableItemsPerPage = 10
    general_closedHelpAlerts: String[] = []
}

export const useUserPreferenceStore = defineStore('user_preference_store', () => {
    /**
     * settings only saved on device to allow per device customization
     */
    let deviceSettings = useStorage(DEVICE_SETTINGS_KEY, new DeviceSettings(), localStorage, {mergeDefaults: true})
    /**
     * database user settings, cache in local storage in case application is started offline
     */
    let userSettings = useStorage(USER_PREFERENCE_KEY, {} as UserPreference)
    /**
     * some defaults and values returned by server
     */
    let serverSettings = useStorage(SERVER_SETTINGS_KEY, {} as ServerSettings)
    /**
     * database user settings, cache in local storage in case application is started offline
     */
    let activeSpace = useStorage(ACTIVE_SPACE_KEY, {} as Space)

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

    /**
     * persist changes to user settings to DB
     */
    function updateUserSettings() {
        let api = new ApiApi()

        api.apiUserPreferencePartialUpdate({user: userSettings.value.user.id!, patchedUserPreference: userSettings.value}).then(r => {
            userSettings.value = r
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }

    /**
     * retrieves server settings from API
     */
    function loadServerSettings() {
        let api = new ApiApi()
        api.apiServerSettingsCurrentRetrieve().then(r => {
            serverSettings.value = r
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    /**
     * load data for currently active space
     */
    function loadActiveSpace() {
        let api = new ApiApi()
        api.apiSpaceCurrentRetrieve().then(r => {
            activeSpace.value = r
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    /**
     * switch to the given space
     */
    function switchSpace(space: Space) {
        let api = new ApiApi()

        api.apiSwitchActiveSpaceRetrieve({spaceId: space.id}).then(r => {
            loadActiveSpace()
            location.reload()
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    /**
     * resets all device settings to their default value
     */
    function resetDeviceSettings(){
        deviceSettings.value = new DeviceSettings()
    }

    // always load user settings on first initialization of store
    loadUserSettings()
    // always load server settings on first initialization of store
    loadServerSettings()
    // always load active space on first initialization of store
    loadActiveSpace()

    return {deviceSettings, userSettings, serverSettings, activeSpace, loadUserSettings, loadServerSettings, updateUserSettings, switchSpace, resetDeviceSettings}
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserPreferenceStore, import.meta.hot))
}