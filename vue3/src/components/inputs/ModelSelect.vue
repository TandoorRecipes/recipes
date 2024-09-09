<template>
    <v-input :hint="hint" persistent-hint :label="label">

        <!-- TODO resolve-on-load false for now, race condition with model class, make prop once better solution is found -->
        <!-- TODO strange behavior/layering issues with appendTo body, find solution to make it work -->
        <!-- TODO label is not showing for some reason -->

        <Multiselect
            :id="id"
            class="material-multiselect z-max"
            :resolve-on-load="false"
            v-model="model"
            :options="search"
            :on-create="createObject"
            :createOption="allowCreate"
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
            :placeholder="$t('Search')"
            :noOptionsText="$t('No_Results')"
            :noResultsText="$t('No_Results')"
        />

    </v-input>
</template>

<script lang="ts" setup>
import {onMounted, PropType, ref} from "vue"
import {GenericModel, getModelFromStr} from "@/types/Models"
import Multiselect from '@vueform/multiselect'
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";

const emit = defineEmits(['update:modelValue', 'create'])

const props = defineProps({
    model: {type: String, required: true},

    id: {type: String, required: false, default: Math.random().toString()},

    itemLabel: {type: String, default: "name"},
    itemValue: {type: String, default: "id"},
    limit: {type: Number, default: 25},

    disabled: {type: Boolean, default: false},
    canClear: {type: Boolean, default: true},

    mode: {type: String as PropType<'single' | 'multiple' | 'tags'>, default: 'single'},

    allowCreate: {type: Boolean, default: false},

    placeholder: {type: String, default: undefined},
    noOptionsText: {type: String, default: undefined},
    noResultsText: {type: String, default: undefined},

    label: {type: String, default: ''},
    hint: {type: String, default: ''},

    // not verified
    search_on_load: {type: Boolean, default: false},


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

/**
 * create instance of model class when mounted
 */
onMounted(() => {
    model_class.value = getModelFromStr(props.model)
})

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

/**
 * handle new object being created
 *
 * @param object object with two keys (itemValue/itemLabel) both having the string of the newly created item (query) as a value {<itemValue>: query, <itemLabel>: query}
 * @param select$ reference to multiselect instance
 */
async function createObject(object: any, select$: Multiselect) {
    if (model_class.value.canCreate()) {
        console.log("CREATING NEW with -> ", object)

        emit('create', object)

        return await model_class.value.create(object[props.itemLabel]).then((createdObj) => {
            useMessageStore().addMessage(MessageType.SUCCESS, 'Created', 5000, createdObj)
            return createdObj
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    } else {
        console.error('Cannot create using model, should probably set can_create prop to false or fix model ', model_class)
    }

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
