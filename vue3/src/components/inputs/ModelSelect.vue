<template>
    <!-- TODO label is not showing for some reason, for now in placeholder -->
    <!-- TODO support density prop -->
    <v-input :hint="props.hint" persistent-hint :label="props.label" class="">

        <!-- TODO resolve-on-load false for now, race condition with model class, make prop once better solution is found -->
        <!-- TODO strange behavior/layering issues with appendTo body, find solution to make it work -->

        <Multiselect
            :id="props.id"
            :ref="`ref_${props.id}`"
            class="material-multiselect z-max"
            :resolve-on-load="searchOnLoad"
            v-model="model"
            :options="search"
            :on-create="createObject"
            :createOption="props.allowCreate"
            :delay="300"
            :object="true"
            :valueProp="props.itemValue"
            :label="props.itemLabel"
            :searchable="true"
            :strict="false"
            :disabled="props.disabled"
            :mode="props.mode"
            :can-clear="props.canClear"
            :can-deselect="props.canClear"
            :limit="props.limit"
            :placeholder="$t(modelClass.model.localizationKey)"
            :noOptionsText="$t('No_Results')"
            :noResultsText="$t('No_Results')"
            :loading="loading"
            @open="multiselect.refreshOptions()"
        />

    </v-input>
</template>

<script lang="ts" setup>
import {onBeforeMount, onMounted, PropType, ref, useTemplateRef} from "vue"
import {GenericModel, getGenericModelFromString} from "@/types/Models"
import Multiselect from '@vueform/multiselect'
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const emit = defineEmits(['update:modelValue', 'create'])

const props = defineProps({
    model: {type: String, required: true},

    id: {type: String, required: false, default: Math.floor(Math.random()*10000).toString()},

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

    searchOnLoad: {type: Boolean, default: false},
})

const model = defineModel()
const modelClass = ref({} as GenericModel)
const loading = ref(false)

const multiselect = useTemplateRef(`ref_${props.id}`)

/**
 * create instance of model class when mounted
 */
onBeforeMount(() => {
    modelClass.value = getGenericModelFromString(props.model, t)
})

/**
 * performs the API request to search for the selected input
 * @param query input to search for on the API
 */
function search(query: string) {
    console.log('search called')
    loading.value = true
    return modelClass.value.list({query: query, page: 1, pageSize: 25}).then((r: any) => {
        if (modelClass.value.model.isPaginated) {
            return r.results
        } else {
            return r
        }
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * handle new object being created
 *
 * @param object object with two keys (itemValue/itemLabel) both having the string of the newly created item (query) as a value {<itemValue>: query, <itemLabel>: query}
 * @param select$ reference to multiselect instance
 */
async function createObject(object: any, select$: Multiselect) {
    return await modelClass.value.create({name: object[props.itemLabel]}).then((createdObj : any) => {
        useMessageStore().addMessage(MessageType.SUCCESS, 'Created', 5000, createdObj)
        emit('create', object)
        return createdObj
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}


</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style>
.material-multiselect {
    --ms-line-height: 2.5;
    --ms-bg: rgba(235, 235, 235, 0.75);
    --ms-border-color: 0;
    --ms-border-color-active: 0;
    border-bottom: 4px #0f0f0f;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.multiselect-tag {
    background-color: #b98766 !important;
}
</style>
