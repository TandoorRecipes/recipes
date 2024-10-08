import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {onBeforeMount, ref} from "vue";
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models";
import {useI18n} from "vue-i18n";
import {ResponseError} from "@/openapi";

// TODO type emit parameter (https://mokkapps.de/vue-tips/emit-event-from-composable)
// TODO alternatively there seems to be a getContext method to get the calling context (good practice?)

export function useModelEditorFunctions<T>(modelName: EditorSupportedModels, emit: any) {

    const loading = ref(true)
    const editingObj = ref({} as T)
    const modelClass = ref({} as GenericModel)

    const {t} = useI18n()

    /**
     * before mounting the component UI set the model class based on the given model name
     */
    onBeforeMount(() => {
        modelClass.value = getGenericModelFromString(modelName, t)
    })

    /**
     * if given an item or itemId, sets up the editingObj with that item or loads the data from the API using the ID
     * once finished loading updates the loading state to false, indicating finished initialization
     *
     * @throws Error if an error if neither item or itemId are given and create is disabled
     * @param item item object to set as editingObj
     * @param itemId id of object to be retrieved and set as editingObj
     * @param newItemFunction optional function to execute if no object is given (by either item or itemId)
     * @param existingItemFunction optional function to execute once the existing item was loaded (instantly with item, async with itemId)
     * @return promise resolving to either the editingObj or undefined if errored
     */
    function setupState(item: T | null, itemId: number | string | undefined,
                        newItemFunction: () => void = () => {
                        },
                        existingItemFunction: () => void = () => {
                        }): Promise<T | undefined> {
        if (item === null && (itemId === undefined || itemId == '')) {
            // neither item nor itemId given => new item

            if (modelClass.value.model.disableCreate) {
                throw Error('Trying to use a ModelEditor without an item and a model that does not allow object creation!')
            }

            newItemFunction()
            loading.value = false
            return Promise.resolve(editingObj.value)
        } else if (item !== null) {
            // item is given so return that
            editingObj.value = item
            existingItemFunction()
            loading.value = false
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
                return editingObj.value
            }).catch((err: any) => {
                if (err instanceof ResponseError && err.response.status == 404) {
                    useMessageStore().addPreparedMessage(PreparedMessage.NOT_FOUND)
                } else {
                    useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
                }
                return undefined
            }).finally(() => {
                loading.value = false
            })
        }
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
            modelClass.value.model.toStringKeys.forEach(key => {
                name += ' ' + editingObj.value[key]
            })
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
            modelClass.value.update(editingObj.value.id, editingObj.value).then((r: T) => {
                emit('save', r)
                editingObj.value = r
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            }).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        } else {
            modelClass.value.create(editingObj.value).then((r: T) => {
                emit('create', r)
                editingObj.value = r
                useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
            }).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        }
    }

    /**
     * deletes the editing object from the database
     */
    function deleteObject() {
        modelClass.value.destroy(editingObj.value.id).then((r: any) => {
            emit('delete', editingObj)
            editingObj.value = {} as T
        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }

    return {setupState, saveObject, deleteObject, isUpdate, editingObjName, loading, editingObj, modelClass}
}