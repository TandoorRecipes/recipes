import {acceptHMRUpdate, defineStore} from 'pinia'
import {useStorage} from "@vueuse/core";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {ApiApi, ServerSettings, Space, Unit, UserPreference, UserSpace} from "@/openapi";
import {ShoppingGroupingOptions} from "@/types/Shopping";
import {computed, ComputedRef, ref} from "vue";
import {DeviceSettings} from "@/types/settings";
import {useTheme} from "vuetify";
import {useRouter} from "vue-router";

const DEVICE_SETTINGS_KEY = 'TANDOOR_DEVICE_SETTINGS'
const USER_PREFERENCE_KEY = 'TANDOOR_USER_PREFERENCE'
const SERVER_SETTINGS_KEY = 'TANDOOR_SERVER_SETTINGS'
const ACTIVE_SPACE_KEY = 'TANDOOR_ACTIVE_SPACE'
const USER_SPACES_KEY = 'TANDOOR_USER_SPACES'
const SPACES_KEY = 'TANDOOR_SPACES'

export const useUserPreferenceStore = defineStore('user_preference_store', () => {
    /**
     * settings only saved on device to allow per device customization
     */
    let deviceSettings = useStorage(DEVICE_SETTINGS_KEY, getDefaultDeviceSettings(), localStorage, {mergeDefaults: true})
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
     * list of user spaces the user has access to and the relevant permissions, cache in local storage in case application is started offline
     */
    let userSpaces = useStorage(USER_SPACES_KEY, [] as UserSpace[])
    /**
     * list of spaces the user has access and their space settings/Data, cache in local storage in case application is started offline
     */
    let spaces = useStorage(SPACES_KEY, [] as Space[])
    /**
     * some views can be viewed without authentication, this variable centrally detects the authentication state by the response (403) of the settings views
     */
    let isAuthenticated = ref(false)

    /**
     * complete refresh of all data from server completed
     */
    const initCompleted = ref(false)

    /**
     * load the default unit to the store for easy use in editors and more
     */
    const defaultUnitObj = ref<Unit | null>(null)

    const theme = useTheme()
    const router = useRouter()

    /**
     * holds the active user space if there is one or null if not
     */
    let activeUserSpace: ComputedRef<null | UserSpace> = computed(() => {
        let userSpace: null | UserSpace = null
        userSpaces.value.forEach(us => {
            if (us.space == activeSpace.value.id) {
                userSpace = us
            }
        })
        return userSpace
    })

    /**
     * retrieve user settings from DB
     */
    function loadUserSettings() {
        console.log('loading user settings from DB')
        let api = new ApiApi()
        return api.apiUserPreferenceList().then(r => {
            if (r.length == 1) {
                userSettings.value = r[0]
                isAuthenticated.value = true
                updateTheme()
                loadDefaultUnit()
            } else {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, r)
            }
        }).catch(err => {
            if (err.response.status != 403) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }
        })
    }

    /**
     * load the default unit from the backend
     * TODO migrate to nested serializer but requires actually creating the unit as currently its possible the default unit does not exist yet
     */
    function loadDefaultUnit() {
        let api = new ApiApi()

        if (userSettings.value.defaultUnit) {
            api.apiUnitList({query: userSettings.value.defaultUnit}).then(r => {
                r.results.forEach(u => {
                    if (u.name == userSettings.value.defaultUnit) {
                        defaultUnitObj.value = u
                    }
                })
            }).catch(err => {
                if (err.response.status != 403) {
                    useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
                }
            })
        }
    }

    /**
     * persist changes to user settings to DB
     */
    function updateUserSettings(silent: boolean = false) {
        let api = new ApiApi()

        return api.apiUserPreferencePartialUpdate({user: userSettings.value.user.id!, patchedUserPreference: userSettings.value}).then(r => {
            userSettings.value = r
            updateTheme()
            if (!silent) {
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            }
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }

    /**
     * retrieves server settings from API
     */
    function loadServerSettings() {
        let api = new ApiApi()
        return api.apiServerSettingsCurrentRetrieve().then(r => {
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
        return api.apiSpaceCurrentRetrieve().then(r => {
            activeSpace.value = r
        }).catch(err => {
            if (err.response.status != 403) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }
        })
    }

    /**
     * load user spaces (permission mapping ot space)
     */
    function loadUserSpaces() {
        let api = new ApiApi()
        return api.apiUserSpaceAllPersonalList().then(r => {
            userSpaces.value = r.results
        }).catch(err => {
            if (err.response.status != 403) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }
        })
    }

    /**
     * list all spaces (with their data) a user has access to
     */
    // TODO maybe change userspace api to include space as nested property to make this call redundant
    function loadSpaces() {
        let api = new ApiApi()

        return api.apiSpaceList().then(r => {
            spaces.value = r.results
        }).catch(err => {
            if (err.response.status != 403) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }
        })
    }

    /**
     * switch to the given space
     */
    function switchSpace(space: Space) {
        let api = new ApiApi()

        api.apiSwitchActiveSpaceRetrieve({spaceId: space.id!}).then(r => {
            loadActiveSpace().then(() => {
                router.push({name: 'StartPage'}).then(() => {
                    location.reload()
                })
            })
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    /**
     * resets all device settings to their default value
     */
    function resetDeviceSettings() {
        deviceSettings.value = getDefaultDeviceSettings()
    }

    /**
     * returns a default device settings object
     */
    function getDefaultDeviceSettings(): DeviceSettings {
        return {
            shopping_show_checked_entries: false,
            shopping_show_delayed_entries: false,
            shopping_show_selected_supermarket_only: false,
            shopping_selected_grouping: ShoppingGroupingOptions.CATEGORY,
            shopping_selected_supermarket: null,
            shopping_item_info_created_by: false,
            shopping_item_info_mealplan: true,
            shopping_item_info_recipe: true,
            shopping_input_autocomplete: true,
            shopping_show_debug: false,

            mealplan_displayPeriod: 'week',
            mealplan_displayPeriodCount: 3,
            mealplan_startingDayOfWeek: 1,
            mealplan_displayWeekNumbers: true,

            recipe_mergeStepOverview: false,

            search_itemsPerPage: 50,
            search_viewMode: 'grid',
            search_visibleFilters: [],

            start_showMealPlan: true,

            general_tableItemsPerPage: 10,
            general_closedHelpAlerts: [],
        }
    }

    /**
     * applies user settings regarding themes/styling
     */
    function updateTheme() {
        if (userSettings.value.theme == 'TANDOOR') {
            theme.change('light')
        } else if (userSettings.value.theme == 'TANDOOR_DARK') {
            theme.change('dark')
        }
    }

    function init() {
        const promises = [] as Promise<any>[]
        promises.push(loadUserSettings())
        promises.push(loadServerSettings())
        promises.push(loadActiveSpace())
        promises.push(loadUserSpaces())
        promises.push(loadSpaces())
        updateTheme()

        return Promise.allSettled(promises).then(() => {
            initCompleted.value = true
        })
    }

    return {
        init,
        deviceSettings,
        userSettings,
        serverSettings,
        activeSpace,
        userSpaces,
        spaces,
        activeUserSpace,
        isAuthenticated,
        initCompleted,
        defaultUnitObj,
        loadUserSettings,
        loadServerSettings,
        updateUserSettings,
        switchSpace,
        resetDeviceSettings,
        updateTheme,
    }
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserPreferenceStore, import.meta.hot))
}