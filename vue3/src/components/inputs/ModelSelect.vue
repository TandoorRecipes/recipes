<template>
    <v-input>

        <!--TODO resolve-on-load false for now, race condition with model class, make prop once better solution is found -->
        <!-- TODO strange behavior/layering issues with appendTo body, find soltion to make it work -->
        <Multiselect
            :id="id"
            class="material-multiselect z-max"
            :resolve-on-load="false"
            v-model="model"
            :options="search"
            :delay="300"
            :object="true"
            :valueProp="itemValue"
            :label="itemLabel"
            :searchable="true"
            :strict="false"
            :disabled="disabled"
            :mode="mode"
            :can-clear="canClear"
            :can-deselect="canClear"
            :limit="limit"
            placeholder="TODO ADD LOCALIZED PLACEHOLDER"
            noOptionsText="TODO ADD LOCALIZED NO-OPTIONS"
            noResultsText="TODO ADD LOCALIZED NO-RESULTS"
        />

    </v-input>
</template>

<script lang="ts" setup>
import {onMounted, PropType, ref, Ref} from "vue"
import {useDebounceFn} from "@vueuse/core"
import {GenericModel, getModelFromStr} from "@/types/Models"
import Multiselect from '@vueform/multiselect'
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    model: {type: String, required: true},

    id: {type: String, required: false, default: Math.random().toString()},

    itemLabel: {type: String, default: "name"},
    itemValue: {type: String, default: "id"},
    limit: {type: Number, default: 25},

    disabled: {type: Boolean, default: false},
    canClear: {type: Boolean, default: true},

    mode: {type: String as PropType<'single' | 'multiple' | 'tags'>, default: 'single'},

    // not verified

    allowCreate: {type: Boolean, default: false},

    search_on_load: {type: Boolean, default: false},

    placeholder: {type: String, default: undefined},
    parent_variable: {type: String, default: undefined},

    sticky_options: {
        type: Array,
        default() {
            return []
        },
    },


})

const model = defineModel()
const model_class = ref({} as GenericModel<any>)
const items: Ref<Array<any>> = ref([])
const selected_items: Ref<Array<any> | any> = ref(undefined)


/**
 * performs the API request to search for the selected input
 * @param query input to search for on the API
 */
function search(query: string) {
    return model_class.value.list(query).then((r) => {
        return r
    }).catch((err) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {

    })
}

// TODO refactor for new multiselect
function addItem(item: string) {
    console.log("CREATEING NEW with -> ", item)

    model_class.value.create(item).then((createdObj) => {
        useMessageStore().addMessage(MessageType.SUCCESS, 'Created', 5000)
        if (selected_items.value instanceof Array) {
            selected_items.value.push(createdObj)
        } else {
            selected_items.value = createdObj
        }
        items.value.push(createdObj)

    }).catch((err) => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {

    })
}


</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style scoped>
.material-multiselect {
    --ms-line-height: 2.5;
    --ms-bg: rgba(235, 235, 235, 0.75);
    --ms-border-color: 0;
    --ms-border-color-active: 0;
    border-bottom: 4px #0f0f0f;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}
</style>
