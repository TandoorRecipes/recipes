import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {onBeforeMount, onMounted, ref, watch} from "vue";
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models";
import {useI18n} from "vue-i18n";
import {ResponseError} from "@/openapi";
import {getNestedProperty} from "@/utils/utils";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useTitle} from "@vueuse/core";

// TODO type emit parameter (https://mokkapps.de/vue-tips/emit-event-from-composable)
// TODO alternatively there seems to be a getContext method to get the calling context (good practice?)

export function useModelEditorFunctions<T>(modelName: EditorSupportedModels, emit: any) {

    const loading = ref(true)
    const editingObj = ref({} as T)
    const modelClass = ref({} as GenericModel)

    const editingObjChanged = ref(false)

    const {t} = useI18n()
    const title = useTitle()

    /**
     * watch editing object to detect changes
     * set editingObjChanged to true when a change is detected
     */
    watch(() => editingObj.value, (newValue, oldValue) => {
        if (Object.keys(oldValue).length > 0) {
            editingObjChanged.value = true
        }
    }, {deep: true})

    /**
     * emit the changed state of the object to parent components for display or navigation blocking
     */
    watch(() => editingObjChanged.value, () => {
        emit('changedState', editingObjChanged.value)
    })

    /**
     * before mounting the component UI set the model class based on the given model name
     */
    onBeforeMount(() => {
        modelClass.value = getGenericModelFromString(modelName, t)
    })

    onMounted(() => {
        setupPageLeaveWarning()
    })

    /**
     * add event listener to page unload event to prevent accidentally closing with unsaved changes
     */
    function setupPageLeaveWarning() {
        window.onbeforeunload = (event) => {
            if (editingObjChanged.value) {
                event.returnValue = "this_string_cant_be_empty_because_of_firefox"
                return "this_string_cant_be_empty_because_of_firefox"
            }
        }
    }

    /**
     * apply the defaults to the item given in the itemsDefaults value of the setupState function
     * @param itemDefaults
     */
    function applyItemDefaults(itemDefaults: T) {
        if (Object.keys(itemDefaults).length > 0) {
            Object.keys(itemDefaults).forEach(k => {
                editingObj.value[k] = itemDefaults[k]
            })
        }
    }

    /**
     * if given an item or itemId, sets up the editingObj with that item or loads the data from the API using the ID
     * once finished loading updates the loading state to false, indicating finished initialization
     *
     * @throws Error if an error if neither item or itemId are given and create is disabled
     * @param item item object to set as editingObj
     * @param itemId id of object to be retrieved and set as editingObj
     * @param options optional parameters
     *                      newItemFunction: called when no item is given. When overriding you must implement applyItemDefaults if you want them to be applied.
     *                      existingItemFunction: called when some kind of item is passed
     * @return promise resolving to either the editingObj or undefined if errored
     */
    function setupState(item: T | null, itemId: number | string | undefined, options: {
                            itemDefaults?: T,
                            newItemFunction?: () => void,
                            existingItemFunction?: () => void,
                        } = {}
    ): Promise<T | undefined> {

        const {
            itemDefaults = {} as T,
            newItemFunction = () => {
                applyItemDefaults(itemDefaults)
            },
            existingItemFunction = () => {
            }
        } = options

        if (item === null && (itemId === undefined || itemId == '')) {
            // neither item nor itemId given => new item
            if (modelClass.value.model.disableCreate) {
                throw Error('Trying to use a ModelEditor without an item and a model that does not allow object creation!')
            }

            newItemFunction()

            loading.value = false
            title.value = editingObjName()
            return Promise.resolve(editingObj.value)
        } else if (item !== null) {
            // item is given so return that
            editingObj.value = item
            existingItemFunction()
            loading.value = false
            title.value = editingObjName()
            return Promise.resolve(editingObj.value)
        } else if (itemId !== undefined && itemId != '') {
            // itemId is given => fetch from server and return item
            loading.value = true

            // itemId might be a string (router parameter) or number (component prop)
            if (typeof itemId == "string") {
                itemId = Number(itemId)
            }
            return modelClass.value.retrieve(itemId).then((r: T) => {
                editingObj.value = r
                existingItemFunction()
                title.value = editingObjName()
                return editingObj.value
            }).catch((err: any) => {
                if (err instanceof ResponseError && err.response.status == 404) {
                    useMessageStore().addPreparedMessage(PreparedMessage.NOT_FOUND)
                } else {
                    useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
                }
                return Promise.resolve(undefined)
            }).finally(() => {
                loading.value = false
            })
        }
        return Promise.resolve(undefined)
    }

    /**
     * checks if the object has the ID property, if yes its an update if not its a new object
     */
    function isUpdate() {
        return !!editingObj.value.id;
    }

    /**
     * return the display name for the editingObj instance by concatenating the attributes
     * given in the model type together
     */
    function editingObjName(): string {
        if (!isUpdate()) {
            return t('New') + ' - ' + t(modelClass.value.model.localizationKey)
        }

        let name = ''

        if (editingObj.value.id) {
            name =  modelClass.value.getLabel(editingObj.value)
        }

        if (name == '') {
            console.warn('No string keys given model type ', modelName)
            return t(modelClass.value.model.localizationKey)
        }

        return name
    }

    /**
     * saves the edited object in the database
     */
    function saveObject() {
        loading.value = true
        if (isUpdate()) {
            return modelClass.value.update(editingObj.value.id, editingObj.value).then((r: T) => {
                emit('save', r)
                editingObj.value = r
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
                return r
            }).catch((err: any) => {
                console.error(err)
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                editingObjChanged.value = false
                loading.value = false
            })
        } else {
            return modelClass.value.create(editingObj.value).then((r: T) => {
                emit('create', r)
                editingObj.value = r
                useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
                return r
            }).catch((err: any) => {
                console.error(err)
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            }).finally(() => {
                editingObjChanged.value = false
                loading.value = false
            })
        }
    }

    /**
     * deletes the editing object from the database
     */
    function deleteObject() {
        loading.value = true

        return modelClass.value.destroy(editingObj.value.id).then((r: any) => {
            emit('delete', editingObj.value)
            editingObj.value = {} as T
        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            editingObjChanged.value = false
            loading.value = false
        })
    }

    return {setupState, saveObject, deleteObject, isUpdate, editingObjName, applyItemDefaults, loading, editingObj, editingObjChanged, modelClass}
}