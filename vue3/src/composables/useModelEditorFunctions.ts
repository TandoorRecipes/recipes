import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {onBeforeMount, PropType, ref} from "vue";
import {GenericModel, getGenericModelFromString} from "@/types/Models";
import {useI18n} from "vue-i18n";

// TODO type emit parameter (https://mokkapps.de/vue-tips/emit-event-from-composable)
// TODO alternatively there seems to be a getContext method to get the calling context (good practice?)

export function useModelEditorFunctions<T>(modelName: string, emit: any) {

    const loading = ref(false)
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
     * if given an object or id, sets up the editingObj with that item or loads the data from the API using the ID
     * if both item and itemId are undefined return false to indicate that no editingObj has been initialized
     * @param item item object to set as editingObj
     * @param itemId id of object to be retrieved and set as editingObj
     */
    function setupState(item: T | null, itemId: number | undefined) {
        if (item === null && itemId === undefined) {
            if (modelClass.value.model.disableCreate) {
                throw Error('Trying to use a ModelEditor without an item and a model that does not allow object creation!')
            }
            return false
        } else if (item !== null) {
            editingObj.value = item
        } else if (itemId !== undefined) {
            loading.value = true
            modelClass.value.retrieve(itemId).then((r: T) => {
                editingObj.value = r
            }).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        }

        return true
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