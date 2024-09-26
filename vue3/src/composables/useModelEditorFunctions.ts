import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {computed, onBeforeMount, ref} from "vue";
import {GenericModel} from "@/types/Models";

// TODO type emit parameter (https://mokkapps.de/vue-tips/emit-event-from-composable)
// TODO alternatively there seems to be a getContext method to get the calling context

export function useModelEditorFunctions<T>(emit: any) {

    const loading = ref(false)
    const editingObj = ref({} as T)

    onBeforeMount(() => {
        console.log('COMPOSABLE OF TYPE ', typeof editingObj)
    })

    /**
     * saves the edited object in the database
     */
    function saveObject(modelClass: GenericModel, obj: any) {
        loading.value = true
        if (obj.id) {
            modelClass.update(obj.id, obj).then((r: any) => {
                emit('save', r)
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            }).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        } else {
            modelClass.create(obj).then((r: any) => {
                emit('create', r)
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
    function deleteObject(modelClass: GenericModel, obj: any) {
        modelClass.destroy(obj.id).then((r: any) => {
            emit('delete', obj)
        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }

    return {emit, saveObject, deleteObject, loading, editingObj}
}